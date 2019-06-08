let currentNode;
let newNode;

/**
 * Schedules tree-structured tasks where one task could generate a number of
 * children which execution is also scheduled. Each task is connected to a
 * parent one, and also can have a child and a sibling. Traversing algorithm is
 * depth-first. There are two visits to the node: the first one occurs when the
 * task is going to be performed, and the second one is when we need to resolve
 * or reject the scheduled promise.
 *
 * If task execution runs into an error, it rejects all promises from bottom to
 * top.
 */
const walk: () => void = () => {
  let rejectionReason;

  while (currentNode) {
    const {executed, resolve, reject, task} = currentNode;

    if (executed) {
      if (rejectionReason) {
        reject(rejectionReason);
        currentNode = currentNode.parent;
      } else {
        resolve();
        currentNode = currentNode.sibling || currentNode.parent;
      }

      continue;
    }

    try {
      currentNode.executed = true;
      task();
    } catch (e) {
      rejectionReason = e;
      continue;
    }

    currentNode = currentNode.child || currentNode;
  }

  newNode = currentNode;
};

/**
 * Schedules execution of a task.
 *
 * @param task function to schedule
 * @returns a Promise which resolves when the task is completed or rejects if
 * there is any error.
 */
const schedule: (task: () => void) => Promise<void> = async task =>
  new Promise((resolve, reject) => {
    const previousNode = newNode;

    newNode = {
      executed: false,
      reject,
      resolve,
      task,
    };

    // If it is the first task to execute
    if (!previousNode) {
      currentNode = newNode;
      requestAnimationFrame(walk);

      return;
    }

    if (previousNode.executed) {
      previousNode.child = newNode;
      newNode.parent = previousNode;
    } else {
      previousNode.sibling = newNode;
      newNode.parent = previousNode.parent;
    }
  });

export default schedule;
