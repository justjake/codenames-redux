# codenames-redux

ok, a redux learning project that implements the great boardgame Codenames. Very
fun IRL, let's see how far we can go with redux.

So far, there is a barebones, terminal-centric UI for entering commands, and a
simple HTTP server for viewing Spymaster and Guesser versions of the current
game.

## Usage

run `npm test` to start the game. Type commands like `give clue foo 2` to give
`foo 2` as a clue. Visit localhost:1337 for the guesser view. I recommend
putting this on a second computer and letting the guessers stare at it.

The main computer should be used for the spymasters. Put a `watch curl
localhost:1337/spymaster` in one terminal, and leave the game process with the
readline interface in another terminal. Have the guessers relay their guesses to
the spymasters, who do all the computer input.

Here's how it looks:

![generated board](http://take.ms/22NfJ)
