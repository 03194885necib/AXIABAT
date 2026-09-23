---
name: Firestore catalog import
description: The AXIABAT catalog import must be executed from an authenticated admin session.
---

The application uses Firestore directly from the React client; catalog writes should be initiated from the admin Articles screen rather than by embedding credentials or attempting an unauthenticated build-time seed.

**Why:** The build environment has no Firebase user credential for a safe data mutation, while Firestore rules are expected to enforce authenticated access.

**How to apply:** Keep catalog imports explicit, idempotent, and report-backed in the admin UI. Use the existing `categories` and `articles` collections and do not create a replacement database.