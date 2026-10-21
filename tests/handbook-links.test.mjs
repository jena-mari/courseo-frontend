import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GENERAL_HANDBOOK_URL, getCourseCodeFromConversation, getCourseHandbookUrl } from '../src/lib/handbookLinks.ts';

test('handbook URL uses the chat course code and commencement year when available', () => {
  assert.equal(getCourseHandbookUrl('1807', 2024), 'https://courses.uow.edu.au/courses/2024/1807');
  assert.equal(getCourseHandbookUrl('766', 2026), 'https://courses.uow.edu.au/courses/2026/766');
});

test('missing or malformed course codes use the official school handbook browser', () => {
  assert.equal(getCourseHandbookUrl('', 2026), GENERAL_HANDBOOK_URL);
  assert.equal(getCourseHandbookUrl('766<script>', 2026), GENERAL_HANDBOOK_URL);
  const currentYear = new Date().getFullYear();
  assert.equal(getCourseHandbookUrl('766', null), `https://courses.uow.edu.au/courses/${currentYear}/766`);
  assert.equal(getCourseHandbookUrl('766', 1800), `https://courses.uow.edu.au/courses/${currentYear}/766`);
});

test('course code can be read from an explicit chat answer without mistaking unrelated numbers', () => {
  assert.equal(getCourseCodeFromConversation([
    { role: 'assistant', content: 'What is your UOW course code?' },
    { role: 'user', content: '1807' },
  ]), '1807');
  assert.equal(getCourseCodeFromConversation([
    { role: 'user', content: 'My student number is 12345678 and I am in year 2.' },
  ]), null);
  assert.equal(getCourseCodeFromConversation([
    { role: 'user', content: 'Course code: 766' },
  ]), '766');
});
