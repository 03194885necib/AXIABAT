---
name: Firestore rules review
description: AXIABAT's process for changing Cloud Firestore security rules safely.
---

Never replace or deploy active Firestore rules as a side effect of an app feature change. Inventory active top-level and nested collections, prepare a complete proposal, compare it with the deployed rules, and show it to the user for approval before deployment.

**Why:** The user explicitly required that existing rules not be replaced and that the complete proposal be validated first.

**How to apply:** For any future Firestore security change, keep proposed rules separate from the active deployment configuration until existing rules are reconciled and the user explicitly approves deployment.

The user-provided current AXIABAT rules contain a global `allow read, write: if true` match. Leaving it alongside restrictive matches makes those restrictions ineffective because matching Firestore allows are combined permissively.

**Why:** The global rule currently grants unauthenticated access to every document, so account-role protections cannot work while it remains.

**How to apply:** Explain that enforcing the requested account protections requires removing that catch-all from the proposed active ruleset; do not deploy this change without explicit approval.
