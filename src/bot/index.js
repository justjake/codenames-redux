import CodenamesHubot from './CodenamesHubot';

export default function enable(robot) {
  const bot = new CodenamesHubot(robot);
  bot.addHubotListeners();
  console.log('enabled codenames-hubot shenanigans!');
}
