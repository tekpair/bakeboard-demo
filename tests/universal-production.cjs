/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness loads the TypeScript domain modules without another test dependency. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(
    this,
    name.startsWith('@/')
      ? path.resolve(__dirname, '../src', name.slice(2))
      : name,
    ...args,
  );
};
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
const { createSampleTasks } = require('../src/lib/demo-seed.ts');
const {
  normalizeProductionTask,
  pickupDate,
  schedulingError,
} = require('../src/lib/task-production.ts');
const { groupCalendarTasks } = require('../src/lib/calendar.ts');
const {
  isProductionOverdue,
  isAwaitingCollection,
} = require('../src/lib/task-work.ts');
const {
  parseProductionDateTime,
  productionDateTimeInput,
} = require('../src/lib/production-dates.ts');
const { createFixtureTasks } = require('./fixtures/production-tasks.ts');
const samples = createFixtureTasks(Date.parse('2026-11-01T17:00:00Z'));
assert.deepEqual(createSampleTasks(), []);
assert(samples.some((t) => t.taskType === 'general_production'));
assert(samples.some((t) => t.taskType === 'customer_related'));
const due = '2026-11-12T20:00:00.000Z';
const pickup = '2026-11-13T15:00:00.000Z';
const customer = {
  ...samples[0],
  id: 'QA-CUSTOMER',
  customer: '',
  deadline: due,
  productionDue: due,
  pickupAt: pickup,
  allergyNotes: '  Contains milk.\nSeparate tools.  ',
  productionQuantity: 6,
  size: '8-inch',
  flavor: 'Vanilla',
};
const general = {
  ...customer,
  id: 'QA-GENERAL',
  taskType: 'general_production',
};
assert.equal(pickupDate(general), undefined);
assert.equal(pickupDate(customer), pickup);
assert.equal(schedulingError(due, pickup), '');
assert(schedulingError(pickup, due));
const groups = groupCalendarTasks([customer, general], 'America/New_York');
assert.equal(groups.get('2026-11-12').length, 2);
assert.equal(groups.get('2026-11-13').length, 1);
assert.equal(groups.get('2026-11-13')[0].id, customer.id);
assert.equal(groups.get('2026-11-13')[0].calendarMilestone, 'pickup');
assert(isProductionOverdue(customer, Date.parse('2026-11-12T21:00:00Z')));
assert(
  !isAwaitingCollection(
    { ...general, status: 'ready' },
    Date.parse('2026-11-14T00:00:00Z'),
  ),
);
assert(
  isAwaitingCollection(
    { ...customer, status: 'ready' },
    Date.parse('2026-11-14T00:00:00Z'),
  ),
);
const legacy = {
  ...samples[0],
  taskType: undefined,
  productionDue: undefined,
  pickupAt: undefined,
  deadline: pickup,
};
const migrated = normalizeProductionTask(legacy);
assert.equal(migrated.deadline, pickup);
assert.equal(migrated.pickupAt, pickup);
assert.equal(migrated.legacyPickupSchedule, true);
assert.equal(migrated.customer, legacy.customer);
assert.equal(
  productionDateTimeInput(
    parseProductionDateTime('2026-11-12T15:00', undefined, 'America/New_York'),
    'America/New_York',
  ),
  '2026-11-12T15:00',
);
const { canManageTasks, canUpdateTask } = require('../src/lib/permissions.ts');
for (const task of [general, customer]) {
  assert(!canManageTasks('viewer'));
  assert(!canUpdateTask('viewer', 'em', task));
  assert(canUpdateTask('employee', 'em', task));
  assert(!canUpdateTask('employee', 'unassigned-person', task));
  assert(canManageTasks('owner'));
  assert(canManageTasks('manager'));
  assert(canManageTasks('lead'));
}
const memory = new Map();
global.window = {
  localStorage: {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => memory.set(k, v),
    removeItem: (k) => memory.delete(k),
  },
  dispatchEvent: () => {},
};
const storage = require('../src/lib/task-storage.ts');
storage.writeStoredTasks([customer, general, legacy]);
let restored = storage.readStoredTasks();
assert.equal(restored.length, 3);
assert.equal(restored[0].allergyNotes, customer.allergyNotes);
assert.equal(restored[0].productionQuantity, 6);
assert.equal(restored[1].pickupAt, pickup); // retained safely while General
assert.equal(
  pickupDate({ ...restored[1], taskType: 'customer_related' }),
  pickup,
);
assert.equal(restored[2].pickupAt, pickup);
storage.writeStoredTasks(restored.filter((t) => t.id !== 'QA-GENERAL'));
assert.equal(storage.readStoredTasks().length, 2);
assert(storage.resetDemoWorkspace());
assert.deepEqual(storage.readStoredTasks(), []);
assert.equal(storage.readStoredEmployees().length, 2);
assert.deepEqual(storage.readStoredProductionLibrary(), {
  categories: [],
  products: [],
  templates: [],
});
console.log(
  'Universal production: migration, persistence, scheduling, milestones, urgency, hidden data, deletion and reset passed.',
);
