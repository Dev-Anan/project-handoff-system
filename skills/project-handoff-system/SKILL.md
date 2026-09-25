---
name: project-handoff-system
description: Set up or adapt a Git-backed task and session handoff workflow in a software repository. Use when a user wants durable task ownership, checkpoints, evidence, or agent-to-agent continuity stored in Git.
---

# Project handoff system

Give a repository a small, inspectable workflow for selecting authorized work, recording progress, and handing it to another session or agent.

## Set up a repository

1. Inspect the Git state, root instructions, package scripts, existing task tracker, and relevant workflow files. Read only what is needed. Preserve unrelated work.
2. If a task system already exists, map its status, ownership, and evidence fields before changing files. Keep one clear source of task state; do not create a parallel tracker by default.
3. If no equivalent workflow exists, run the included installer first in dry-run mode:

   ```sh
   node <skill-dir>/scripts/install.mjs --target <absolute-repository-path> --dry-run
   ```

   Review the proposed files and collisions. Run it without `--dry-run` only when the user asked to install or adapt the workflow. Existing instructions and configuration are preserved; conflicts require a project-specific integration.

4. Tailor the shared instructions to the repository's actual source layout, constraints, and validation commands. Keep product-specific rules in that repository rather than in this skill.
5. Run `npm run project:check` and `npm run project:resume` in the target repository. Review the resulting diff and update the target's instructions before handing it off.

## Use the workflow

- Treat the user's request as the authority for scope. A backlog item alone does not authorize implementation.
- Keep task status in each task record; use the current-task file only as a pointer.
- Record the real Git revision, changed files, validation results, blockers, and next action at checkpoints.
- Mark work complete only when its acceptance checks have evidence. Deployment and release remain separate actions that need their own authorization.
- Commit or transfer the task records and source changes when another machine or agent needs to continue.

## References

- Read [the workflow reference](assets/workflow-readme.md) for task states, templates, and handoff conventions.
- Read [the compatibility guide](references/agent-compatibility.md) when adapting agent instruction files.
- Read [the design notes](references/design.md) when integrating an existing tracker or changing the workflow structure.
- Open [the HTML guide](assets/project-handoff-guide.html) when a human-readable walkthrough is useful.

The helper requires Node.js and Git. It can be added to repositories that use other application languages. It validates structure and links; it cannot prove the truth of evidence or user approval.
