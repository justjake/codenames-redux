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

Playing in "single-game mode" in the terminal:
![playing the game](http://take.ms/8iNjn)

The start of the web ui:
![wow material ui quite nice](http://take.ms/xr2VE)

## Slack bot

the slack butt is at version 1.0! It works!

![slack screenshot](http://take.ms/9DD7u)

You'll need to grab a new slack token for this bot, since it's a stand-alone bot
(no Hubot support, sorry). Get one from your Slack team's website. Then,

```
$ npm install -g codenames-redux
$ codenames-redux-slack-bot PERSIST=/path/to/db/dir SLACK_TOKEN=asfajdjfds
```

For everything to work correctly, you should also upload all the custom emoji
used by the bot for drawing the board. Here's how my slack emoji settings look:
![emoji](http://take.ms/lIirQ)

You can find all the emoji in the [images](./images) directory in this repo.

PLEASE PLEASE PLEASE open a Github issue with suggestions for improvements or
bug reports!
