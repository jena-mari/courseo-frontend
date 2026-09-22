import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from '../src/lib/apiConfig.ts';

test('local backends use the development proxy regardless of loopback hostname', () => {
  for(const host of ['http://localhost:7777','http://127.0.0.1:8000','http://[::1]:7777']) assert.equal(resolveApiBaseUrl(true,host),'');
});
test('production and explicitly remote APIs use their configured address', () => {
  assert.equal(resolveApiBaseUrl(false,' https://api.example.com/ '),'https://api.example.com');
  assert.equal(resolveApiBaseUrl(true,'https://api.example.com'),'https://api.example.com');
  assert.equal(resolveApiBaseUrl(false,' ','https://legacy.example.com/'),'https://legacy.example.com');
});
