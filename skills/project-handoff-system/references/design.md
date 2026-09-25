# Portable design from commit 2e8b74d

## What to reproduce

| Part | Purpose | Installed location |
| --- | --- | --- |
| Agent entrypoint | Start every session by comparing Git and checkpoint, respect authorization, preserve unrelated edits | `AGENTS.md` section |
| Work protocol | Defines task ownership, state transitions, evidence, and handoff | `docs/work/README.md` |
| Task records | One JSON file owns each task status, scope, acceptance and checkpoint | `docs/work/tasks/TASK-XXXX.json` |
| Selection pointer | Names the active task or `null`; does not duplicate status | `docs/work/current.json` |
| Session records | Human readable evidence linked from acceptance/validation | `docs/work/sessions/*.md` |
| CLI | Read-only resume/status/check and integrity validation | `scripts/project-workflow.mjs`, package scripts |
| Guide | Human explanation and copyable commands | `docs/project-handoff-guide.html` |

The installer starts with zero tasks and a null selection. This avoids making a backlog item look authorized. To start a real task, copy `docs/work/templates/task.json` to a unique `TASK-XXXX.json`, set `authorized` from the user's instruction, fill scope and acceptance, select it in `current.json`, and claim it with `IN_PROGRESS`, executor/session, Git branch/HEAD, and an exact next action. The script accepts priorities `P1`–`P3` and states `BACKLOG`, `READY`, `IN_PROGRESS`, `VERIFY`, `BLOCKED`, `PAUSED`, `DONE`.

## Invariants worth preserving

- `current.json` is only a pointer; task files own status.
- At most one task is `IN_PROGRESS` or `VERIFY`, and it must be selected.
- `DONE` requires all acceptance entries to be `PASS`, linked evidence files, and validation entries. Release has a separate status.
- Before handoff, update checkpoint, create a session record, link evidence, and run `project:check`.
- The validator checks paths stay inside the repository and exist. It does not verify the contents of evidence or business approval.
- Compare branch/HEAD and dirty files to checkpoint on every resume. A checkpoint alone cannot restore uncommitted files on another machine.
- Existing trackers may need mapping or a coexistence rule. Do not silently create a second authority for the same work.

## Target adaptations

For repositories with an existing `AGENTS.md`, keep its current rules and append only the generic workflow pointer. Keep startup instructions short; move detailed patterns into read-on-demand docs. For repositories with an existing task system, map its status/ownership fields and decide which file is authoritative before installing. For repositories without npm, use the direct `node scripts/project-workflow.mjs resume|status|check` commands or the generated small `package.json`.

The original commit also included Car-eService product constraints, a historical backlog, UX tracker links, Graphify output, Firebase hosting cache, and provider-specific context files. These do not transfer to unrelated repositories.
