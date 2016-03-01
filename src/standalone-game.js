import { RED, BLUE } from './constants';

// these are used as player names for the required 4 players to play a simple
// game via the readline UI.
export const RED_SPYMASTER = 'red spymaster';
export const BLUE_SPYMASTER = 'blue spymaster';
export const RED_GUESSER = 'red guessers';
export const BLUE_GUESSER = 'blue guessers';

export default function setUpGame(lobbyProxy, start = true) {
  // create all required players
  lobbyProxy.registerPlayer(RED_SPYMASTER, RED);
  lobbyProxy.registerPlayer(BLUE_SPYMASTER, BLUE);
  lobbyProxy.registerPlayer(RED_GUESSER, RED);
  lobbyProxy.registerPlayer(BLUE_GUESSER, BLUE);

  // assign spymasters
  lobbyProxy.electSpymaster(RED_SPYMASTER);
  lobbyProxy.electSpymaster(BLUE_SPYMASTER);

  // boom
  if (start) lobbyProxy.startNewGame();
}
