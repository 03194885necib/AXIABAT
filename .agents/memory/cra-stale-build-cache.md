---
name: CRA stale build diagnostics
description: A production build parser error contradicted direct parsing in this workspace.
---

If Create React App reports a syntax error on an unchanged source file while direct ESLint and Babel parsing succeed, stale generated build state can be the cause. Clearing the ignored Node build cache fixed the production build here.

**Why:** During merge verification, the reported source matched the previously passing commit and parsed successfully on its own, but the production build passed only after the generated cache was cleared.

**How to apply:** When the build's parser location contradicts direct parsing, check generated build state before changing valid source code.
