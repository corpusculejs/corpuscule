export const getPropertyChainDescriptors: (object: any, propertyName: string) => ReadonlyArray<PropertyDescriptor>;

export const getDescriptorChainValues:
  (
    descriptors: ReadonlyArray<PropertyDescriptor>,
    options?: {
      readonly instance?: any,
      readonly merge?: boolean,
    },
  ) =>
    | ReadonlyArray<boolean>
    | ReadonlyArray<number>
    | ReadonlyArray<string>
    | ReadonlyArray<any>
    | {readonly [key: string]: any};
