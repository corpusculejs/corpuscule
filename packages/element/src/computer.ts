import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import createTokenRegistry, {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {ElementPrototype} from './utils';

const [createComputingToken, tokenRegistry] = createTokenRegistry<
  [Array<WeakMap<object, boolean>>, WeakMap<object, unknown | null>]
>(() => [[], new WeakMap()]);

export {createComputingToken};

export const computer = (token: Token): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ElementPrototype<C>,
    _: PropertyKey,
    {get}: BabelPropertyDescriptor,
  ) => {
    const [$corrects, $memoized] = tokenRegistry.get(token)!;
    const $correct = new WeakMap<object, boolean>();

    $corrects.push($correct);

    klass.__initializers.push(self => {
      $correct.set(self, false);
      $memoized.set(self, null);
    });

    return {
      configurable: true,
      get(this: C): unknown {
        if (!$correct.get(this)) {
          $memoized.set(this, get!.call(this));
          $correct.set(this, true);
        }

        return $memoized.get(this);
      },
    };
  }) as any;

export const observer = (token: Token): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ElementPrototype<C>,
    _: PropertyKey,
    descriptor: BabelPropertyDescriptor,
  ) => {
    const [$corrects] = tokenRegistry.get(token)!;
    const {get, set} = makeAccessor(descriptor, klass.__initializers);

    return {
      configurable: true,
      get,
      set(this: C, value: unknown) {
        set.call(this, value);

        for (const $correct of $corrects) {
          $correct.set(this, false);
        }
      },
    };
  }) as any;
