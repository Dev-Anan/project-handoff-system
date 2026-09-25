# Project Handoff System — contributor notes

- Keep `skills/project-handoff-system/` portable across repositories and application stacks.
- Never add Car-eService application code, product policy, Firebase rules, Graphify output, or user data to this project.
- Keep the Thai guide at `docs/project-handoff-guide.html` readable on narrow screens and use IBM Plex Sans Thai / IBM Plex Sans as its primary typefaces.
- When changing the skill, check its YAML and instructions with the Codex skill validator when available; run `node --check` on changed JavaScript files.
- Installer changes must preserve existing target files and refuse ambiguous task registry conflicts.
- Keep `AGENTS.md` as the canonical workflow source; agent-specific files should be small adapters and must not fork the workflow rules.
