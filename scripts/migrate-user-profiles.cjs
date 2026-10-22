"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { cert, initializeApp } = require("firebase-admin/app");
const { FieldPath, FieldValue, getFirestore } = require("firebase-admin/firestore");

const PASSWORD_LIKE_KEY =
  /^(?:password|passwd|pass|pwd|mot[_\s-]?de[_\s-]?passe|credentials?)(?:[_-]?(?:hash|encrypted|salt))?$/i;
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const listUserIdsNotUidLength = args.includes("--list-user-ids-not-28");

function getOption(name) {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function loadServiceAccount(serviceAccountPath) {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  } catch {
    throw new Error("invalid-service-account-file");
  }

  if (
    !serviceAccount
    || typeof serviceAccount.project_id !== "string"
    || typeof serviceAccount.client_email !== "string"
    || typeof serviceAccount.private_key !== "string"
  ) {
    throw new Error("invalid-service-account-file");
  }
  return serviceAccount;
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
  if (apply && listUserIdsNotUidLength) {
    const error = new Error("list-user-ids-mode-is-read-only");
    error.code = "list-user-ids-mode-is-read-only";
    throw error;
  }

  const serviceAccountPath = path.resolve(
    getOption("service-account")
      || path.join(__dirname, "..", ".secrets", "firebase-admin-service-account.json")
  );
  const serviceAccount = loadServiceAccount(serviceAccountPath);
  const projectId = getOption("project-id") || serviceAccount.project_id;
  const confirmation = getOption("confirm-project-id");

  if (!projectId) {
    throw new Error("missing-project-id");
  }
  if (projectId !== serviceAccount.project_id) {
    throw new Error("service-account-project-mismatch");
  }
  if (apply && confirmation !== projectId) {
    throw new Error("apply-requires-matching-confirm-project-id");
  }

  const app = initializeApp(
    { credential: cert(serviceAccount), projectId },
    `user-profile-migration-${Date.now()}`
  );

  try {
    const db = getFirestore(app);
    const snapshot = await db.collection("users").get();

    // This is only a length heuristic. It reports document IDs and never
    // checks Firebase Authentication or reads profile field values.
    if (listUserIdsNotUidLength) {
      const documentIds = snapshot.docs
        .map((profileDoc) => profileDoc.id)
        .filter((id) => id.length !== 28);
      console.log(JSON.stringify({
        mode: "READ ONLY — document ID length check",
        totalProfiles: snapshot.size,
        expectedAuthUidLength: 28,
        documentIdCountNot28: documentIds.length,
        documentIds,
      }, null, 2));
      return;
    }

    const plans = snapshot.docs.map((profileDoc) => {
      const data = profileDoc.data();
      const sensitive = findSensitivePaths(data);
      const missingRole = !Object.prototype.hasOwnProperty.call(data, "role")
        || data.role == null
        || data.role === "";
      return {
        ref: profileDoc.ref,
        id: profileDoc.id,
        missingRole,
        missingActif: !Object.prototype.hasOwnProperty.call(data, "actif"),
        passwordPaths: sensitive.paths,
        unsupportedArrayFields: sensitive.unsupported,
      };
    });

    const affected = plans.filter(
      (plan) => plan.missingRole || plan.missingActif || plan.passwordPaths.length > 0
        || plan.unsupportedArrayFields
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
      profilesWithoutRole: plans.filter((plan) => plan.missingRole).length,
      profilesMissingActif: plans.filter((plan) => plan.missingActif).length,
      profilesToSetViewerAndInactive: plans.filter((plan) => plan.missingRole).length,
      profilesToSetActiveTrue: plans.filter(
        (plan) => !plan.missingRole && plan.missingActif
      ).length,
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
      if (plan.missingRole) {
        updates.push(new FieldPath("role"), "viewer");
        updates.push(new FieldPath("actif"), false);
      } else if (plan.missingActif) {
        updates.push(new FieldPath("actif"), true);
      }
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
      profilesSetViewerAndInactive: plans.filter((plan) => plan.missingRole).length,
      activeTrueFieldsAdded: plans.filter(
        (plan) => !plan.missingRole && plan.missingActif
      ).length,
      passwordLikeFieldsDeleted: passwordFieldCount,
    }, null, 2));
  } finally {
    await app.delete();
  }
}

main().catch((error) => {
  // Keep errors free of profile data, email addresses, and credential values.
  const code = typeof error.code === "string" && /^[a-z0-9_-]+$/i.test(error.code)
    ? error.code
    : "unknown-error";
  console.error(`User profile migration stopped (${code}); no profile or credential values were printed.`);
  process.exitCode = 1;
});
