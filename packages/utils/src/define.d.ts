import {Omit} from '@corpuscule/typings';

export type BasicPropertyDescriptor = Omit<PropertyDescriptor, 'value'>;

export const defaultDescriptor: BasicPropertyDescriptor;

declare const define: <N extends PropertyKey>(
  target: unknown,
  names: ReadonlyArray<N>,
  options: Record<N, BasicPropertyDescriptor>,
) => Record<N, PropertyDescriptor>;

export default define;
