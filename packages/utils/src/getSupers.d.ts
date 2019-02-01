import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

declare const getSupers: <N extends PropertyKey>(
  elements: ReadonlyArray<ExtendedPropertyDescriptor>,
  names: ReadonlyArray<N>,
) => [
  Record<N, Function>,
  (constructor: unknown, fallbacks?: Partial<Record<N, Function>>) => void
];

export default getSupers;
