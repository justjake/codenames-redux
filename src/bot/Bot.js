import parseArgs from 'minimist';
import Command from './Command';
import { CMD_HELP, CMD_BAD_COMMAND } from './constants';

export default class Bot {
  constructor() {
    this.commands = [];
    this.cmdMap = {};
    this.help = 'some generic bot thinger'
  }

  addCommand(handler, name, ...aliases) {
    if (!handler || !handler.bind) throw new Error(`handler ${handler} for name ${name} is bad`);
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
    const [cmd, ...cmdArgs] = allArgv._;
    const argv = parseArgs(cmdArgs);

    // root --help or --?
    if (this.wantsHelp(allArgv)) {
      return {
        name: CMD_HELP,
        argv,
        allArgv,
      };
    }

    // unknown shenanigans
    if (!cmd || !this.cmdMap.hasOwnProperty(cmd)) {
      return {
        name: CMD_BAD_COMMAND,
        argv,
        allArgv,
      };
    }

    return {
      name: cmd,
      argv,
      allArgv,
    };
  }

  run(string) {
    const action = this.parse(string);
    const cmd = this.cmdMap[action.name];
    // TODO
  }

  renderCommands() {
    return this.commands.map(cmd => {
      const aliases = cmd.aliases.length ?
                      `(aliases: ${cmd.aliases.join(', ')})`:
                      '';
      return `  ${cmd.name} ${aliases}`;
    }).join('\n');
  }

  renderHelp() {
    const commands = this.renderCommands();
    return `
${this.help}

List of commands:
${commands}`;
  }
}
