// tslint:disable:no-bitwise
import {ClassDescriptor, ExtendedPropertyDescriptor} from '@corpuscule/typings';
import {assertKind, assertPlacement, assertRequiredProperty, Kind, Placement} from '../src/asserts';

const testAsserts = () => {
  describe('asserts', () => {
    describe('assertKind', () => {
      let accessorValue: number;

      const fieldDescriptor: ExtendedPropertyDescriptor = {
        descriptor: {},
        initializer(): null {
          return null;
        },
        key: 'testField',
        kind: 'field',
        placement: 'own',
      };

      const methodDescriptor: ExtendedPropertyDescriptor = {
        descriptor: {
          value(): null {
            return null;
          },
        },
        key: 'testMethod',
        kind: 'method',
        placement: 'prototype',
      };

      const accessorDescriptor: ExtendedPropertyDescriptor = {
        descriptor: {
          get(): number {
            return accessorValue;
          },
          set(v: number): void {
            accessorValue = v;
          },
        },
        key: 'testAccessor',
        kind: 'method',
        placement: 'prototype',
      };

      const getterDescriptor: ExtendedPropertyDescriptor = {
        descriptor: {
          get(): number {
            return accessorValue;
          },
        },
        key: 'testGetter',
        kind: 'method',
        placement: 'prototype',
      };

      const setterDescriptor: ExtendedPropertyDescriptor = {
        descriptor: {
          set(v: number): void {
            accessorValue = v;
          },
        },
        key: 'testSetter',
        kind: 'method',
        placement: 'prototype',
      };

      const classDescriptor: ClassDescriptor = {
        elements: [fieldDescriptor, accessorDescriptor, methodDescriptor, setterDescriptor],
        kind: 'class',
      };

      it('makes sure it received a field descriptor', () => {
        expect(() => assertKind('foo', Kind.Field, fieldDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Field, methodDescriptor)).toThrow(
          new TypeError('@foo cannot be applied to testMethod: it is not field'),
        );
      });

      it('makes sure it received a accessor descriptor', () => {
        expect(() => assertKind('foo', Kind.Accessor, accessorDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Accessor, methodDescriptor)).toThrow(
          new TypeError('@foo cannot be applied to testMethod: it is not accessor'),
        );
      });

      it('makes sure it received a method descriptor', () => {
        expect(() => assertKind('foo', Kind.Method, methodDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Method, classDescriptor)).toThrow(
          new TypeError('@foo cannot be applied to class: it is not method'),
        );
      });

      it('makes sure it received a getter descriptor', () => {
        expect(() => assertKind('foo', Kind.Getter, getterDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Getter, accessorDescriptor)).toThrow(
          new TypeError('@foo cannot be applied to testAccessor: it is not getter'),
        );
      });

      it('makes sure it received a setter descriptor', () => {
        expect(() => assertKind('foo', Kind.Setter, setterDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Setter, getterDescriptor)).toThrow(
          new TypeError('@foo cannot be applied to testGetter: it is not setter'),
        );
      });

      it('makes sure it received a class descriptor', () => {
        expect(() => assertKind('foo', Kind.Class, classDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Class, getterDescriptor)).toThrow(
          new TypeError('@foo cannot be applied to testGetter: it is not class'),
        );
      });

      it('allows to specify more than one kind', () => {
        expect(() => assertKind('foo', Kind.Field | Kind.Method, fieldDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Field | Kind.Method, methodDescriptor)).not.toThrow();
        expect(() => assertKind('foo', Kind.Field | Kind.Method, accessorDescriptor)).toThrow(
          new TypeError('@foo cannot be applied to testAccessor: it is not field or method'),
        );
      });
    });

    describe('assertPlacement', () => {
      const ownPlacement: ExtendedPropertyDescriptor = {
        descriptor: {},
        initializer(): null {
          return null;
        },
        key: 'testOwn',
        kind: 'field',
        placement: 'own',
      };

      const prototypePlacement: ExtendedPropertyDescriptor = {
        descriptor: {
          value(): null {
            return null;
          },
        },
        key: 'testPrototype',
        kind: 'field',
        placement: 'prototype',
      };

      const staticPlacement: ExtendedPropertyDescriptor = {
        descriptor: {},
        initializer(): null {
          return null;
        },
        key: 'testStatic',
        kind: 'field',
        placement: 'static',
      };

      it('makes sure it received a descriptor with own placement', () => {
        expect(() => assertPlacement('foo', Placement.Own, ownPlacement)).not.toThrow();
        expect(() => assertPlacement('foo', Placement.Own, staticPlacement)).toThrow(
          new TypeError('@foo cannot be applied to testStatic: it is not own class element'),
        );
      });

      it('makes sure it received a descriptor with prototype placement', () => {
        expect(() => assertPlacement('foo', Placement.Prototype, prototypePlacement)).not.toThrow();
        expect(() => assertPlacement('foo', Placement.Prototype, ownPlacement)).toThrow(
          new TypeError('@foo cannot be applied to testOwn: it is not prototype class element'),
        );
      });

      it('makes sure it received a descriptor with static placement', () => {
        expect(() => assertPlacement('foo', Placement.Static, staticPlacement)).not.toThrow();
        expect(() => assertPlacement('foo', Placement.Static, prototypePlacement)).toThrow(
          new TypeError('@foo cannot be applied to testPrototype: it is not static class element'),
        );
      });

      it('allows to specify more than one placement', () => {
        expect(() =>
          assertPlacement('foo', Placement.Own | Placement.Static, staticPlacement),
        ).not.toThrow();
        expect(() =>
          assertPlacement('foo', Placement.Own | Placement.Static, ownPlacement),
        ).not.toThrow();
        expect(() =>
          assertPlacement('foo', Placement.Own | Placement.Static, prototypePlacement),
        ).toThrow(
          new TypeError(
            '@foo cannot be applied to testPrototype: it is not own or static class element',
          ),
        );
      });
    });

    describe('assertRequiredProperty', () => {
      it('throws an error if property is undefined or null', () => {
        expect(() => assertRequiredProperty('foo', 'bar', 'test', undefined)).toThrowError(
          '@foo requires test property marked with @bar',
        );
      });

      it("doesn't throw an error if property is different than undefined", () => {
        expect(() => assertRequiredProperty('foo', 'bar', 'test', null)).not.toThrow();
      });

      it('allows to omit property name', () => {
        expect(() => assertRequiredProperty('foo', 'bar', undefined)).toThrowError(
          '@foo requires any property marked with @bar',
        );
      });
    });
  });
};

export default testAsserts;
