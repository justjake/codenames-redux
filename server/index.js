import express from 'express';
import uuid from 'node-uuid';
import { playerByName } from '../utils';
import socketIO from 'socket.io';
import http from 'http';
import { JOIN_LOBBY, LOBBY_UPDATE } from '../constants'

function getLobbyById(store, lobbyId) {
  const state = store.getState();
  return state.lobbies[id];
}

function makeExpressApp(store) {
  const app = express();
  const api = express.Router();
  app.use('/api/v0', api);

  // get all application state
  api.get('/all', (req, res) => {
    res.json(store.getState())
  });

  // create a new lobby, returning the new lobby state and the 4-letter lobby id code
  api.post('/lobby', (req, res) => {
    const ticket = `${req.param.ticket || 'no-request-ticket'}-${uuid.v4()}`;
    store.dispatch(actions.createLobby(ticket));
    state = store.getState();
    const lobbyId = getLobbyIdForTicket(state, ticket);
    const lobby = state.lobbies[lobbyId]
    res.json({
      // here's the id, brother
      lobbyId,
      // don't need to re-fetch this
      lobby,
    });
  });

  // get the full state of a lobby, including any game in progress
  api.get('/lobby/:id', (req, res) => {
    const lobby = getLobbyById(store, req.param.id);
    res.json({
      lobbyId: req.param.id,
      lobby,
    });
  });

  // we'll send this to join a user to a lobby, creating a new player
  // response: the Player object, and the total lobby state
  api.post('/lobby/:id/join', (req, res) => {
    const lobby = new LobbyProxy(req.param.id, store);
    lobby.registerPlayer(req.param.name, req.param.team);
    const state = lobby.getState();
    const player = playerByName(state);
    res.join({
      player,
      lobby: state,
    });
  });

  // after you've joined a lobby, you should switch over to a websocket-based API and
  // create actions directly using the Player object that you're holding.
  // our side of the socket will handle scoping requests to the lobby

  return app;
}

function makeSocketApp(httpServer, store) {
  const io = socketIO(httpServer);

  // allow sockets to join lobbies with the JOIN_LOBBY command
  io.on('connection', socket => {
    socket.on(JOIN_LOBBY, (lobbyId) => {
      socket.join(lobbyId);
    });
  });

  let prevState = store.getState();

  // whenever there is a change, broadcast new state to each game by id
  store.subscribe(() => {
    const state = store.getState();
    Object.keys(state.lobbies).forEach(lobbyId => {
      const oldLobby = prevState.lobbies[lobbyId];
      const newLobby = state.lobbies[lobbyId];
      if (oldLobby === newLobby) return;
      io.to(lobbyId).emit(LOBBY_UPDATE, newLobby);
    });
    prevState = state;
  });

  return io;
}

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
