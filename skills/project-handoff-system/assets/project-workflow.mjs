import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
const STATES = ['BACKLOG', 'READY', 'IN_PROGRESS', 'VERIFY', 'BLOCKED', 'PAUSED', 'DONE'];
const ACTIVE = ['IN_PROGRESS', 'VERIFY'];
const text = value => typeof value === 'string' && value.trim().length > 0;
const strings = value => Array.isArray(value) && value.every(text);
const inside = (root, target) => {
  const rel = relative(root, target);
  return rel !== '..' && !rel.startsWith('../') && !isAbsolute(rel);
};
export function localFile(root, value) {
  if (!text(value) || isAbsolute(value)) return false;
  const target = resolve(root, value.split('#')[0]);
  return inside(root, target) && existsSync(target) && statSync(target).isFile() && inside(realpathSync(root), realpathSync(target));
}

export function loadRegistry(root = ROOT) {
  const directory = resolve(root, 'docs/work/tasks');
  const tasks = readdirSync(directory).filter(name => name.endsWith('.json')).sort().map(name => ({
    file: `docs/work/tasks/${name}`, data: JSON.parse(readFileSync(resolve(directory, name), 'utf8')),
  }));
  const current = JSON.parse(readFileSync(resolve(root, 'docs/work/current.json'), 'utf8'));
  return { tasks, current };
}

