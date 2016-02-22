"use strict";
import React, { Component } from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import renderGame from '../../../views/renderGame';

import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import AppBar from 'material-ui/lib/app-bar';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import {deepOrange500, indigo500} from 'material-ui/lib/styles/colors';
import {Spacing} from 'material-ui/lib/styles';
import Paper from 'material-ui/lib/paper';

import Lobby from './Lobby'

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: indigo500,
  },
});

class App extends Component {
  getStyles() {
    return {
      root: {
        paddingTop: Spacing.desktopKeylineIncrement,
      },
      content: {
        margin: '1em',
        padding: '1em',
      }
    }
  }
  render() {
    const styles = this.getStyles();
    const { prepareStyles } = muiTheme;
    const lobbies = this.props.lobbies;
    const lobbyIds = Object.keys(lobbies);
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <AppBar
            title="Codenames"
            zDepth={0}
            style={{
                position: 'fixed',
              }}

            />
          <div style={prepareStyles(styles.root)}>
            <Paper zDepth={2} style={prepareStyles(styles.content)}>
              <h1>all known lobbies</h1>
              {
                lobbyIds.map(id => {
                  return <Lobby key={id} lobbyId={id} lobby={lobbies[id]} />
                })
              }
            </Paper>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default connect(x => x)(App)
