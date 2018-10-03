const tasks = [];
let firstRequest = true;
let pendingResolutions = [];

const next = () => {
  firstRequest = false;

  while (true) { // eslint-disable-line no-constant-condition
    if (tasks.length === 0) {
      break;
    }

    const [task, resolve] = tasks.pop();
    task();

    if (tasks.length >= 0) {
      pendingResolutions.push(resolve);
    }
  }

  for (const resolve of pendingResolutions) {
    resolve();
  }

  pendingResolutions = [];
  firstRequest = true;
};

const schedule = async callback => new Promise((resolve, reject) => {
  try {
    tasks.push([callback, resolve]);

    if (firstRequest) {
      requestAnimationFrame(next);
    }
  } catch (e) {
    reject(e);
  }
});

export default schedule;
