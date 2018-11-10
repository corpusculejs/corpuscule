export interface AssertOptions {
  readonly correct?: boolean;
  readonly customMessage?: string;
}

export const assertKind: (
  decoratorName: string,
  expectedKind: string,
  receivedKind: string,
  options?: AssertOptions,
) => void;

export const assertPlacement: (
  decoratorName: string,
  exepectedPlacement: string,
  receivedPlacement: string,
  options?: AssertOptions,
) => void;
