---
name: Firestore rules review
description: AXIABAT's process for changing Cloud Firestore security rules safely.
---

Never replace or deploy active Firestore rules as a side effect of an app feature change. Inventory active top-level and nested collections, prepare a complete proposal, compare it with the deployed rules, and show it to the user for approval before deployment.

**Why:** The user explicitly required that existing rules not be replaced and that the complete proposal be validated first.

**How to apply:** For any future Firestore security change, keep proposed rules separate from the active deployment configuration until existing rules are reconciled and the user explicitly approves deployment.
