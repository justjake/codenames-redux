import React from 'react';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import FlatButton from 'material-ui/lib/flat-button';
import CardText from 'material-ui/lib/card/card-text';

import PlayerList from './PlayerList';
import Board from './Board';

export default function Lobby({lobby, lobbyId}) {
  return (
    <Card>
      <CardTitle title={lobbyId} subtitle={`${lobby.players.length} players`} />
      <CardText>
        <PlayerList players={lobby.players} />
        <h2>Game</h2>
        { lobby.game ? <Board board={lobby.game.board} showUnguessedColors /> : 'no game yet' }
      </CardText>
    </Card>
  );
}
