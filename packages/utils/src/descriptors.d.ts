import {ExtendedPropertyDescriptor, Omit} from '@corpuscule/typings';

export const lifecycleKeys: ['connectedCallback', 'disconnectedCallback'];

export type AccessorMethods = Required<Pick<PropertyDescriptor, 'get' | 'set'>>;

export type ExtendedPropertyDescriptorBasics = Pick<
  ExtendedPropertyDescriptor,
  'extras' | 'finisher'
>;

export type AccessorParams = Omit<PropertyDescriptor, 'value'> &
  ExtendedPropertyDescriptorBasics &
  Pick<ExtendedPropertyDescriptor, 'key'> &
  Pick<Partial<ExtendedPropertyDescriptor>, 'initializer' | 'placement'> & {
    readonly adjust?: (methods: AccessorMethods) => AccessorMethods;
    readonly readonly?: boolean;
  };

export type FieldParams = Omit<PropertyDescriptor, 'get' | 'set'> &
  ExtendedPropertyDescriptorBasics &
  Pick<ExtendedPropertyDescriptor, 'key'> &
  Pick<Partial<ExtendedPropertyDescriptor>, 'initializer' | 'placement'>;

export type MethodParams = Omit<PropertyDescriptor, 'get' | 'set' | 'value'> &
  ExtendedPropertyDescriptorBasics &
  Pick<ExtendedPropertyDescriptor, 'key'> &
  Pick<Partial<ExtendedPropertyDescriptor>, 'placement'> & {
    readonly bound?: boolean;
    readonly method?: Function;
  };

export type HookParams = Pick<Partial<ExtendedPropertyDescriptor>, 'extras' | 'placement'> & {
  readonly start: () => void;
};

export const accessor: (params: AccessorParams) => ExtendedPropertyDescriptor;
export const field: (params: FieldParams) => ExtendedPropertyDescriptor;
export const method: (params: MethodParams) => ExtendedPropertyDescriptor;
export const hook: (params: HookParams) => ExtendedPropertyDescriptor;
