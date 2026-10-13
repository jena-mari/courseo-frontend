// Production-like static host: deliberately no SPA fallback.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.gif':'image/gif','.ttf':'font/ttf'};
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  try {
    const contents = await readFile(file);
    response.writeHead(200, {'Content-Type':types[path.extname(file)] ?? 'application/octet-stream'});
    response.end(contents);
  } catch {
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.end('Not Found');
  }
}).listen(4173, '127.0.0.1');
