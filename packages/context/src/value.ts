import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import makeAccessor from '@corpuscule/utils/lib/makeAccessor';
import {setObject} from '@corpuscule/utils/lib/setters';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {Consume, ContextClassPrototype, tokenRegistry} from './utils';

const value = (token: Token): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ContextClassPrototype<C>,
    key: PropertyKey,
    {initializer, ...descriptor}: BabelPropertyDescriptor = {},
  ) => {
    let $consumers: PropertyKey | undefined;
    let isProvider: boolean | undefined;

    type ValueClass = {
      ['consumers']: readonly Consume[];
    };

    const [, values, providers] = tokenRegistry.get(token)!;

    setObject(values, klass, {
      value: key,
    });

    klass.__registrations.push(() => {
      $consumers = values.get(klass)?.consumers;
      isProvider = providers.has(klass);
    });

    const {get, set} = makeAccessor(
      {
        ...descriptor,
        initializer() {
          return isProvider && initializer ? initializer.call(this) : undefined;
        },
      },
      klass.__initializers,
    );

    return {
      configurable: true,
      get,
      set(this: ValueClass, v: unknown) {
        set.call(this, v);

        if (isProvider) {
          for (const callback of this[$consumers as 'consumers']) {
            // eslint-disable-next-line callback-return
            callback(v);
          }
        }
      },
    };
  }) as any;

export default value;
