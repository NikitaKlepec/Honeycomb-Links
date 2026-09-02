---
name: Pinned pnpm in Replit workflows
description: Replit managed workflows can conflict with a root package-manager pin during local pnpm auto-provisioning.
---

Keep the repository's exact pnpm pin when the hosted build needs deterministic lockfile behavior, disable pnpm's package-manager self-management, and invoke pnpm through Corepack in managed Replit workflow commands.

**Why:** In this environment, Replit's publish installer used system pnpm 10.26.1, saw the root pin, and repeatedly tried to provision pnpm 10.11.1 until Node ran out of worker threads. Disabling self-management makes the installer complete; Corepack keeps managed workflows on the pinned version.

**How to apply:** If a root `packageManager` pin causes publishing or workflow startup to loop on `pnpm add pnpm@...`, set `manage-package-manager-versions=false` in `.npmrc`, change artifact development/production commands to `corepack pnpm`, validate the artifact TOML, and recheck install, build, and workflows.