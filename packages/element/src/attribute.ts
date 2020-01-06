import {CustomElement} from '../../typings/lib';
import {ElementPrototype} from './utils';

const attribute = (
  attributeName: string,
  guard: BooleanConstructor | NumberConstructor | StringConstructor,
): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ElementPrototype<C>,
    key: PropertyKey,
  ) => {
    if (guard !== Boolean && guard !== Number && guard !== String) {
      throw new TypeError(
        'Guard for @attribute should be either Number, Boolean or String',
      );
    }
    const guardType = typeof guard(null);
    klass.__registrations.push(() => {
      klass.observedAttributes.push(attributeName);
    });

    return {
      configurable: true,
      get(this: C) {
        const value = this.getAttribute(attributeName);
        if (guard === Boolean) {
          return value !== null;
        }

        return value !== null
          ? guard === String
            ? value
            : guard(value)
          : null;
      },
      set(this: C, value: string | number | boolean) {
        if (value != null && typeof value !== guardType) {
          throw new TypeError(
            `Value applied to "${String(key)}" is not ${
              guard.name
            } or undefined`,
          );
        }
        if (value == null || value === false) {
          this.removeAttribute(attributeName);
        } else {
          this.setAttribute(attributeName, value === true ? '' : String(value));
        }
      },
    };
  }) as any;

export default attribute;
