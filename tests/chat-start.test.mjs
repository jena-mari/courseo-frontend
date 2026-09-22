import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isStudyPlanStarter, chatValidationMessage } from '../src/lib/chatStart.ts';

test('the suggested study-plan request is recognised with common punctuation', () => {
  for (const text of ['Create a study plan for me.', 'Create a study plan for me', ' create a study plan for me! ', 'CREATE A STUDY PLAN FOR ME,']) {
    assert.equal(isStudyPlanStarter(text), true);
  }
  assert.equal(isStudyPlanStarter('Create a study plan for me.\nSubject Code\tYear\tStatus'), false);
  assert.equal(isStudyPlanStarter('What subjects can I study?'), false);
});

test('a missing or unreadable record gets instructions rather than a generic validation error', () => {
  const message = chatValidationMessage('/api/v1/chat', 'No enrolment history was found. Paste the enrolment record from SOLS, including the table of subjects.');
  assert.match(message, /SOLS enrolment record/);
  assert.match(message, /each row on its own line/);
  const sensitive = chatValidationMessage('/api/v1/chat', 'Could not read the subject row at secret-student-data.');
  assert(!sensitive.includes('secret-student-data'));
});

test('unrelated validation failures are not mislabelled as missing records', () => {
  assert.equal(chatValidationMessage('/api/v1/auth/register', 'enrolment'), null);
  assert.equal(chatValidationMessage('/api/v1/chat', [{ loc: ['body', 'model'], msg: 'Invalid model' }]), null);
  assert.equal(chatValidationMessage('/api/v1/chat', 'Unknown model'), null);
});
