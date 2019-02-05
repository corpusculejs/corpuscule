import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

export type LifecycleMethodParams = Pick<ExtendedPropertyDescriptor, 'key'> & {
  readonly method: Function;
  readonly supers: Record<PropertyKey, Function>;
};

export const method: (
  params: LifecycleMethodParams,
  constructor: unknown,
) => [ExtendedPropertyDescriptor, ExtendedPropertyDescriptor];
