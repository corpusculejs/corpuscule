// tslint:disable-next-line:readonly-array
const sheduledTasksQueue: Array<() => void> = [];

const next = (deadline: RequestIdleCallbackDeadline): void => {
  while (sheduledTasksQueue.length !== 0) {
    if (deadline.timeRemaining() <= 0) {
      window.requestIdleCallback(next);
      break;
    }

    const task = sheduledTasksQueue.shift()!;
    task();
  }
};

const schedule = async (callback: () => void, shouldBeRenderedImmediately: boolean) => {
  if (shouldBeRenderedImmediately) {
    // tslint:disable-next-line await-promise
    await null;
    callback();

    return;
  }

  const isEmpty = sheduledTasksQueue.length === 0;
  sheduledTasksQueue.push(callback);

  if (isEmpty) {
    window.requestIdleCallback(next);
  }
};

export default schedule;
