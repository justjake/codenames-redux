import React from 'react';
import Paper from 'material-ui/lib/paper';
import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
import StarBorder from 'material-ui/lib/svg-icons/toggle/star-border';
import IconButton from 'material-ui/lib/icon-button';
import { red900,
         blue900,
         blueGrey700,
         blueGrey900,
         red100,
         blue100,
         yellow100,
         yellow600
} from 'material-ui/lib/styles/colors';
import { RED, BLUE, KILL, NEUTRAL } from '../../../constants';

function bg(team, isChosen) {
  let bg = yellow100;
  if (team === BLUE) bg = isChosen ? blue900 : blue100;
  if (team === RED) bg = isChosen ? red900 : red100;
  if (team === KILL) bg = isChosen ? blueGrey900 : blueGrey700;
  if (team === NEUTRAL && isChosen) bg = yellow600;
  return bg;
}

function bg2(team, isChosen, showUnguessed) {
  const bgColor = bg(team, isChosen);
  if (showUnguessed) return bgColor;
  if (isChosen) return bgColor;
  return yellow100;
}

function renderWord(word, showUnguessed) {
  const bgColor = bg2(word.team, word.status, showUnguessed);

  return (
    <GridTile
      key={word.word}
      title={word.word}
      style={{
        background: bgColor,
      }}
    />
  );
}

export default function Board({board, showUnguessedColors}) {
  const words = board.getWords();
  const wordProps = words.map(word => ({word, status: board.statusOf(word), team: board.teamOf(word)}));

  return (
    <GridList cols={5}>
      { wordProps.map(word => (
          renderWord(word, showUnguessedColors)
      ))}
    </GridList>
  );
}
