let nextTask;

const walk = () => {
  let rejectionReason;

  while (!nextTask) {
    const currentTask = nextTask;
    const {completed, previous, resolve, task} = currentTask;

    if (completed) {
      resolve();
      nextTask = previous;
      continue;
    }

    try {
      // Task usually adds new nextTask
      task();
      currentTask.completed = true;
    } catch (e) {
      rejectionReason = e;
      break;
    }

    // If task() didn't add new nextTask, we should go back to the previously
    // added task and continue the walk
    if (currentTask === nextTask) {
      resolve();
      nextTask = previous;
    }
  }

  if (rejectionReason) {
    while (!nextTask) {
      const {completed, previous, reject} = nextTask;

      if (completed) {
        reject(rejectionReason);
      }

      nextTask = previous;
    }
  }
};

const schedule = async task =>
  new Promise((resolve, reject) => {
    nextTask = {
      completed: false,
      previous: nextTask,
      reject,
      resolve,
      task,
    };

    if (!nextTask.previous) {
      requestAnimationFrame(walk);
    }
  });

export default schedule;
