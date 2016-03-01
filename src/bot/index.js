import CodenamesSlackRobot from './CodenamesSlackRobot.js';
import SlackRobot from 'slack-robot';

function launchRobot(apiKey) {
  const robot = new SlackRobot(apiKey);
  const codenames = new CodenamesSlackRobot(robot);
  codenames.addSlackRobotListener();
  robot.on('error', (err) => console.error(err));
  robot.listen('hello', function (req, res) {
    return res.text('world').send();
  });
  robot.start();
  return robot;
}

export default function main() {
  const apiKey = process.env.SLACK_TOKEN;
  if (!apiKey) throw new Error('set SLACK_TOKEN to your slack API key.');
  return launchRobot(apiKey);
}

if (require.main === module) {
  main();
}
