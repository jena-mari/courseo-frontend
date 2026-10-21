import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidCourseCode, getCourseHandbookUrl } from '../src/lib/handbookLinks.ts';

test('handbook URL uses the chat course code and commencement year when available', () => {
  assert.equal(getCourseHandbookUrl('1807', 2024), 'https://courses.uow.edu.au/courses/2024/1807');
  assert.equal(getCourseHandbookUrl('766', 2026), 'https://courses.uow.edu.au/courses/2026/766');
});

test('missing, unknown, or malformed course codes have no direct handbook link', () => {
  assert.equal(getCourseHandbookUrl('', 2026), null);
  assert.equal(getCourseHandbookUrl('UNKNOWN', 2026), null);
  assert.equal(getCourseHandbookUrl('766<script>', 2026), null);
  assert.equal(getCourseHandbookUrl('12345', 2026), null);
  assert.equal(isValidCourseCode('766'), true);
  assert.equal(isValidCourseCode('1807'), true);
  assert.equal(isValidCourseCode('12345'), false);
  assert.equal(isValidCourseCode('UNKNOWN'), false);
  const currentYear = new Date().getFullYear();
  assert.equal(getCourseHandbookUrl('766', null), `https://courses.uow.edu.au/courses/${currentYear}/766`);
  assert.equal(getCourseHandbookUrl('766', 1800), `https://courses.uow.edu.au/courses/${currentYear}/766`);
});
