import CodenamesSlackRobot from './CodenamesSlackRobot.js';
import SlackRobot from 'slack-robot';
import Persistance from './persistence';
import { createStore } from 'redux';
import botReducer from './reducers';

function launchRobot(store, apiKey) {
  const robot = new SlackRobot(apiKey);
  const codenames = new CodenamesSlackRobot(store, robot);
  codenames.addSlackRobotListener();
  robot.on('error', (err) => console.error(err));
  robot.start();
  return robot;
}

function makeStore(diskPath) {
  if (diskPath) {
    const atom = new Persistance(diskPath);
    const data = atom.get();
    const store = createStore(botReducer, data);
    store.subscribe(() => {
      atom.put(store.getState());
    });
    return store;
  }
  return createStore(botReducer);
}


export default function main() {
  const apiKey = process.env.SLACK_TOKEN;
  const loc = process.env.PERSIST;
  if (!apiKey) throw new Error('set SLACK_TOKEN to your slack API key.');
  const store = makeStore(loc);
  return launchRobot(store, apiKey);
}

if (require.main === module) {
  main();
}
