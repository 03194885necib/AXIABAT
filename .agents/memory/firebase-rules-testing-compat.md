---
name: Firebase rules testing compatibility
description: Keep the Firebase Security Rules test package compatible with the app's Firebase SDK major version.
---

Choose the Rules Unit Testing package version that matches the installed Firebase JS SDK peer range. For this project's Firebase 11 SDK, the 4.x test package is compatible; the newest major required a newer Firebase SDK.

**Why:** Upgrading the app's Firebase SDK solely to satisfy a test helper would be an unnecessary production dependency change.

**How to apply:** Check the test package peer dependencies before installing; prefer a compatible test-package version over a Firebase SDK major upgrade.
