/**
 * THIS IS THE BROWSER ENTRYPONT
 */

import Client from './';
import url from 'url';
import React, { Component } from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { RED, BLUE } from '../constants';
import setUpGame from '../standalone-game';

const API_HOST = 'http://localhost:1338';
const API_PATH = `${API_HOST}/api/v0`;
const DUDER = 'bob the builder';

const client = new Client(API_HOST, API_PATH);
window.client = client;
render(<App store={client.store} />, document.getElementById('root'))

console.log('woot, client');

client.createLobby().then(lobbyId => {
  console.log('created lobby with id', lobbyId);
  client.joinLobby(lobbyId, DUDER, RED).then(() => {
    const lobby = client.lobby(lobbyId);
    setUpGame(lobby);
  })
})
