import parseArgs from 'minimist';
import Command from './Command';

export default class Bot {
  constructor() {
    this.commands = [];
    this.cmdMap = {};
    this.help = 'some generic bot thinger'
  }

  addCommand(handler, name, ...aliases) {
    const cmd = new Command(name, ...aliases);
    this.commands.push(cmd);
    [name, ...aliases].forEach(alias => this.cmdMap[alias] = cmd);
    cmd.setHandler(handler.bind(this));
    return cmd;
  }

  wantsHelp(argv) {
    return (argv.help || argv['?']);
  }

  parse(string) {
    const args = string.split(/\s+/);
    const allArgv = parseArgs(args, {stopEarly: true});
    const [cmd, ...cmdArgs] = argv._;

    // --help or --?
    if (this.wantsHelp(allArgv)) {
      return {
        name: CMD_HELP,
        allArgv,
      };
    }

    // unknown shenanigans
    if (!cmd || !this.cmdMap.hasOwnProperty(cmd)) {
      return {
        name: CMD_BAD_COMMAND,
        allArgv,
      };
    }

    return {
      name: cmd,
      argv: parseArgs(cmdArgs),
      allArgv,
    };
  }

  run(string) {
    const action = this.parse(string);
    const cmd = this.cmdMap[action.name];
    // TODO
  }

  renderHelp() {
    const commands = this.commands.map(cmd => {
      const aliases = cmd.aliases.length ?
                      `(aliases: ${cmd.aliases.join(', ')})`:
                      '';
      return `  ${cmd.name} ${aliases}`;
    }).join('\n');

    return `
${this.help}

List of commands:
${commands}`;
  }
}
