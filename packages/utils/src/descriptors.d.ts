import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

export type AccessorMethods = Required<Pick<PropertyDescriptor, 'get' | 'set'>>;

export interface DescriptorOptions {
  readonly isPrivate?: boolean;
  readonly isStatic?: boolean;
}

export interface AccessorOptions extends DescriptorOptions {
  readonly adjust?: (methods: AccessorMethods) => AccessorMethods;
  readonly toArray?: boolean;
}

export interface FieldOptions extends DescriptorOptions {
  readonly isReadonly?: boolean;
}

export interface MethodOptions extends DescriptorOptions {
  readonly isBound?: boolean;
}

export type AccessorParams = Pick<PropertyDescriptor, 'get' | 'set'> &
  Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'initializer' | 'key'>;

export interface FieldParams
  extends Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'initializer'> {
  readonly key?: ExtendedPropertyDescriptor['key'];
}

export type MethodParams = Pick<PropertyDescriptor, 'value'> &
  Pick<ExtendedPropertyDescriptor, 'extras' | 'finisher' | 'key'>;

export const lifecycleKeys: ['connectedCallback', 'disconnectedCallback'];

export const accessor: <T extends AccessorOptions>(
  params: AccessorParams,
  options?: T,
) => T extends {readonly toArray: true}
  ? ReadonlyArray<ExtendedPropertyDescriptor>
  : ExtendedPropertyDescriptor;
export const field: (params: FieldParams, options?: FieldOptions) => ExtendedPropertyDescriptor;
export const method: (params: MethodParams, options?: MethodOptions) => ExtendedPropertyDescriptor;
