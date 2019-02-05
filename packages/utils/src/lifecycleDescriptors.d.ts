import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

export type LifecycleMethodParams = Pick<ExtendedPropertyDescriptor, 'key'> & {
  readonly method: Function;
};

export const method: (
  params: LifecycleMethodParams,
  supers: Record<PropertyKey, Function>,
  constructor: () => unknown,
) => [ExtendedPropertyDescriptor, ExtendedPropertyDescriptor];
