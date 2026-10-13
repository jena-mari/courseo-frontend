import { test } from 'node:test';
import assert from 'node:assert/strict';
import { legacyHashRoute } from '../src/lib/hashRouting.ts';
test('legacy route conversion preserves reset tokens and settings anchors', () => {
  assert.equal(legacyHashRoute({pathname:'/reset-password',search:'?token=example',hash:''}), '/#/reset-password?token=example');
  assert.equal(legacyHashRoute({pathname:'/settings',search:'?tab=system',hash:'#api-keys'}), '/#/settings?tab=system#api-keys');
});
test('existing hash routes and unknown paths are not rewritten', () => {
  assert.equal(legacyHashRoute({pathname:'/',search:'',hash:'#/chat'}), null);
  assert.equal(legacyHashRoute({pathname:'/api/v1/auth/me',search:'',hash:''}), null);
});
