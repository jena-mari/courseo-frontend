import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChatContext } from '../src/lib/chatContext.ts';
import { decodeMessageText } from '../src/lib/messageText.ts';

test('chat context carries academic fields and record without account identity or invented values', () => {
 const user={id:'a',email:'private@example.com',username:'private',displayName:'Private',degreeCode:'766',major:null,campus:null,commencementYear:null,electiveInterests:['AI']};
 assert.deepEqual(buildChatContext(user,' record '),{profile:{degree_code:'766',major:null,campus:null,commencement_year:null,elective_interests:['AI']},enrolment_record:'record'});
 assert.equal(buildChatContext(null,'old record'),undefined);
 assert.equal('enrolment_record' in buildChatContext(user,''),false);
});
test('reply text decodes numeric and double-escaped entities without parsing HTML', () => {
 assert.equal(decodeMessageText('**1.**&#x59;our&nbsp;**degree code**'), '**1.**Your **degree code**');
 assert.equal(decodeMessageText('&amp;#x59;our &#89;ear'), 'Your Year');
 assert.equal(decodeMessageText('&#x110000;'), '&#x110000;');
 assert.equal(decodeMessageText('&lt;img src=x onerror=alert(1)&gt;'), '<img src=x onerror=alert(1)>');
});
