import express from 'express';
import { api } from './server/api';
import { browserDistFolder, port } from './server/config';
import { ssrHandler } from './server/ssr';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Order matters: API and static files before the Angular catch-all.
  server.use('/api', api);
  server.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }));
  server.get('*', ssrHandler);

  return server;
}

app().listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
