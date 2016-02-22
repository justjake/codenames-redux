import express from 'express';
import bodyParser from 'body-parser';
import uuid from 'node-uuid';
import socketIO from 'socket.io';

import { playerByName } from '../../utils';
import { API_V0, JOIN_LOBBY, ACTION_FROM_SERVER, ACTION_FROM_CLIENT } from '../constants';
import { lobbyUpdate, joinedLobby } from '../actions';
import { createLobby } from '../../actions';
import LobbyProxy from '../../LobbyProxy';

// creates an express app with the usual features
function baseApp() {
  const app = express();

  // make sure we have propper access control headers to allow interacting with
  // hotplug dev server
  // TODO scope to development only
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // parse json bodies from POST requests
  app.use(bodyParser.json());

  return app;
}

// will move this to seperate file once there's another api ;)
function apiV0(store) {
  const api = express.Router();

  // get all application state
  api.get('/all', (req, res) => {
    res.json(store.getState())
  });

  // create a new lobby, returning the new lobby state and the 4-letter lobby id code
  api.post('/lobby', (req, res) => {
    const ticket = `${req.params.ticket || 'no-request-ticket'}-${uuid.v4()}`;
    store.dispatch(createLobby(ticket));
    const state = store.getState();
    const lobbyId = state.ticketsToIds[ticket];
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
    const state = store.getState();
    const lobby = state.lobbies[req.params.id];
    res.json({
      lobbyId: req.params.id,
      lobby,
    });
  });

  // we'll send this to join a user to a lobby, creating a new player
  // response: the Player object, and the total lobby state
  api.post('/lobby/:id/join', (req, res) => {
    const lobby = new LobbyProxy(req.params.id, store);
    lobby.registerPlayer(req.body.name, req.body.team);
    const state = lobby.getState();
    const player = playerByName(state.players, req.body.name);
    res.send({
      player,
      lobby: state,
    });
  });

  // after you've joined a lobby, you should switch over to a websocket-based API and
  // create actions directly using the Player object that you're holding.
  // our side of the socket will handle scoping requests to the lobby

  return api;
}

export default function makeApp(store) {
  const app = baseApp();
  app.use(API_V0, apiV0(store));
  return app;
}
