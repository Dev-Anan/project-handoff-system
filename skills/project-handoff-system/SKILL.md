---
name: project-handoff-system
description: Install or adapt a Git-backed task, checkpoint, and agent handoff workflow in another repository, based on Car-eService commit 2e8b74d. Use when a user asks to set up project:resume/status/check, shared AGENTS.md instructions, task records, or a portable project-management guide.
---

# Project handoff system

Use this skill to give a repository the reusable workflow introduced by commit `2e8b74dc9e6fafb6a0f1762adc8ebe9ce1500815`. The portable core is an agent entrypoint, one selected task pointer, task files, session evidence, a validator/resume command, and a human guide. The original commit also changed Car-eService documentation and generated files; those are not part of the portable core.

## Set up a target repository

1. Inspect its root instructions, package scripts, Git state, task trackers, and existing `docs/work/` before writing. Preserve existing ownership and task IDs. Do not treat backlog entries as authorized work.
2. If no equivalent workflow exists, run `node <skill-dir>/scripts/install.mjs --target <absolute-repository-path> --dry-run`; review the plan, then run without `--dry-run`. The installer refuses to overwrite existing workflow files or conflicting npm scripts. If it reports a conflict, adapt the repository manually using [the portable design](references/design.md).
3. Tailor the appended `AGENTS.md` section to the project's real commands and constraints. Existing instructions remain authoritative. Add project-specific read-on-demand links rather than copying Car-eService rules.
4. Run `npm run project:check` (or `node scripts/project-workflow.mjs check`), then `npm run project:resume`. Inspect the generated `docs/project-handoff-guide.html` and replace any generic business examples if the user needs domain-specific guidance.
5. Create task records only for actual user-authorized work. Claim before editing; checkpoint after meaningful progress. Keep release/deployment authorization separate from task completion.

The installed workflow needs Node.js and Git. It works with non-Node application stacks; the installer adds a small `package.json` only when the target does not already have one. Read [the portable design](references/design.md) when adapting an existing task system or diagnosing validator failures.

## Boundaries

- Never import Car-eService's Firebase rules, product policy, user data, Graphify output, or historical backlog into another project.
- Never overwrite an existing `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, task registry, or package script. Resolve conflicts with the user-authorized target scope.
- The validator checks structure and links. It cannot prove that evidence is true, acceptance was approved, or a release occurred.
- The HTML guide is educational; task JSON files remain the source of task state.
