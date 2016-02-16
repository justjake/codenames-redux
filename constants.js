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

export const SKIP = 'skip';

// root constants
export const REGISTER_PLAYER = 'register player';
export const ELECT_SPYMASTER = 'elect player as spymaster';
export const START_NEW_GAME = 'start new game';
export const RESET = 'fuck it we out';

// game constants
