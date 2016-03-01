import Bot from './Bot';
import ExtendableError from 'es6-error';

class RequiresChannelError extends ExtendableError {}

export const HUBOT_RESPOND_REGEX = /codenames(.*)/;

export default class HubotBot extends Bot {
  constructor(hubot) {
    super();
    this.robot = hubot;
  }

  pm(username, string) {
    // TODO: implement pms harder
    return this.robot.messageRoom(username, string)
  }

  channelOf(res) {
    // TODO: implement getting the channel of a Response.
    return res.envelope.room || null;
  }

  usernameOf(res) {
    return res.envelope.user.name;
  }

  guardChannel(res) {
    const channel = this.channelOf(res);
    if (channel) return channel;

    throw new RequiresChannelError();
  }

  addHubotListeners() {
    this.robot.respond(HUBOT_RESPOND_REGEX, (res) => this.run(res));
  }

  // where the magic happens
  run(res) {
    const unparsedArgs = res.match[1].trim();
    const { name, argv, allArgv } = this.parse(unparsedArgs);
    if (argv) argv.allArgv = allArgv;
    const cmd = this.cmdMap[name];
    if (argv && this.wantsHelp(argv))  {
      res.send(cmd.renderHelp());
      return { cmd, name, argv, successful: false, };
    }

    try {
      cmd.handler(argv, res)
    } catch (err) {
      res.reply(`Error while handling command "${name}":`);
      res.reply(err.stack);
      return { cmd, name, argv, err, successful: false, };
    }

    return { cmd, name, argv, successful: true, };
  }
}
