let nextTask;

/**
 * The function schedules tree-structured tasks where one task could generate a number of children
 * that should be executed as well. Tasks are connected via a linked list. Tree traversing
 * algorithm is depth-first and stack-oriented, so the latest task will be performed first. When
 * there are no children for the current task, it goes back for one node and checks if the task is
 * already executed. If yes, it goes back one more time - and so on. If it finds an uncompleted
 * task, it runs it and its children until all tasks in the list are completed.
 *
 * If task execution runs into an error, it rejects all promises until the top one.
 */
const walk = () => {
  let rejectionReason;

  while (nextTask) {
    const currentTask = nextTask;
    const {completed, previous, resolve, reject, task} = currentTask;

    if (completed) {
      if (rejectionReason) {
        reject(rejectionReason);
      }

      nextTask = previous;
      continue;
    }

    try {
      // Task usually adds a new nextTask
      task();
      resolve();
      currentTask.completed = true;
    } catch (e) {
      reject(e);
      rejectionReason = e;

      // If we have an error, we have to go back and reject all parent nodes
      nextTask = previous;
      continue;
    }

    // If task() didn't add new nextTask, we should go back to the previously
    // added task and continue the walk
    if (currentTask === nextTask) {
      nextTask = previous;
    }
  }
};

/**
 * The function schedules execution of a task.
 *
 * @param {Function} task function to schedule
 * @returns {Promise<void>} a Promise which resolves when the task is completed or rejects if there
 * is any error.
 */
const schedule = async task =>
  new Promise((resolve, reject) => {
    nextTask = {
      completed: false,
      previous: nextTask,
      reject,
      resolve,
      task,
    };

    // If it is the first task to execute
    if (!nextTask.previous) {
      requestAnimationFrame(walk);
    }
  });

export default schedule;
