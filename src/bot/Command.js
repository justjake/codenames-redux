export default class Command {
  constructor(name, ...aliases) {
    this.name = name;
    this.aliases = aliases;
    this.handler = () => null;
    this.help = "no help availible :(";
    this.changesState = false;
  }

  setHelp(help) {
    this.help = help;
    return this;
  }

  setChangesState(doesChangeState = true) {
    this.changesState = doesChangeState;
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
