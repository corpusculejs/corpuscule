declare const getSuperMethod:
  (name: string, elements: ReadonlyArray<unknown>) =>
    (this: unknown, ...args: Array<unknown>) => void; // tslint:disable-line:readonly-array

export default getSuperMethod;
