import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { accountStorage, STORAGE_KEYS, clearCourseoStorage } from '../src/lib/storageKeys.ts';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
  globalThis.sessionStorage = new MemoryStorage();
});

test('a new account cannot inherit another account’s chats, plans, or preferences', () => {
  const alice = accountStorage('alice');
  const bob = accountStorage('bob');
  for (const key of Object.values(STORAGE_KEYS)) {
    alice.setItem(key, 'Alice private data');
    assert.equal(bob.getItem(key), null);
  }
  bob.setItem(STORAGE_KEYS.chats, 'Bob chat');
  bob.removeItem(STORAGE_KEYS.chats);
  assert.equal(alice.getItem(STORAGE_KEYS.chats), 'Alice private data');
});

test('unowned legacy data is never assigned to a registering account', () => {
  for (const key of Object.values(STORAGE_KEYS)) localStorage.setItem(key, 'legacy data');
  for (const key of Object.values(STORAGE_KEYS)) assert.equal(accountStorage('new-user').getItem(key), null);
});

test('acknowledgements survive logout and switching accounts', () => {
  accountStorage('alice').setItem(STORAGE_KEYS.llmPrivacyAcknowledged, 'alice');
  clearCourseoStorage();
  assert.equal(accountStorage('bob').getItem(STORAGE_KEYS.llmPrivacyAcknowledged), null);
  accountStorage('bob').setItem(STORAGE_KEYS.llmPrivacyAcknowledged, 'bob');
  assert.equal(accountStorage('alice').getItem(STORAGE_KEYS.llmPrivacyAcknowledged), 'alice');
});

test('legacy warning acknowledgement is readable only by its recorded owner', () => {
  localStorage.setItem(STORAGE_KEYS.llmPrivacyAcknowledged, 'alice');
  assert.equal(accountStorage('alice').getItem(STORAGE_KEYS.llmPrivacyAcknowledged), 'alice');
  assert.equal(accountStorage('bob').getItem(STORAGE_KEYS.llmPrivacyAcknowledged), null);
});

test('anonymous storage neither reads nor writes account data', () => {
  const guest = accountStorage(null);
  guest.setItem(STORAGE_KEYS.chats, 'guest data');
  assert.equal(guest.getItem(STORAGE_KEYS.chats), null);
  assert.equal(localStorage.values.size, 0);
});

test('a delayed write remains bound to the original account after a switch', () => {
  const oldRequestStorage = accountStorage('alice');
  const currentStorage = accountStorage('bob');
  currentStorage.setItem(STORAGE_KEYS.chats, 'Bob chat');
  oldRequestStorage.setItem(STORAGE_KEYS.chats, 'Alice late reply');
  assert.equal(currentStorage.getItem(STORAGE_KEYS.chats), 'Bob chat');
});
