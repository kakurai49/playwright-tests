#!/usr/bin/env node
import http from 'node:http';
import { createReadStream, stat } from 'node:fs';
import { resolve, sep } from 'node:path';

const port = Number(process.env.PORT) || 4173;
const rootDir = resolve(process.cwd(), 'tests', 'fixtures');

const getContentType = (path) => {
  if (path.endsWith('.html')) return 'text/html; charset=utf-8';
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (path.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
};

const server = http.createServer((req, res) => {
  const { url = '/' } = req;
  const sanitizedPath = url.split('?')[0].replace(/\/+$/, '') || '/';
  const targetPath = sanitizedPath.endsWith('/')
    ? sanitizedPath + 'index.html'
    : sanitizedPath;

  const resolvedPath = resolve(rootDir, '.' + targetPath);

  if (!resolvedPath.startsWith(rootDir + sep) && resolvedPath !== rootDir) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(resolvedPath) });
    createReadStream(resolvedPath).pipe(res);
  });
});

server.listen(port, () => {
  const message = `Static server listening on http://127.0.0.1:${port} serving ${rootDir}`;
  console.log(message);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
