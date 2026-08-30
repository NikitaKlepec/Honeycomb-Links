---
name: Pinned pnpm in Replit workflows
description: Replit managed workflows can conflict with a root package-manager pin during local pnpm auto-provisioning.
---

Keep the repository's exact pnpm pin when the hosted build needs deterministic lockfile behavior, but invoke pnpm through Corepack in managed Replit workflow commands.

**Why:** In this environment, managed workflow startup attempted to provision the pinned pnpm through bare `pnpm` and repeatedly aborted, while `corepack pnpm` ran the pinned version successfully.

**How to apply:** If a root `packageManager` pin causes workflow startup to loop on `pnpm add pnpm@...`, change only the artifact development/production commands to `corepack pnpm`, validate the artifact TOML, and recheck all workflows.