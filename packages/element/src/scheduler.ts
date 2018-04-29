type RequestIdleCallbackCancellationToken = any;

interface RequestIdleCallbackOptions {
  readonly timeout: number;
}

interface RequestIdleCallbackDeadline {
  readonly didTimeout: boolean;
  readonly timeRemaining: () => number;
}

declare const requestIdleCallback: (
  callback: (deadline: RequestIdleCallbackDeadline) => void,
  opts?: RequestIdleCallbackOptions,
) => RequestIdleCallbackCancellationToken;

// tslint:disable-next-line:no-unused-variable
declare const cancelIdleCallback: (cancellationToken: RequestIdleCallbackCancellationToken) => void;

// tslint:disable-next-line:readonly-array
const sheduledTasksQueue: Array<() => void> = [];

const next = (deadline: RequestIdleCallbackDeadline): void => {
  while (sheduledTasksQueue.length !== 0) {
    if (deadline.timeRemaining() <= 0) {
      requestIdleCallback(next);
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
    requestIdleCallback(next);
  }
};

export default schedule;
