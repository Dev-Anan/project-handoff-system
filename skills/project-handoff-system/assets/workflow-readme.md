# Shared project workflow

This repository stores task state in `docs/work/tasks/`. `docs/work/current.json` selects one task or `null`; it is not another status database. The HTML guide at `docs/project-handoff-guide.html` teaches the process but never stores live state.

## Authority

- The user's instruction authorizes scope. Priority and backlog placement do not authorize implementation.
- The task file owns status, acceptance, checkpoint, and release state. Product decisions belong to the project owner; the executor records implementation evidence.
- Git and source show actual code state. A prior session note alone does not prove current behavior.
- `DONE` requires every acceptance check to pass with linked evidence. Release remains separate and needs its own authorization.

## Every session

1. Read `AGENTS.md`; run `npm run project:resume` or `node scripts/project-workflow.mjs resume`.
2. Compare printed branch, HEAD, and dirty files with the selected task checkpoint. Preserve unrelated edits. If files exist only on another machine, obtain a commit or patch.
3. If no task is selected, run `project:status` and follow the user's request. Do not start backlog automatically.
4. Read only the task and source/patterns needed for the next step. Before editing, claim authorized work as `IN_PROGRESS`, record executor/session, branch/base commit, and exact next action.
5. Checkpoint after meaningful progress. Before handoff, write a session record, link actual validation evidence, and run `project:check`.

## States

| State | Meaning |
| --- | --- |
| BACKLOG | Captured for triage; no permission implied |
| READY | Authorized and ready for an executor |
| IN_PROGRESS | Authorized executor is working |
| VERIFY | Work exists; acceptance or validation remains |
| BLOCKED | Required input or external state prevents progress; record blocker |
| PAUSED | Deliberately stopped with a resumable checkpoint |
| DONE | All acceptance results are PASS with evidence |

Only one task may be `IN_PROGRESS` or `VERIFY`, and `current.json` must point to it. A separate release field records `NOT_RELEASED`, `RELEASED`, or `NOT_APPLICABLE`.

## New task

Copy `docs/work/templates/task.json` to a unique `docs/work/tasks/TASK-XXXX.json`. Replace every placeholder. Describe business outcome, scope, exclusions, owner, source, acceptance, and relevant files. Set `authorized: true` only from an actual user instruction. Select authorized work in `current.json`. Keep task IDs stable.

Validation entries require a command, result (`PASS`, `FAIL`, `NOT_RUN`, or `BASELINE`), tested revision, and a path to an existing evidence file. `project:check` validates structure and links; it does not certify approvals or test truth.

## Commands

```text
npm run project:resume  # selected task, checkpoint, and actual Git state
npm run project:status  # computed index of all task files
npm run project:check   # structure, references, dependency cycles, evidence links
```

Direct Node equivalents are `node scripts/project-workflow.mjs resume|status|check`. The workflow does not depend on a browser, MCP server, hook, or a particular application stack. If multiple executors need simultaneous active tasks, agree on ownership and separate worktrees first; this registry is a convention, not an atomic lock.

## Agent entrypoints

`AGENTS.md` is the canonical instruction source. The installer adds small adapters for common agent formats when their files are absent: Claude Code, Gemini CLI, Copilot, Cursor, Continue, Cline, Roo Code, and Aider. Codex and Windsurf can use `AGENTS.md` directly. Existing instruction files are preserved; add a link to `AGENTS.md` manually when needed. See `docs/agent-compatibility.md` for paths, limitations, and official documentation links. For other clients, ask the agent to read `AGENTS.md` and this workflow before acting.
