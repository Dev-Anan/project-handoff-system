# Project Skills

Small, adaptable skills for reliable software work across coding agents.

Each skill lives in `skills/<skill-name>/` and includes its own `SKILL.md`, optional references, and any scripts or assets needed for the work. Install only the skills you want, then adapt their output to your repository.

The installation uses the open [Skills CLI](https://github.com/vercel-labs/skills), which discovers this repository's `skills/` folders and lets you choose an agent-specific destination.

## Skills

| Skill | What it does |
| --- | --- |
| [project-handoff-system](skills/project-handoff-system/SKILL.md) | Adds or adapts a Git-backed task, checkpoint, and evidence workflow in a repository. |

## Install

Use the [Skills CLI](https://github.com/vercel-labs/skills) to choose the coding agent and skill location:

```sh
npx skills@latest add Dev-Anan/project-handoff-system
```

Select `project-handoff-system` and the agent or agents you want to use. Then open that repository with your coding agent and ask it to set up the handoff workflow. For example:

```text
Use the project-handoff-system skill to inspect and set up this repository.
```

The skill reviews the target repository before making changes. It preserves existing instructions and stops when an existing tracker or file collision needs a deliberate mapping.

## Direct use

You can also use the skill without an installer: open `skills/project-handoff-system/SKILL.md` in your agent's skill folder, or copy that skill directory into the agent's supported skills location. The skill contains the installer, templates, workflow guide, and references it needs.

## Repository layout

```text
skills/
└── project-handoff-system/
    ├── SKILL.md
    ├── agents/
    ├── assets/
    ├── references/
    └── scripts/
docs/
└── project-handoff-guide.html
```

The public guide is also available as a [standalone HTML page](docs/project-handoff-guide.html). It uses IBM Plex Sans Thai and IBM Plex Sans, with local sans-serif fallbacks.
