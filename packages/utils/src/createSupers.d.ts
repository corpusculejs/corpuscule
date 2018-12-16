// tslint:disable:readonly-array array-type
import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

export interface CreateSupersOption {
  readonly fallback?: Function;
  readonly key: PropertyKey;
}

declare const getSuperInitializer: (
  elements: ReadonlyArray<ExtendedPropertyDescriptor>,
  options: Map<PropertyKey, PropertyKey | CreateSupersOption>,
) => ExtendedPropertyDescriptor[];

export default getSuperInitializer;
