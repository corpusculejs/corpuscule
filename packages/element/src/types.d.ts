export interface PropertyOptions {
  readonly pure?: boolean;
}

export type AttributeGuard = BooleanConstructor | NumberConstructor | StringConstructor;
export type AttributeDescriptor =
  | [string, AttributeGuard]
  | [string, AttributeGuard, PropertyOptions];

export type ComputedDescriptor = ReadonlyArray<string | symbol>;

export type PropertyGuard = (value: any) => boolean;
export type PropertyDescriptor =
  | [PropertyGuard, PropertyOptions]
  | PropertyGuard
  | null;

export type AttributeDescriptorMap<T> = {
  [P in keyof T]: AttributeDescriptor;
};

export type ComputedDescriptorMap<T> = {
  [P in keyof T]: ComputedDescriptor;
};

export type PropertyDescriptorMap<T> = {
  [P in keyof T]: PropertyDescriptor;
};

export type StateDescriptorMap<T> = ReadonlyArray<keyof T>;

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
