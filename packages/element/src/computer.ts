import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {setArray} from '@corpuscule/utils/lib/setters';
import createTokenRegistry, {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {ElementPrototype} from './utils';

const [createComputingToken, tokenRegistry] = createTokenRegistry<
  WeakMap<object, PropertyKey[]>
>(() => new WeakMap());

export {createComputingToken};

export const computer = (token: Token): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ElementPrototype<C>,
    _: PropertyKey,
    {get}: BabelPropertyDescriptor,
  ) => {
    const correct = Symbol();
    const memoized = Symbol();

    klass.__initializers.push(
      (
        self: C & {
          [correct]: boolean;
          [memoized]: unknown | null;
        },
      ) => {
        self[correct] = false;
        self[memoized] = null;
      },
    );
    setArray(tokenRegistry.get(token)!, klass, [correct]);

    return {
      configurable: true,
      get(
        this: C & {
          [correct]: boolean;
          [memoized]: unknown;
        },
      ): unknown {
        if (!this[correct]) {
          this[memoized] = get!.call(this);
          this[correct] = true;
        }

        return this[memoized];
      },
    };
  }) as any;

export const observer = (token: Token): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ElementPrototype<C>,
    _: PropertyKey,
    descriptor: BabelPropertyDescriptor,
  ) => {
    const {get, set} = makeAccessor(descriptor, klass.__initializers);

    let corrects: PropertyKey[];

    klass.__registrations.push(() => {
      corrects = tokenRegistry.get(token)!.get(klass)!;
    });

    return {
      configurable: true,
      get,
      set(this: C & {['correct']: boolean}, value: unknown) {
        set.call(this, value);

        for (const correct of corrects) {
          this[correct as 'correct'] = false;
        }
      },
    };
  }) as any;
