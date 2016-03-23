// board layout
export const ROWS = 5;
export const COLS = 5;
export const SQUARES = ROWS * COLS;

// teams
export const RED = 'red';
export const BLUE = 'blue';
export const NEUTRAL = 'neutral';
export const KILL = 'kill';
export const PLAYER_TEAMS = [RED, BLUE];
export const TEAMS = [RED, BLUE, NEUTRAL, KILL];

// team counts
export const KILLS = 1;
export const STARTING_TEAMS = 9;
export const SECOND_TEAMS = 8;
export const NEUTRALS = SQUARES - STARTING_TEAMS - SECOND_TEAMS - KILLS;

// player roles - do we even need this?
export const GUESSER = 'guesser';
export const SPYMASTER = 'spymaster';
export const ROLES = [GUESSER, SPYMASTER];

// turn phases
export const GIVE_CLUE = 'give clue';
export const GUESS = 'guess';
export const GAME_OVER = 'game over';

export const SKIP = 'skip';

// lobby constants
export const REGISTER_PLAYER = 'register player';
export const SHUFFLE_PLAYERS = 'shuffle players';
export const ELECT_SPYMASTER = 'elect player as spymaster';
export const START_NEW_GAME = 'start new game';
export const RESET = 'fuck it we out';
export const REMOVE_PLAYER = 'remove player'

// game management constatnts
export const CREATE_LOBBY = 'create lobby';
export const DESTROY_LOBBY = 'destroy lobby';
export const LOBBY_SCOPED_ACTION = 'in lobby';

// bot management constants
export const CREATE_LOBBY_IN_CHANNEL = 'create game in channel';
export const JOIN_LOBBY_TO_CHANNEL = 'join lobby to channel'
export const REMOVE_LOBBY_FROM_CHANNEL = 'remove lobby from channel';
