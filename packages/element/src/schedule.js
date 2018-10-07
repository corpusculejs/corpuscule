const tasks = [];
let firstRequest = true;

const next = () => {
  firstRequest = false;

  const pendingResolutions = [];
  let rejectionReason;

  while (true) { // eslint-disable-line no-constant-condition
    if (tasks.length === 0) {
      break;
    }

    const [task, resolve, reject] = tasks.pop();

    pendingResolutions.push(resolve, reject);

    try {
      task();
    } catch (e) {
      rejectionReason = e;
      break;
    }
  }

  for (let i = 0; i < pendingResolutions.length; i += 2) {
    const resolve = pendingResolutions[i];
    const reject = pendingResolutions[i + 1];

    if (rejectionReason) {
      reject(rejectionReason);
    } else {
      resolve();
    }
  }

  firstRequest = true;
};

const schedule = async callback => new Promise((resolve, reject) => {
  tasks.push([callback, resolve, reject]);

  if (firstRequest) {
    requestAnimationFrame(next);
  }
});

export default schedule;
