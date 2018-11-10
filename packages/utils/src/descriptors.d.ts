import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

export interface DescriptorOptions {
  readonly isPrivate?: boolean;
  readonly isStatic?: boolean;
}

export interface FieldOptions extends DescriptorOptions {
  readonly isReadonly?: boolean;
}

export interface MethodOptions extends DescriptorOptions {
  readonly isBound?: boolean;
}

export type AccessorParams =
  Pick<PropertyDescriptor, 'get' | 'set'>
  & Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'key'>;

export type FieldParams =
  Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'key' | 'initializer'>;

export type MethodParams =
  Pick<PropertyDescriptor, 'value'>
  & Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'key'>;

export const accessor: (params: AccessorParams, options?: DescriptorOptions) => ExtendedPropertyDescriptor;
export const field: (params: FieldParams, options?: FieldOptions) => ExtendedPropertyDescriptor;
export const method: (params: MethodParams, options?: MethodOptions) => ExtendedPropertyDescriptor;
