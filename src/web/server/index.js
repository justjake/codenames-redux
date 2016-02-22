import makeExpressApp from './http';
import makeSocketApp from './socket';
import http from 'http';

export function makeServer(store) {
  const app = makeExpressApp(store);
  const server = http.Server(app);
  const io = makeSocketApp(server, store);
  return server
}

export function startServer(store, port) {
  const server = makeServer(store);
  server.listen(port);
  return server;
}
