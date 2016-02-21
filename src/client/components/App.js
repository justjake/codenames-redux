import React, { Component } from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import renderGame from '../../views/renderGame';

function Lobby({lobby, lobbyId}) {
  return (
      <div>
      <h1>{lobbyId}</h1>
      <h2>players</h2>
      <ul>
      { lobby.players.map(p => <li key={p.name}>{p.name}</li>) }
      </ul>
      <h2>game</h2>
      <code>
      <pre>
      { lobby.game ? renderGame(lobby) : 'no game yet' }
      </pre>
      </code>
      </div>
  );
}

class App extends Component {
  render() {
    const lobbies = this.props.lobbies;
    const lobbyIds = Object.keys(lobbies);
    return (
      <div>
        <h1>all known lobbies</h1>
        { lobbyIds.map(id => {
          return <Lobby key={id} lobbyId={id} lobby={lobbies[id]} />
        })
        }
      </div>
    );
  }
}

export default connect(x => x)(App)
