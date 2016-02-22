import React from 'react';
// import MobileTearSheet from '../../../MobileTearSheet';
import Avatar from 'material-ui/lib/avatar';
import Clearfix from 'material-ui/lib/clearfix';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Divider from 'material-ui/lib/divider';
import CommunicationChatBubble from 'material-ui/lib/svg-icons/communication/chat-bubble';

import { RED, BLUE } from '../../../constants';

function PlayerListItem(player) {
  return (
    <ListItem
      key={player.name}
      primaryText={player.name}
    />
  );
}

export default function PlayerList({players}) {
  const reds = players.filter(p => p.team === RED);
  const blues = players.filter(p => p.team === BLUE);
  const style = {float: 'left', width: '50%'}
  return (
    <div>
      <Clearfix>
        <List subheader="Red Team" style={style}>
          { reds.map(PlayerListItem) }
        </List>
        <List subheader="Blue Team" style={style}>
          { blues.map(PlayerListItem) }
        </List>
      </Clearfix>
    </div>
  );
}
