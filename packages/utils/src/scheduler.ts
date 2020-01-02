type Node = {
  child?: Node;
  executed: boolean;
  parent?: Node;
  reject: (reason: Error) => void;
  resolve: () => void;
  sibling?: Node;
  task: () => void;
};

let currentNode: Node | undefined;
let newNode: Node | undefined;

/**
 * The function schedules tree-structured tasks where one task could generate a
 * number of children which execution is also scheduled. Each task is connected
 * to a parent one, and also can have a child and a sibling. Traversing
 * algorithm is depth-first. There are two visits to the node: the first one
 * occurs when the task is going to be performed, and the second one is when we
 * need to resolve or reject the scheduled promise.
 *
 * If task execution runs into an error, it rejects all promises until the top one.
 */
const walk = (): void => {
  let rejectionReason: Error | undefined;

  while (currentNode) {
    const {executed, resolve, reject, task} = currentNode;

    if (executed) {
      if (rejectionReason) {
        reject(rejectionReason);
        currentNode = currentNode.parent;
      } else {
        resolve();
        currentNode = currentNode.sibling ?? currentNode.parent;
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

    currentNode = currentNode.child ?? currentNode;
  }

  newNode = currentNode;
};

const schedule = async (task: () => void): Promise<void> =>
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
