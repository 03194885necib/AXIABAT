---
name: GitHub API synchronization
description: Publishing repository changes through the authorized GitHub integration under its request-rate limit.
---

When synchronizing a repository through the authorized GitHub integration, prefer one Git tree creation with inline file contents over one blob API request per file.

**Why:** The Replit GitHub connector rate-limits bursts at 10 requests per second; parallel blob creation can fail partway through before the commit and ref update exist.

**How to apply:** Read the intended changed files locally, create one tree on top of the current remote ref, create one commit, and update the branch ref only after the tree is created.