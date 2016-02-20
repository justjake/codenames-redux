import { PLAYER_TEAMS, ROLES } from '../constants';
import ExtendableError from 'es6-error';
import { includes } from 'lodash';

class BadTeamError extends ExtendableError {
  constructor(team) {
    super(`Team "${team}" not in known teams ${JSON.stringify(PLAYER_TEAMS)}`)
  }
};
class BadRoleError extends ExtendableError {};

export default class Player {
  constructor(team, role, name) {
    if (!includes(PLAYER_TEAMS, team)) throw new BadTeamError(team);
    if (!includes(ROLES, role)) throw new BadRoleError(role);
    this.team = team;
    this.role = role;
    this.name = name;
  }
}
