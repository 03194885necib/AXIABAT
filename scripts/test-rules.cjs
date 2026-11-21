"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require("@firebase/rules-unit-testing");

const PROJECT_ID = "demo-axiabat";
const ADMIN_UID = "test-admin";
const WRITER_UID = "test-writer";
const VIEWER_UID = "test-viewer";
const INACTIVE_UID = "test-inactive";
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const firestoreRules = fs.readFileSync(
  path.join(__dirname, "..", "firestore.rules.phase2b"),
  "utf8"
);
const storageRules = fs.readFileSync(
  path.join(__dirname, "..", "storage.rules.phase2"),
  "utf8"
);

let testEnv;
let passed = 0;
let failed = 0;

async function check(name, callback) {
  try {
    await callback();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}: ${error.code || error.name || "assertion-failed"}`);
  }
}

async function seedProfiles() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      db.doc(`users/${ADMIN_UID}`).set({
        role: "admin",
        actif: true,
        displayName: "Emulator Admin",
      }),
      db.doc(`users/${WRITER_UID}`).set({
        role: "conducteur",
        actif: true,
        displayName: "Emulator Writer",
      }),
      db.doc(`users/${VIEWER_UID}`).set({
        role: "viewer",
        actif: true,
        displayName: "Emulator Viewer",
      }),
      db.doc(`users/${INACTIVE_UID}`).set({
        role: "conducteur",
        actif: false,
        displayName: "Emulator Inactive",
      }),
    ]);
  });
}

async function main() {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: firestoreRules,
    },
    storage: {
      host: "127.0.0.1",
      port: 9199,
      rules: storageRules,
    },
  });

  try {
    await testEnv.clearFirestore();
    await seedProfiles();

    await check("admin creates another account and matching ACCOUNT_CREATED log in one batch", async () => {
      const db = testEnv.authenticatedContext(ADMIN_UID).firestore();
      const newUid = "test-created-account";
      const batch = db.batch();
      batch.set(db.doc(`users/${newUid}`), {
        displayName: "New Test User",
        email: "new-user@example.test",
        role: "viewer",
        actif: true,
        createdAt: new Date(),
        createdBy: ADMIN_UID,
      });
      batch.set(db.doc("logs_activite/account-created"), {
        uid: ADMIN_UID,
        action: "ACCOUNT_CREATED",
        date: new Date(),
        détail: { targetUid: newUid, role: "viewer" },
      });
      await assertSucceeds(batch.commit());
    });

    await check("signed-in user can read the profile at users/{uid}", async () => {
      const db = testEnv.authenticatedContext(ADMIN_UID).firestore();
      const profile = await db.doc(`users/${ADMIN_UID}`).get();
      assert.equal(profile.exists, true);
      assert.equal(profile.id, ADMIN_UID);
      assert.equal(profile.data().role, "admin");
      assert.equal(typeof profile.data().actif, "boolean");
      assert.equal(profile.data().actif, true);
    });

    await check("viewer cannot read another user's users/{uid} profile", async () => {
      const db = testEnv.authenticatedContext(VIEWER_UID).firestore();
      await assertFails(db.doc(`users/${ADMIN_UID}`).get());
    });

    await check("self-service account creation is denied", async () => {
      const db = testEnv.authenticatedContext("test-self-create").firestore();
      await assertFails(db.doc("users/test-self-create").set({
        displayName: "Self-created",
        email: "self@example.test",
        role: "viewer",
        actif: true,
        createdAt: new Date(),
        createdBy: "test-self-create",
      }));
    });

    await check("a user cannot change their own role", async () => {
      const db = testEnv.authenticatedContext(VIEWER_UID).firestore();
      await assertFails(db.doc(`users/${VIEWER_UID}`).update({ role: "admin" }));
    });

    await check("password fields are denied on profile updates", async () => {
      const db = testEnv.authenticatedContext(ADMIN_UID).firestore();
      await assertFails(
        db.doc(`users/${VIEWER_UID}`).update({ password: "test-value-not-a-real-password" })
      );
    });

    await check("activity logs cannot be edited or deleted", async () => {
      const db = testEnv.authenticatedContext(ADMIN_UID).firestore();
      const log = db.doc("logs_activite/account-created");
      await assertFails(log.update({ action: "tampered" }));
      await assertFails(log.delete());
    });

    await check("active viewer can read but cannot write business data", async () => {
      const db = testEnv.authenticatedContext(VIEWER_UID).firestore();
      await assertSucceeds(db.doc("projects/reader-test").get());
      await assertFails(db.doc("projects/reader-test").set({ test: true }));
    });

    await check("active writer can write business data", async () => {
      const db = testEnv.authenticatedContext(WRITER_UID).firestore();
      await assertSucceeds(db.doc("projects/writer-test").set({ test: true }));
    });

    await check("inactive profile cannot read business data", async () => {
      const db = testEnv.authenticatedContext(INACTIVE_UID).firestore();
      await assertFails(db.doc("projects/inactive-test").get());
    });

    await check("active writer uploads an allowed PDF under project_files", async () => {
      const storage = testEnv.authenticatedContext(WRITER_UID).storage();
      const file = storage.ref("project_files/demo-project/pv_reunion/report.pdf");
      await assertSucceeds(file.put(new Uint8Array([1, 2, 3]), {
        contentType: "application/pdf",
      }));
    });

    await check("case-insensitive DWG extension plus allowed MIME is accepted", async () => {
      const storage = testEnv.authenticatedContext(WRITER_UID).storage();
      await assertSucceeds(
        storage.ref("project_files/demo-project/pv_reunion/plan.DWG")
          .put(new Uint8Array([1, 2, 3]), { contentType: "image/vnd.dwg" })
      );
    });

    await check("DXF and ZIP uploads with their matching MIME types are accepted", async () => {
      const storage = testEnv.authenticatedContext(WRITER_UID).storage();
      await assertSucceeds(
        storage.ref("project_files/demo-project/pv_reunion/plan.dxf")
          .put(new Uint8Array([1]), { contentType: "application/dxf" })
      );
      await assertSucceeds(
        storage.ref("project_files/demo-project/pv_reunion/archive.zip")
          .put(new Uint8Array([1]), { contentType: "application/zip" })
      );
    });

    await check("executable extension with generic MIME is rejected", async () => {
      const storage = testEnv.authenticatedContext(WRITER_UID).storage();
      await assertFails(
        storage.ref("project_files/demo-project/pv_reunion/installer.exe")
          .put(new Uint8Array([1]), { contentType: "application/octet-stream" })
      );
    });

    await check("DWG extension with a MIME outside the CAD/archive allowlist is rejected", async () => {
      const storage = testEnv.authenticatedContext(WRITER_UID).storage();
      await assertFails(
        storage.ref("project_files/demo-project/pv_reunion/invalid.dwg")
          .put(new Uint8Array([1]), { contentType: "text/plain" })
      );
    });

    await check("active viewer can read a project file but cannot upload", async () => {
      const viewerStorage = testEnv.authenticatedContext(VIEWER_UID).storage();
      const savedFile = viewerStorage.ref(
        "project_files/demo-project/pv_reunion/report.pdf"
      );
      await assertSucceeds(savedFile.getMetadata());
      await assertFails(
        viewerStorage.ref("project_files/demo-project/pv_reunion/viewer.pdf")
          .put(new Uint8Array([1]), { contentType: "application/pdf" })
      );
      await assertFails(
        viewerStorage.ref("project_files/demo-project/pv_reunion/viewer.zip")
          .put(new Uint8Array([1]), { contentType: "application/zip" })
      );
    });

    await check("inactive profile cannot read project files", async () => {
      const storage = testEnv.authenticatedContext(INACTIVE_UID).storage();
      await assertFails(
        storage.ref("project_files/demo-project/pv_reunion/report.pdf").getMetadata()
      );
    });

    await check("Storage rejects disallowed MIME types and files larger than 25 MiB", async () => {
      const storage = testEnv.authenticatedContext(WRITER_UID).storage();
      await assertFails(
        storage.ref("project_files/demo-project/pv_reunion/readme.txt")
          .put(new Uint8Array([1]), { contentType: "text/plain" })
      );
      await assertFails(
        storage.ref("project_files/demo-project/pv_reunion/too-large.pdf")
          .put(new Uint8Array(MAX_UPLOAD_BYTES + 1024 * 1024), { contentType: "application/pdf" })
      );
    });
  } finally {
    await testEnv.cleanup();
  }

  console.log(`Rules emulator tests: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  // Print only a stable error code, never request or profile values.
  const code = typeof error.code === "string" ? error.code : error.name || "unknown-error";
  console.error(`Rules emulator tests stopped (${code}).`);
  process.exitCode = 1;
});
