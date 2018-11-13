// tslint:disable:readonly-array array-type
import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

declare const getSuperMethod:
  (
    elements: ReadonlyArray<ExtendedPropertyDescriptor>,
    names: ReadonlyArray<PropertyKey>,
    defaults?: {readonly [key: string]: Function},
  ) =>
    Array<(this: unknown, ...args: unknown[]) => unknown>;

export default getSuperMethod;
