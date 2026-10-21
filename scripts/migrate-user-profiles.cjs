"use strict";

const { applicationDefault, initializeApp } = require("firebase-admin/app");
const { FieldPath, FieldValue, getFirestore } = require("firebase-admin/firestore");

const PASSWORD_LIKE_KEY =
  /^(?:password|passwd|pass|pwd|mot[_\s-]?de[_\s-]?passe|credentials?)(?:[_-]?(?:hash|encrypted|salt))?$/i;
const args = process.argv.slice(2);
const apply = args.includes("--apply");

function getOption(name) {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function findSensitivePaths(value, path = [], results = { paths: [], unsupported: false }, inArray = false) {
  if (Array.isArray(value)) {
    for (const item of value) {
      findSensitivePaths(item, path, results, true);
    }
    return results;
  }

  if (!value || typeof value !== "object") return results;

  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];
    if (PASSWORD_LIKE_KEY.test(key)) {
      if (inArray) results.unsupported = true;
      else results.paths.push(nextPath);
      continue;
    }
    findSensitivePaths(child, nextPath, results, inArray);
  }
  return results;
}

async function main() {
  const projectId = getOption("project-id")
    || process.env.GOOGLE_CLOUD_PROJECT
    || process.env.GCLOUD_PROJECT;
  const confirmation = getOption("confirm-project-id");

  if (!projectId) {
    throw new Error("missing-project-id");
  }
  if (apply && confirmation !== projectId) {
    throw new Error("apply-requires-matching-confirm-project-id");
  }

  const app = initializeApp(
    { credential: applicationDefault(), projectId },
    `user-profile-migration-${Date.now()}`
  );

  try {
    const db = getFirestore(app);
    const snapshot = await db.collection("users").get();
    const plans = snapshot.docs.map((profileDoc) => {
      const data = profileDoc.data();
      const sensitive = findSensitivePaths(data);
      return {
        ref: profileDoc.ref,
        id: profileDoc.id,
        missingActif: !Object.prototype.hasOwnProperty.call(data, "actif"),
        passwordPaths: sensitive.paths,
        unsupportedArrayFields: sensitive.unsupported,
      };
    });

    const affected = plans.filter(
      (plan) => plan.missingActif || plan.passwordPaths.length > 0 || plan.unsupportedArrayFields
    );
    const unsupported = affected.filter((plan) => plan.unsupportedArrayFields);
    const passwordFieldCount = affected.reduce(
      (total, plan) => total + plan.passwordPaths.length,
      0
    );

    console.log(JSON.stringify({
      mode: apply ? "APPLY" : "DRY RUN — no writes",
      projectId,
      totalProfiles: snapshot.size,
      profilesMissingActif: plans.filter((plan) => plan.missingActif).length,
      passwordLikeFieldsToDelete: passwordFieldCount,
      affectedProfileIds: affected.map((plan) => plan.id),
      profilesWithPasswordFieldsInsideArrays: unsupported.map((plan) => plan.id),
    }, null, 2));

    if (!apply) {
      console.log("Simulation only. To write later, pass --apply and --confirm-project-id=<same-project-id>.");
      return;
    }

    if (unsupported.length > 0) {
      throw new Error("password-like-fields-inside-arrays-require-manual-review");
    }

    const writes = affected.map((plan) => {
      const updates = [];
      if (plan.missingActif) updates.push(new FieldPath("actif"), true);
      for (const path of plan.passwordPaths) {
        updates.push(new FieldPath(...path), FieldValue.delete());
      }
      return { ref: plan.ref, updates };
    });

    // Firestore batches are limited to 500 writes; use a smaller safety margin.
    for (let start = 0; start < writes.length; start += 400) {
      const batch = db.batch();
      for (const write of writes.slice(start, start + 400)) {
        batch.update(write.ref, ...write.updates);
      }
      await batch.commit();
    }

    console.log(JSON.stringify({
      completed: true,
      updatedProfiles: writes.length,
      activeFieldsAdded: plans.filter((plan) => plan.missingActif).length,
      passwordLikeFieldsDeleted: passwordFieldCount,
    }, null, 2));
  } finally {
    await app.delete();
  }
}

main().catch((error) => {
  // Do not print document contents or credential material in error output.
  console.error(`User profile migration stopped (${error.code || error.message || "unknown-error"}).`);
  process.exitCode = 1;
});
