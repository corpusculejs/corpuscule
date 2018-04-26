declare global {
  type RequestIdleCallbackCancellationToken = any;

  interface RequestIdleCallbackOptions {
    timeout: number;
  }

  interface RequestIdleCallbackDeadline {
    readonly didTimeout: boolean;
    timeRemaining: () => number;
  }

  interface Window {
    readonly requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackCancellationToken;
    readonly cancelIdleCallback: (cancellationToken: RequestIdleCallbackCancellationToken) => void;
  }
}

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
