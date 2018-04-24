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

const queue: Array<() => void> = [];
let initialRender = true;

const next = (deadline: RequestIdleCallbackDeadline): void => {
  while (queue.length !== 0) {
    if (deadline.didTimeout) {
      window.requestIdleCallback(next);
      break;
    }

    const scheduled = queue.shift()!;
    scheduled();
  }
};

const schedule = async (callback: () => void) => {
  const isEmpty = queue.length === 0;
  queue.push(callback);

  if (isEmpty) {
    if (initialRender) {
      await Promise.resolve();
      for (const scheduled of queue) {
        scheduled();
      }
      queue.length = 0;
      initialRender = false;
    } else {
      window.requestIdleCallback(next);
    }
  }
};

export default schedule;
