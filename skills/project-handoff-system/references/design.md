# Workflow design

## Components

| Component | Responsibility |
| --- | --- |
| `AGENTS.md` | Brief repository-wide startup instructions and links to project rules. |
| `docs/work/README.md` | Task states, ownership, acceptance, evidence, and handoff conventions. |
| `docs/work/tasks/` | One task record per unit of authorized work. |
| `docs/work/current.json` | Pointer to the selected task; never a second status database. |
| `docs/work/sessions/` | Session notes linked from task checkpoints and validation. |
| `scripts/project-workflow.mjs` | Read-only resume, status, and consistency checks. |
| `docs/project-handoff-guide.html` | Human walkthrough; it does not store live task state. |

The installer creates an empty task registry. A task is added only when there is real work to track. Its record captures authorization, scope, acceptance, owner, status, and checkpoints. The active pointer selects a task but does not grant permission.

## Invariants

- Task records own their status; the active pointer only selects one record.
- Keep at most one task in `IN_PROGRESS` or `VERIFY` unless the repository deliberately changes that rule.
- A completion claim needs passing acceptance checks and links to evidence. Record release separately.
- On resume, compare the recorded branch and revision with Git and preserve uncommitted work.
- A checkpoint should state what changed, what remains, blockers, validation performed, and the next concrete action.
- A structural validator can check paths and required fields. It cannot determine whether a person approved work or whether evidence is truthful.
- A workflow registry is not a lock. Concurrent work needs explicit ownership and suitable Git isolation.

## Integrating an existing tracker

Inspect its current statuses and who owns them. Decide whether to extend that system, map it to these conventions, or make one system authoritative and link the other. Avoid creating duplicate task state. Adapt commands to the repository's package manager or use `node scripts/project-workflow.mjs <resume|status|check>` directly.
