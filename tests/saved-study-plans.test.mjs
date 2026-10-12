import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clearStudyPlansFromChats, restoreSavedStudyPlan } from '../src/lib/savedStudyPlans.ts';

test('cleared plans remain cleared after restoring chats while preserving messages', () => {
  const original = { id: 'one', backendSessionId: 'one', messages: [{role:'assistant', content:'old plan table'}], studyPlanData: {plan: []} };
  const [cleared] = JSON.parse(clearStudyPlansFromChats(JSON.stringify([original])));
  assert.deepEqual(cleared.messages, original.messages);
  assert.equal(cleared.backendSessionId, original.backendSessionId);
  assert.equal(restoreSavedStudyPlan(cleared, () => { throw new Error('must not recover deleted plan'); }), null);
});
test('legacy chats can recover plans and newly generated plans can replace cleared ones', () => {
  const plan = {plan: []};
  assert.equal(restoreSavedStudyPlan({studyPlanData:null}, () => plan), plan);
  assert.equal(restoreSavedStudyPlan({studyPlanData:plan, studyPlanCleared:false}, () => null), plan);
});
test('invalid conversation storage fails without producing a replacement', () => {
  for (const raw of ['broken', '{}', '[null]']) assert.throws(() => clearStudyPlansFromChats(raw));
});
