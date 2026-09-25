# Project Handoff System

A portable Codex skill and installer for bringing the task, checkpoint, and agent handoff workflow from Car-eService commit `2e8b74dc9e6fafb6a0f1762adc8ebe9ce1500815` to other Git repositories.

This repository contains only the reusable workflow, templates, installer, design notes, and Thai HTML guide. It does not include Car-eService application code, Firebase rules, product decisions, Graphify output, or unrelated history.

## What's included

- `skills/project-handoff-system/` — installable Codex skill, repo setup script, workflow assets, and design reference.
- `docs/project-handoff-guide.html` — Thai guide for installation and daily use, using IBM Plex Sans Thai and IBM Plex Sans.
- `docs/agent-compatibility.md` — supported repo-level entrypoints for Codex, Claude, Gemini, Copilot, Cursor, Windsurf, Continue, Cline, Roo Code, and Aider.

## Install the skill in Codex

Clone this project, then copy the skill directory into the Codex skills directory. Node.js and Git are required when using the skill's repo installer.

macOS / Linux:

```sh
SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
mkdir -p "$SKILLS_DIR"
test ! -e "$SKILLS_DIR/project-handoff-system" || { echo "Skill already exists; compare before replacing."; exit 1; }
cp -R skills/project-handoff-system "$SKILLS_DIR/project-handoff-system"
```

PowerShell:

```powershell
$skillsDir = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME 'skills' } else { Join-Path $HOME '.codex/skills' }
New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
$destination = Join-Path $skillsDir 'project-handoff-system'
if (Test-Path $destination) { throw "Skill already exists; compare before replacing." }
Copy-Item -Recurse .\skills\project-handoff-system $destination
```

If `CODEX_HOME` is set, install under its `skills/` directory. Otherwise use `~/.codex/skills/`. Start or refresh Codex so it discovers the skill, then invoke `$project-handoff-system`.

## Install workflow in a target repo

Give Codex the absolute path to an existing Git repository and ask it to set up the workflow. Or call the installer directly:

```sh
node "${CODEX_HOME:-$HOME/.codex}/skills/project-handoff-system/scripts/install.mjs" --target /absolute/path/to/repository --dry-run
node "${CODEX_HOME:-$HOME/.codex}/skills/project-handoff-system/scripts/install.mjs" --target /absolute/path/to/repository
```

Review the dry run and target repo diff. The installer refuses existing `docs/work/`, workflow file collisions, and conflicting npm scripts. It preserves existing agent instructions and package scripts. Tailor the appended `AGENTS.md` section with the target project's real source paths, constraints, and validation commands. Then run `npm run project:check` and `npm run project:resume`.

`AGENTS.md` is the canonical instruction source. The installer adds small adapters for agent-specific formats when absent; see [agent compatibility](docs/agent-compatibility.md). Existing adapter files are preserved and need a manual link to `AGENTS.md` if they do not already load it. Tool behavior varies by product and version, so unsupported clients can be prompted to read `AGENTS.md` and `docs/work/README.md`.

The workflow works with non-Node application code. Node.js and Git are required for its command line helper. Existing task systems need a deliberate authority mapping before installation.

## Guide and font

Open [the HTML guide](docs/project-handoff-guide.html) in a browser. The IBM Plex Sans fonts load from Google Fonts; internet access is needed for the intended typeface, and a sans-serif fallback is used offline.

## Source

The workflow design is adapted from [Car-eService commit 2e8b74d](https://github.com/Dev-Anan/Car-eService/commit/2e8b74dc9e6fafb6a0f1762adc8ebe9ce1500815). Project-specific rules and data were deliberately excluded.
