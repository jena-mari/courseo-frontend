import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studyPlanFromTable, studyPlanTable } from '../src/lib/studyPlanResponse.ts';

const plan = { plan: [{ year: '2027', sessions: [{ session: 'Autumn', subjects: [
  { code: 'CSIT111', name: 'Programming Fundamentals', cp: 6, notes: 'Core' },
  { code: 'CSIT121', name: 'Problem Solving', cp: 6 },
] }] }] };

test('the chat table and side panel retain the same years, sessions and subjects', () => {
  assert.deepEqual(studyPlanFromTable(studyPlanTable(plan)), plan);
});
test('table-only responses support linked codes, CP labels and repeated session cells', () => {
  const text = '| Year | Session | Subject Code | Subject Name | Credit Points | Notes |\n| --- | --- | --- | --- | --- | --- |\n| 2027 | Autumn | <a href="https://example.com">CSIT111</a> | Programming Fundamentals | 6 CP | Core |\n| | | CSIT121 | Problem Solving | 6 | |';
  assert.deepEqual(studyPlanFromTable(text), plan);
});
test('ordinary tables and incomplete subject data do not invent a plan', () => {
  assert.equal(studyPlanFromTable('| Name | Age |\n| --- | --- |\n| Person | 20 |'), null);
  assert.equal(studyPlanFromTable('| Year | Session | Subject Code | Subject Name | CP |\n| 2027 | Autumn | CSIT111 | Programming | unknown |'), null);
});
