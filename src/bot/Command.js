export default class Command {
  constructor(name, ...aliases) {
    this.name = name;
    this.aliases = aliases;
    this.handler = () => null;
    this.help = "no help availible :(";
    this._changesGame = false;
    this._changesTeams = false;
  }

  setHelp(help) {
    this.help = help;
    return this;
  }

  changesGame(doesChange = true) {
    this._changesGame = doesChange;
    return this;
  }

  changesTeams(doesChange = true) {
    this._changesTeams = doesChange;
    return this;
  }

  setHandler(handler) {
    this.handler = handler;
    return this;
  }

  renderHelp() {
    return `
command: ${this.name}
aliases: ${this.aliases.join(', ')}

${this.help}
`;
  }
}
