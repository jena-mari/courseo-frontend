import { before, after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
let server, profile, chat, auth, ApiError;
const originalFetch = globalThis.fetch;
const user = {id:'00000000-0000-4000-8000-000000000001',email:'student@example.test',display_name:'Test Student',degree_code:'766',campus:null,major:null,commencement_year:null,elective_interests:['AI']};
before(async () => {
  server = await createServer({configFile:false, server:{middlewareMode:true,watch:null,hmr:false,ws:false},optimizeDeps:{noDiscovery:true,include:[]}});
  profile = await server.ssrLoadModule('/src/lib/profileApi.ts');
  chat = await server.ssrLoadModule('/src/lib/chatApi.ts');
  auth = await server.ssrLoadModule('/src/lib/authApi.ts');
  ({ApiError} = await server.ssrLoadModule('/src/lib/api.ts'));
});
afterEach(() => {globalThis.fetch = originalFetch;});
after(async () => {await server?.close();});
function capture(response, check) {
  globalThis.fetch = async (url, options) => {
    assert.equal(options.credentials, 'include');
    assert.equal(options.headers['Content-Type'], 'application/json');
    check(url,options);
    return response;
  };
}

test('profile PATCH sends supported fields and accepts a response without elective_mode', async () => {
  capture(Response.json(user), (url,options) => {
    assert.equal(url,'/api/v1/auth/me');
    assert.equal(options.method,'PATCH');
    assert.deepEqual(JSON.parse(options.body),{display_name:'Test Student',elective_interests:['AI']});
  });
  assert.deepEqual(await profile.saveProfile({display_name:'Test Student',elective_interests:['AI']}),user);
});

test('new and continued chat requests use the same update-langgraph-flow body without input_type', async () => {
  const context = {profile:{degree_code:'766',campus:null,major:null,commencement_year:null,elective_mode:'interest',elective_interests:['AI']}};
  const result = {session_id:user.id,reply:{id:1,role:'assistant',content:'Hello',created_at:'2026-10-13T00:00:00Z'}};
  for (const continuation of [false,true]) {
    capture(Response.json(result, {status:continuation?200:201}), (url,options) => {
      assert.equal(url, continuation?`/api/v1/chat/${user.id}`:'/api/v1/chat');
      assert.equal(options.method,'POST');
      assert.deepEqual(JSON.parse(options.body),{message:'Hello',context});
    });
    const response = continuation ? await chat.continueChat(user.id,'Hello',undefined,undefined,context) : await chat.startChat('Hello',undefined,undefined,context);
    assert.deepEqual(response,result);
  }
});

test('FastAPI array validation errors preserve loc/type without copying input or echoed secrets', async () => {
  const secret='must-never-appear';
  capture(Response.json({detail:[{loc:['body','elective_mode'],type:'extra_forbidden',msg:'Extra inputs are not permitted',input:'interest'},{loc:['body','password'],type:'value_error',msg:`invalid ${secret}`,input:secret}]},{status:422}),()=>{});
  await assert.rejects(profile.saveProfile({display_name:'Test Student'}), error => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status,422);
    assert.equal(error.issues[0].type,'extra_forbidden');
    assert.deepEqual(error.issues[0].location,['body','elective_mode']);
    assert.match(error.message,/Elective recommendation method.*not supported/);
    assert.ok(!JSON.stringify(error).includes(secret));
    assert.ok(!error.message.includes(secret));
    return true;
  });
});

test('string-detail model errors are actionable application errors, not field validation errors', async () => {
  capture(Response.json({detail:'Your AI provider does not offer the selected model for this key.'},{status:422}),()=>{});
  await assert.rejects(chat.startChat('Hello'),error => {
    assert.match(error.message,/Choose another available model/);
    assert.deepEqual(error.issues,[]);
    return true;
  });
});

test('deletion still sends the exact password and accepts 204 without JSON parsing', async () => {
  const response = new Response(null,{status:204});
  response.json = () => {throw new Error('Must not parse 204');};
  capture(response,(url,options) => {
    assert.equal(url,'/api/v1/auth/me');
    assert.equal(options.method,'DELETE');
    assert.deepEqual(JSON.parse(options.body),{password:' example password '});
  });
  assert.equal(await auth.deleteCurrentAccount(' example password '),undefined);
});

test('an invalid session ID is shown as a chat-session field error', async () => {
  capture(Response.json({detail:[{loc:['path','session_id'],type:'uuid_parsing',msg:'Input should be a valid UUID',input:'obsolete-id'}]},{status:422}),()=>{});
  await assert.rejects(chat.continueChat('obsolete-id','Hello'),/Chat session.*invalid session ID/);
});
