import { RED, BLUE, KILL,
         GIVE_CLUE, GUESS, SKIP,
         SPYMASTER, GUESSER, GAME_OVER,
       } from '../constants';
import { merge, nextTeam } from '../utils';
import { Board } from '../models/Board';
import { includes } from 'lodash';
import { UnknownWordError } from '../errors';


export function initialState(board) {
  return {
    phase: GIVE_CLUE,
    remainingGuesses: null,
    clueHistory: [],
    team: board.startingTeam,
    // board maintains its own mutable state - but we can clone it!
    board: board,
    // will set to the winning team when it habbens
    winner: null,
  }
}

// TODO: HANDLE TIMEOUTS WITH A TIMER_TICK ACTION

function nextPhase(phase) {
  if (phase === GIVE_CLUE) return GUESS;
  if (phase === GUESS) return GIVE_CLUE;
  if (phase === GAME_OVER) return GAME_OVER;
  throw new Error(`wat: should not have unknown phase ${phase}`);
}

const KNOWN_ACTIONS = [GIVE_CLUE, GUESS, SKIP];

export default function gameReducer(state, action) {
  // reject invalid actions
  if (!includes(KNOWN_ACTIONS, action.type)) return state;
  if (state.phase === GAME_OVER) return state;
  if (action.player.team !== state.team) return state;

  // handle skips - increment the phase and team, and make sure we don't have any guesses
  if (action.type === SKIP) {
    return merge(state, {
      phase: nextPhase(state.phase),
      team: nextPhase(state.phase) === GIVE_CLUE ? nextTeam(state.team) : state.team,
      remainingGuesses: null,
    });
  }


  // make sure we an actually execute this action
  // should we reject these here, or somewhere upsteam?
  // should we reject these by throwing execptions (eg UnknownWordError)?
  if (action.type !== state.phase) return state;
  if (action.type === GUESS && action.player.role !== GUESSER) return state;
  if (action.type === GIVE_CLUE && action.player.role !== SPYMASTER) return state;

  switch (action.type) {
  case GIVE_CLUE:
    // super simple - no wins / losses / etc just tick to next phase and record the clue
    return merge(state, {
      phase: nextPhase(state.phase),
      remainingGuesses: action.clue.count + 1,
      clueHistory: clueHistoryReducer(state.clueHistory, action),
    });
    break;
  case GUESS:
    const word = action.word;
    // unsure how i should handle this. i don't really want to track errors in the store
    if (!state.board.hasWord(word)) throw new UnknownWordError(word);
    // re-picking same word should do nothing
    if (state.board.statusOf(word) === state.team) return state;
    const newBoard = state.board.dup();
    newBoard.pick(word);
    const correct = newBoard.statusOf(word) === state.team;
    const remainingGuesses = correct ? state.remainingGuesses - 1 : 0;

    const team = remainingGuesses ? state.team : nextTeam(state.team);
    let phase = remainingGuesses ? state.phase : nextPhase(state.phase);

    // handle win/loss. if this action caused the kill word to be picked, the
    // current team loses.
    let winner = newBoard.getDepleted() || null;
    if (winner === KILL) winner = nextTeam(state.team);
    if (winner) phase = GAME_OVER;

    return merge(state, {
      board: newBoard,
      remainingGuesses,
      team,
      phase,
      winner,
    });
  }

  throw new Error(`oops: should not be able to reach this (action.type: ${action.type})`);
}

function clueHistoryReducer(clueHistory, action) {
  if (action.type !== GIVE_CLUE) return clueHistory;
  return [...clueHistory, {team: action.player.team, clue: action.clue}];
}
