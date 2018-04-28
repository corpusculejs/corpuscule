type RequestIdleCallbackCancellationToken = any;

interface RequestIdleCallbackOptions {
  readonly timeout: number;
}

interface RequestIdleCallbackDeadline {
  readonly didTimeout: boolean;
  readonly timeRemaining: () => number;
}

interface Window {
  readonly requestIdleCallback: (
    callback: (deadline: RequestIdleCallbackDeadline) => void,
    opts?: RequestIdleCallbackOptions,
  ) => RequestIdleCallbackCancellationToken;
  readonly cancelIdleCallback: (cancellationToken: RequestIdleCallbackCancellationToken) => void;
}
