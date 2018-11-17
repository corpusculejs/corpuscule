import {ExtendedPropertyDescriptor} from '@corpuscule/typings';

declare const createDualDescriptor: (
  descriptor: PropertyDescriptor,
  initializer?: () => unknown,
) => [Pick<PropertyDescriptor, 'get' | 'set'>, ExtendedPropertyDescriptor?];

export default createDualDescriptor;
