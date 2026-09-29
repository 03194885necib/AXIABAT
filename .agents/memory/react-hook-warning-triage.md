---
name: React hook warning triage
description: Diagnostic sequence for intermittent Invalid hook call warnings in the AXIABAT development preview.
---

An intermittent Invalid hook call warning should first be checked against the physical React package tree, hook placement, and a fresh workflow/browser load before changing dependencies or application architecture.

**Why:** The project currently resolves React and ReactDOM to the same single installed version, and a clean restart can render `/login` and `/home` without the warning; changing React or Firebase without a reproducible source violation would add risk.

**How to apply:** Run the React dependency tree checks, scan hook calls, restart the workflow, load the affected routes separately, inspect browser logs, and only then edit the identified source or dependency.