export function validateRegistry(root, { tasks, current }) {
  const errors = [];
  const fail = (id, message) => errors.push(`${id}: ${message}`);
  const ids = new Set();
  const active = [];
  for (const { file, data: task } of tasks) {
    if (!task || typeof task !== 'object' || Array.isArray(task)) { fail(file, 'task must be an object'); continue; }
    const id = task.id;
    if (!/^TASK-\d{4}$/.test(id) || file !== `docs/work/tasks/${id}.json`) fail(file, 'ID must match TASK-XXXX filename');
    if (ids.has(id)) fail(id, 'duplicate ID');
    ids.add(id);
    for (const key of ['title', 'business_outcome', 'authorization', 'owner']) if (!text(task[key])) fail(id, `missing ${key}`);
    if (!['P1', 'P2', 'P3'].includes(task.priority)) fail(id, 'invalid priority');
    if (!STATES.includes(task.status)) fail(id, 'invalid status');
    if (typeof task.authorized !== 'boolean') fail(id, 'authorized must be boolean');
    if (task.status !== 'BACKLOG' && task.authorized !== true) fail(id, 'non-backlog state requires authorization');
    if (ACTIVE.includes(task.status)) {
      active.push(id);
      if (!text(task.executor)) fail(id, 'active work requires executor/session');
    }
    for (const key of ['scope', 'out_of_scope', 'depends_on', 'read_files']) {
      if (!strings(task[key])) fail(id, `${key} must be a string array`);
    }
    if (!task.scope?.length || !task.read_files?.length) fail(id, 'scope and read_files cannot be empty');
    for (const path of [task.source, ...(Array.isArray(task.read_files) ? task.read_files : [])]) {
      if (!localFile(root, path)) fail(id, `missing or unsafe local reference: ${path}`);
    }
    const checks = task.acceptance;
    if (!Array.isArray(checks) || !checks.length) fail(id, 'acceptance must be nonempty');
    else {
      const checkIds = new Set();
      for (const item of checks) {
        if (!item || !text(item.id) || !text(item.criterion) || checkIds.has(item.id)) { fail(id, 'invalid/duplicate acceptance ID or criterion'); continue; }
        checkIds.add(item.id);
        if (!['PENDING', 'PASS', 'FAIL'].includes(item.result)) fail(id, 'invalid acceptance result');
        if ((item.result === 'PASS' || item.result === 'FAIL') && !localFile(root, item.evidence)) fail(id, 'checked acceptance requires local evidence');
        if (task.status === 'DONE' && item.result !== 'PASS') fail(id, 'DONE requires all acceptance PASS');
      }
    }
    const c = task.checkpoint;
    if (!c || typeof c !== 'object') { fail(id, 'checkpoint required'); continue; }
    for (const key of ['branch', 'base_commit', 'working_tree', 'next_action']) if (!text(c[key])) fail(id, `checkpoint missing ${key}`);
    if (!/^[a-f0-9]{7,40}$/.test(c.base_commit)) fail(id, 'base_commit must be a Git hash');
    if (!text(c.updated_at) || !/^\d{4}-\d{2}-\d{2}T/.test(c.updated_at) || !Number.isFinite(Date.parse(c.updated_at))) fail(id, 'updated_at must be ISO datetime');
    if (!strings(c.completed) || !strings(c.blockers)) fail(id, 'completed/blockers must be string arrays');
    if (task.status === 'BLOCKED' && !c.blockers?.length) fail(id, 'BLOCKED requires a blocker');
    if (task.status === 'DONE' && c.blockers?.length) fail(id, 'DONE cannot have blockers');
    if (!Array.isArray(c.validation)) fail(id, 'validation must be an array');
    else for (const v of c.validation) {
      if (!v || !text(v.command) || !text(v.revision) || !['PASS', 'FAIL', 'NOT_RUN', 'BASELINE'].includes(v.result) || !localFile(root, v.evidence)) fail(id, 'invalid validation entry: command, result, revision and evidence required');
    }
    if (task.status === 'DONE' && !c.validation?.length) fail(id, 'DONE requires validation evidence');
    if (!['NOT_RELEASED', 'RELEASED', 'NOT_APPLICABLE'].includes(task.release?.status)) fail(id, 'release status required');
    if (task.release?.status === 'RELEASED' && (task.status !== 'DONE' || !localFile(root, task.release.evidence))) fail(id, 'RELEASED requires DONE and release evidence');
  }
  if (!current || !Object.hasOwn(current, 'task_id') || (current.task_id !== null && !ids.has(current.task_id))) fail('current', 'task_id must reference a task or be null');
  if (active.length > 1) fail('current', 'only one IN_PROGRESS/VERIFY task is allowed');
  if (active.length && active[0] !== current?.task_id) fail('current', 'selected task must match active work');
  const byId = new Map(tasks.filter(t => t.data?.id).map(t => [t.data.id, t.data]));
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { fail(id, 'dependency cycle'); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    const task = byId.get(id);
    for (const dep of Array.isArray(task?.depends_on) ? task.depends_on : []) {
      if (!byId.has(dep)) fail(id, `missing dependency ${dep}`);
      else {
        if (['READY', ...ACTIVE, 'DONE'].includes(task.status) && byId.get(dep).status !== 'DONE') fail(id, `dependency ${dep} is not DONE`);
        visit(dep);
      }
    }
    visiting.delete(id); visited.add(id);
  }
  for (const id of byId.keys()) visit(id);
  if (!localFile(root, 'AGENTS.md')) fail('AGENTS.md', 'shared agent entrypoint missing');
  return errors;
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}
export function boundedPacket(lines) {
  const result = lines.join('\n');
  return result.length <= 6000 ? result : result.slice(0, 5750) + '\n[Packet truncated to protect context. Read the selected task file and git status --short for complete details. Do not start unauthorized work.]';
}
export function run(command = 'resume', taskId, root = ROOT) {
  if (!['check', 'status', 'resume'].includes(command)) throw new Error('Use check, status or resume [TASK-XXXX]');
  const registry = loadRegistry(root);
  const errors = validateRegistry(root, registry);
  if (errors.length) throw new Error(errors.join('\n'));
  const tasks = registry.tasks.map(item => item.data);
  if (command === 'check') return `PASS: ${tasks.length} tasks; references, states, dependencies and startup limits consistent. Evidence contents and approvals still require review.`;
  if (command === 'status') return tasks.map(t => `${t.id} | ${t.status} | ${t.authorized ? 'authorized' : 'triage only'} | ${t.title}`).join('\n');
  const id = taskId ?? registry.current.task_id;
  const task = tasks.find(t => t.id === id);
  if (id && !task) throw new Error(`Unknown task ${id}`);
  const branch = git(root, ['branch', '--show-current']) || '(detached HEAD)';
  const head = git(root, ['rev-parse', '--short', 'HEAD']);
  const dirty = git(root, ['status', '--short', '--untracked-files=normal']).split('\n').filter(Boolean);
  const lines = ['PROJECT SESSION — read AGENTS.md first', `Git: ${branch} @ ${head}`, `Working tree: ${dirty.length} status entries`, ...dirty.slice(0, 8)];
  if (dirty.length > 8) lines.push(`… ${dirty.length - 8} more entries; inspect git status --short before editing.`);
  if (!task) return boundedPacket([...lines, 'No task selected. Run project:status and follow the user request; do not start backlog automatically.']);
  const c = task.checkpoint;
  lines.push(`Task: ${task.id} — ${task.title}`, `State: ${task.status}; authorized: ${task.authorized}`, `Business outcome: ${task.business_outcome}`, `Owner: ${task.owner}; executor: ${task.executor ?? 'unassigned'}`, `Checkpoint: ${c.updated_at} / ${c.branch} @ ${c.base_commit}`, `Recorded tree: ${c.working_tree}`, `Next: ${c.next_action}`, `Blockers: ${c.blockers.join('; ') || 'none'}`, `Acceptance: ${task.acceptance.filter(a => a.result === 'PASS').length}/${task.acceptance.length} PASS`, `Open: docs/work/tasks/${task.id}.json`, 'Read on demand:', ...task.read_files.map(p => `- ${p}`));
  if (branch !== c.branch || !c.base_commit.startsWith(head)) lines.push('CHECKPOINT DRIFT: branch/HEAD differs from recorded base; inspect changes before trusting earlier validation.');
  if (!task.authorized || ['BACKLOG', 'DONE', 'BLOCKED', 'PAUSED'].includes(task.status)) lines.push('Do not auto-start: this state requires triage, blocker resolution or user direction.');
  lines.push('Checkpoint meaningful progress. Run project:check before handoff. No deployment implied.');
  return boundedPacket(lines);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(run(process.argv[2], process.argv[3])); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
