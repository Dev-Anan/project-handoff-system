import { existsSync, mkdirSync, readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const skillRoot = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const targetIndex = args.indexOf('--target');
const dryRun = args.includes('--dry-run');
if (targetIndex < 0 || !args[targetIndex + 1]) {
  console.error('Usage: node install.mjs --target <absolute-git-repository-path> [--dry-run]');
  process.exit(2);
}
const target = realpathSync(resolve(args[targetIndex + 1]));
let gitRoot;
try { gitRoot = realpathSync(execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: target, encoding: 'utf8' }).trim()); }
catch { console.error('Target must be an existing Git repository.'); process.exit(2); }
if (target !== gitRoot) { console.error('Target must be the Git repository root.'); process.exit(2); }
try { execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: target, stdio: 'ignore' }); }
catch { console.error('Create an initial Git commit before installing so checkpoints have a base revision.'); process.exit(2); }
if (existsSync(join(target, 'docs/work'))) {
  console.error('docs/work already exists. Inspect its task authority and adapt manually.');
  process.exit(2);
}

const readAsset = name => readFileSync(join(skillRoot, 'assets', name), 'utf8');
const files = new Map([
  ['scripts/project-workflow.mjs', readAsset('project-workflow.mjs')],
  ['docs/work/README.md', readAsset('workflow-readme.md')],
  ['docs/work/current.json', '{\n  "task_id": null\n}\n'],
  ['docs/work/templates/task.json', readAsset('task.json')],
  ['docs/work/templates/session.md', readAsset('session.md')],
  ['docs/work/tasks/.gitkeep', ''],
  ['docs/work/sessions/.gitkeep', ''],
  ['docs/project-handoff-guide.html', readAsset('project-handoff-guide.html')],
]);
const marker = '<!-- project-handoff-system -->';
const agentSection = `\n${marker}\n## Shared project handoff\n\n1. Run \`npm run project:resume\` from the repository root; compare Git state with the selected task checkpoint.\n2. Work only on user-authorized scope. A backlog item is not permission. Preserve unrelated edits.\n3. Claim the task before editing, checkpoint meaningful progress, and record exact next action and actual validation evidence.\n4. Run \`npm run project:check\` before handoff. Read [the workflow](docs/work/README.md) for states, templates, and release boundaries.\n\nTask files own status; \`docs/work/current.json\` is only a pointer. DONE does not authorize release.\n`;
const agentsPath = join(target, 'AGENTS.md');
const agentsExisting = existsSync(agentsPath) ? readFileSync(agentsPath, 'utf8') : '';
if (agentsExisting.includes(marker)) {
  console.error('AGENTS.md already contains this workflow marker; inspect the existing installation before retrying.');
  process.exit(2);
}
for (const relativePath of files.keys()) {
  if (existsSync(join(target, relativePath))) {
    console.error(`Refusing to overwrite existing ${relativePath}. Adapt the workflow manually.`);
    process.exit(2);
  }
}
const packagePath = join(target, 'package.json');
const packageExisting = existsSync(packagePath);
let packageData = packageExisting ? JSON.parse(readFileSync(packagePath, 'utf8')) : { private: true, scripts: {} };
packageData.scripts ??= {};
const commands = {
  'project:resume': 'node scripts/project-workflow.mjs resume',
  'project:status': 'node scripts/project-workflow.mjs status',
  'project:check': 'node scripts/project-workflow.mjs check',
};
for (const [name, command] of Object.entries(commands)) {
  if (packageData.scripts[name] && packageData.scripts[name] !== command) {
    console.error(`Conflicting package.json script: ${name}. Adapt manually.`);
    process.exit(2);
  }
  packageData.scripts[name] = command;
}
const plans = [...files.keys(), agentsExisting ? 'append AGENTS.md' : 'create AGENTS.md', packageExisting ? 'update package.json scripts' : 'create package.json'];
for (const adapter of ['CLAUDE.md', 'GEMINI.md']) {
  if (!existsSync(join(target, adapter))) plans.push(`create ${adapter}`);
}
console.log(`${dryRun ? 'DRY RUN' : 'INSTALL'} ${target}`);
plans.forEach(item => console.log(`- ${item}`));
if (dryRun) process.exit(0);
for (const [relativePath, content] of files) {
  const destination = join(target, relativePath);
  mkdirSync(resolve(destination, '..'), { recursive: true });
  writeFileSync(destination, content, { flag: 'wx' });
}
writeFileSync(agentsPath, agentsExisting ? `${agentsExisting.trimEnd()}\n${agentSection}` : `# Shared agent entrypoint\n${agentSection}`, { flag: agentsExisting ? 'w' : 'wx' });
writeFileSync(packagePath, `${JSON.stringify(packageData, null, 2)}\n`);
for (const adapter of ['CLAUDE.md', 'GEMINI.md']) {
  const adapterPath = join(target, adapter);
  if (!existsSync(adapterPath)) writeFileSync(adapterPath, '# Agent entrypoint\n\nRead [AGENTS.md](AGENTS.md) and run `npm run project:resume` before work.\n', { flag: 'wx' });
}
console.log('Installed. Run npm run project:check, then npm run project:resume. Review the Git diff and tailor AGENTS.md to this project.');
