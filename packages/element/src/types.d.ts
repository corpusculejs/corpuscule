export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type AttributeDescriptor = [string, AttributeGuard];
export type PropertyGuard = ((value: any) => boolean) | null;
export type ComputedDescriptor = ReadonlyArray<string>;

export interface PropertyList<T> {
  [name: string]: T; // tslint:disable-line:readonly-keyword
}

// tslint:disable:readonly-keyword
export interface Scheduler {
  force: boolean;
  initial: boolean;
  mounting: boolean;
  props: boolean;
  valid: boolean;
}
// tslint:enable:readonly-keyword

export const enum UpdateType {
  Force,
  Mounting,
  Props,
  State,
}
