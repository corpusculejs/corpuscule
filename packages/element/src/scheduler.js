/* eslint-disable callback-return */
const scheduledTasks = [];

const next = (deadline) => {
  while (scheduledTasks.length !== 0) {
    if (deadline.timeRemaining() <= 0) {
      requestIdleCallback(next);
      break;
    }

    const [task, resolve] = scheduledTasks.shift();
    task();
    resolve();
  }
};

const schedule = async (callback, immediately) =>
  new Promise((resolve, reject) => {
    try {
      if (immediately) {
        callback();
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
