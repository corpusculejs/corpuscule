import {CustomElement} from '@corpuscule/typings';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {setObject} from '@corpuscule/utils/lib/setters';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {
  Consume,
  ContextClass,
  ContextEventDetails,
  reflectMethods,
  Subscribe,
  tokenRegistry,
  Unsubscribe,
} from './utils';

const provider = (token: Token, defaultValue?: unknown): ClassDecorator =>
  (<C extends CustomElement>(klass: ContextClass<C>) => {
    let $value: PropertyKey | undefined;

    const {prototype} = klass;

    const $$consumers = Symbol();
    const $$subscribe = Symbol();
    const $$unsubscribe = Symbol();

    type ProviderClass = C & {
      ['value']: any;
      [$$consumers]: Consume[];
      [$$subscribe]: Subscribe<C>;
      [$$unsubscribe]?: Unsubscribe;
    };

    const supers = reflectMethods(prototype);

    const [eventName, values, providers] = tokenRegistry.get(token)!;

    providers.add(klass);

    setObject(values, klass, {
      consumers: $$consumers,
    });

    klass.__registrations.push(() => {
      $value = values.get(klass)?.value;
      assertRequiredProperty('provider', 'value', $value);
    });

    defineExtendable(
      klass,
      {
        async connectedCallback(this: ProviderClass): Promise<void> {
          this.addEventListener(eventName, this[$$subscribe] as EventListener);
          await supers.connectedCallback.call(this);
        },
        async disconnectedCallback(this: ProviderClass): Promise<void> {
          this.removeEventListener(
            eventName,
            this[$$subscribe] as EventListener,
          );
          await supers.disconnectedCallback.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    klass.__initializers.push((self: ProviderClass) => {
      Object.assign(self, {
        [$$consumers]: [],
        [$$subscribe](event: CustomEvent<ContextEventDetails>) {
          const {consume} = event.detail;

          self[$$consumers].push(consume);
          consume(self[$value as 'value']);

          event.detail.unsubscribe = self[$$unsubscribe];
          event.stopPropagation();
        },
        [$$unsubscribe](consume: Consume) {
          self[$$consumers] = self[$$consumers].filter(p => p !== consume);
        },
      });

      if (self[$value as 'value'] === undefined) {
        self[$value as 'value'] = defaultValue;
      }
    });
  }) as ClassDecorator;

export default provider;
