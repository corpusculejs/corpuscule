import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

export type AccessorParams =
  Pick<PropertyDescriptor, 'get' | 'set'>
  & Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'key'>;

export type FieldParams =
  Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'key' | 'initializer'>;

export type MethodParams =
  Pick<PropertyDescriptor, 'value'>
  & Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'key'>;

export const accessor: (params: AccessorParams) => ExtendedPropertyDescriptor;
export const boundMethod: (params: FieldParams) => ExtendedPropertyDescriptor;
export const method: (params: MethodParams) => ExtendedPropertyDescriptor;
export const privateField: (params: FieldParams) => ExtendedPropertyDescriptor;
export const privateMethod: (params: MethodParams) => ExtendedPropertyDescriptor;
export const readonlyField: (params: FieldParams) => ExtendedPropertyDescriptor;
export const toStatic: (descriptor: ExtendedPropertyDescriptor) => ExtendedPropertyDescriptor;
