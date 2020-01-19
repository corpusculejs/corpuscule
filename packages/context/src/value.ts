import {BabelPropertyDescriptor, CustomElement} from '@corpuscule/typings';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {ContextClassPrototype, tokenRegistry} from './utils';

const value = (token: Token): PropertyDecorator =>
  (<C extends CustomElement>(
    {constructor: klass}: ContextClassPrototype<C>,
    _: PropertyKey,
    {initializer}: BabelPropertyDescriptor = {},
  ) => {
    const {
      consumers: $consumers,
      providers: $providers,
      value: $value,
    } = tokenRegistry.get(token)!;
    let isProvider = false;

    klass.__registrations.push(() => {
      isProvider = $providers.has(klass);
    });

    klass.__initializers.push(self => {
      if (isProvider && initializer) {
        $value.set(self, initializer.call(self));
      }
    });

    return {
      configurable: true,
      get(): unknown | undefined {
        return $value.get(this);
      },
      set(this: C, v: unknown) {
        if (isProvider) {
          $value.set(this, v);

          for (const callback of $consumers.get(this)!) {
            // eslint-disable-next-line callback-return
            callback(v);
          }
        } else {
          throw new Error('Setting value for context consumer is forbidden');
        }
      },
    };
  }) as any;

export default value;
