/* eslint-disable callback-return */
const scheduledTasks = [];

const next = (deadline) => {
  while (scheduledTasks.length !== 0) {
    if (deadline.timeRemaining() <= 0) {
      requestIdleCallback(next);
      break;
    }

    const [task, resolve] = scheduledTasks.shift();
    task().then(resolve);
  }
};

const schedule = async (callback, immediately) =>
  new Promise(async (resolve, reject) => {
    try {
      if (immediately) {
        await callback();
        resolve();

        return;
      }

      const isEmpty = scheduledTasks.length === 0;
      scheduledTasks.push([callback, resolve]);

      if (isEmpty) {
        requestIdleCallback(next);
      }
    } catch (e) {
      reject(e);
    }
  });

export default schedule;
