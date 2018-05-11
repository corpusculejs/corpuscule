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
const scheduledTasks: Array<[() => void, () => void]> = [];

const next = (deadline: RequestIdleCallbackDeadline): void => {
  while (scheduledTasks.length !== 0) {
    if (deadline.timeRemaining() <= 0) {
      requestIdleCallback(next);
      break;
    }

    const [task, resolve] = scheduledTasks.shift()!;
    task();
    resolve();
  }
};

const schedule = async (callback: () => void, immediately: boolean) =>
  new Promise<void>((resolve, reject) => {
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
