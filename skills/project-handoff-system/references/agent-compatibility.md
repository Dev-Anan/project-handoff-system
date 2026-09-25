# Agent compatibility

The workflow has one canonical source: `AGENTS.md` in each target repository, with task details in `docs/work/README.md`. Small adapter files point each agent to that source. This prevents separate instruction copies from drifting.

## Supported workspace entrypoints

| Agent | Project instruction file | Adapter behavior |
|---|---|---|
| OpenAI Codex | `AGENTS.md` | Reads it as repository guidance |
| Claude Code | `CLAUDE.md` | Imports `AGENTS.md` |
| Gemini CLI | `GEMINI.md` | Imports `AGENTS.md` |
| GitHub Copilot Chat / CLI / cloud agent | `.github/copilot-instructions.md` | Points to `AGENTS.md`; Copilot CLI and cloud agent also recognize agent instruction files |
| Cursor IDE | `.cursor/rules/project-handoff.mdc` | Always-applied rule points to `AGENTS.md` |
| Cursor CLI | `AGENTS.md` and `CLAUDE.md` | Reads repository instructions; the `.cursor/rules` adapter covers the IDE |
| Windsurf Cascade | `AGENTS.md` | Loads directory-scoped agent instructions |
| Continue | `.continue/rules/project-handoff.md` | Always-applied rule points to `AGENTS.md` |
| Cline | `.clinerules/00-project-handoff.md` | Workspace rule; Cline also recognizes `AGENTS.md` |
| Roo Code | `.roo/rules/00-project-handoff.md` | Workspace rule points to `AGENTS.md` |
| Aider | `.aider.conf.yml` | Configures `AGENTS.md` as a read-only conventions file |

These are repository-level conventions confirmed against each tool's documentation. Exact behavior can vary by product, client, and version; tools that do not load one of these formats can still be started with: “Read `AGENTS.md` and `docs/work/README.md` before acting.”

## Preserve existing configuration

The installer creates an adapter only when the target path is absent. Existing `CLAUDE.md`, `GEMINI.md`, Copilot instructions, Cursor/Continue/Cline/Roo rules, and Aider config are left unchanged and listed in the installer output. Add a short reference to `AGENTS.md` manually if the existing file is the entrypoint for that agent. Never replace the target project's own rules with this workflow.

Windsurf and several agents also support `AGENTS.md` directly, so no separate file is needed for every product. MCP servers, agents, plugins, and model APIs are independent of workspace instruction files; this project configures repo guidance rather than connecting external tools.

## Official references

- [OpenAI Codex: AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Claude Code: memory and CLAUDE.md](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Gemini CLI: GEMINI.md context](https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html)
- [GitHub Copilot: custom instructions support](https://docs.github.com/en/copilot/reference/custom-instructions-support)
- [Cursor: project rules](https://docs.cursor.com/context/rules)
- [Windsurf: AGENTS.md](https://docs.windsurf.com/windsurf/cascade/agents-md)
- [Continue: rules](https://docs.continue.dev/customize/deep-dives/rules)
- [Cline: rules](https://github.com/cline/cline/blob/main/docs/customization/cline-rules.mdx)
- [Roo Code: custom instructions](https://github.com/RooCodeInc/Roo-Code/blob/main/apps/docs/docs/features/custom-instructions.md)
- [Aider: conventions files](https://aider.chat/docs/usage/conventions.html) and [configuration](https://aider.chat/docs/config/aider_conf.html)
