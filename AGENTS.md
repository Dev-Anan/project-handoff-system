# Project Skills — maintainer notes

- Keep each skill self-contained under `skills/<skill-name>/` with a concise `SKILL.md` and only the references, scripts, and assets it needs.
- Keep skills adaptable to different repositories and coding agents. Put target-specific policies in the target repository.
- Keep the Thai guide at `docs/project-handoff-guide.html` readable on narrow screens and use IBM Plex Sans Thai / IBM Plex Sans as its primary typefaces.
- When changing a skill, validate its metadata and instructions with the Codex skill validator when available; run `node --check` on changed JavaScript files.
- Installer changes must preserve existing target files and stop on ambiguous task registry conflicts.
