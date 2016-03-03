import gameReducer, { initialState as gameInitialState } from './game';
import {
  SPYMASTER,
  GUESSER,
  RESET,
  START_NEW_GAME,
  ELECT_SPYMASTER,
  REGISTER_PLAYER,
  REMOVE_PLAYER,
  RED,
  BLUE,
  GAME_OVER,
} from '../constants';
import {
  merge, nextTeam,
  spymastersOf,
  guessersOf,
  ofTeam,
  playerByName,
} from '../utils';
import ExtendableError from 'es6-error';
import Board from '../models/Board';
import Player from '../models/Player';

// errors
class WrongNumberOfSpymasters extends ExtendableError {}
class WrongNumberOfGuessers extends ExtendableError {}
class NameConflict extends ExtendableError {}
class UnknownPlayerError extends ExtendableError {}

export function initialState() {
  return {
    players: [],
    game: null,
  }
}

/**
 * the lobby manages the group of people who want to play a game together
 */
export default function lobbyReducer(state = initialState(), action) {
  console.log('ACTION', action);
  switch (action.type) {

  case RESET:
    return initialState();

  case START_NEW_GAME:
    const teams = [RED, BLUE];
    // make sure we have the right sorts of players
    teams.forEach(team => {
      const members = ofTeam(state.players, team);
      if (spymastersOf(members).length !== 1) throw new WrongNumberOfSpymasters(team);
      if (guessersOf(members).length < 1) throw new WrongNumberOfGuessers(team);
    });
    // ok seems legit
    return merge(state, {game: gameInitialState(new Board())});

  case ELECT_SPYMASTER:
    // create version of this player who is a spymaster
    const newSpymaster = playerToRole(playerByName(state.players, action.name), SPYMASTER);
    // make sure all other players are guessers (this is an over-alloc but should be fine)
    const team = ofTeam(state.players, newSpymaster.team)
            .filter(player => player.name !== newSpymaster.name)
            .map(player => playerToRole(player, GUESSER));
    team.push(newSpymaster);
    const otherTeam = ofTeam(state.players, nextTeam(newSpymaster.team))
    return merge(state, {players: team.concat(otherTeam)});

  case REGISTER_PLAYER:
    // create a new player and put it in the players list
    if (playerByName(state.players, action.name)) throw new NameConflict(action.name);
    const player = new Player(action.team, GUESSER, action.name);
    return merge(state, {players: state.players.concat(player)});

  case REMOVE_PLAYER:
    if (!playerByName(state.players, action.name)) throw new UnknownPlayerError(action.name);
    return merge(state, {players: state.players.filter(p => p.name !== action.name)});

  default:
    // handle other actions with gameReducer
    const newGame = gameReducer(state.game, action);
    if (newGame !== state.game) {
      let players = state.players;
      if (state.game &&
          newGame.phase === GAME_OVER &&
          state.game.phase !== GAME_OVER) {
            // someone just won a game. we should make all players into guessers
            // so that we have fresh spymasters next game.
            // This also forces roster considerations before starting a new game.
            players = players.map(p => playerToRole(p, GUESSER))
      }
      return merge(state, {game: newGame, players: players});
    }
    return state;
  }
}

function playerToRole(player, role) {
  return new Player(player.team, role, player.name);
}
