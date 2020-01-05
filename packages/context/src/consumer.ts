import {CustomElement} from '@corpuscule/typings';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {
  Consume,
  ContextClass,
  ContextEventDetails,
  reflectMethods,
  tokenRegistry,
  Unsubscribe,
} from './utils';

const consumer = (token: Token): ClassDecorator =>
  (<C extends CustomElement>(klass: ContextClass<C>) => {
    let $value: PropertyKey | undefined;

    const {prototype} = klass;

    const $$consume = Symbol();
    const $$unsubscribe = Symbol();

    type ConsumerClass = C & {
      ['value']: any;
      [$$consume]: Consume;
      [$$unsubscribe]?: Unsubscribe;
    };

    const supers = reflectMethods(prototype);

    const [eventName, values] = tokenRegistry.get(token)!;

    klass.__registrations.push(() => {
      $value = values.get(klass)?.value;
      assertRequiredProperty('consumer', 'value', $value);
    });

    defineExtendable(
      klass,
      {
        connectedCallback(this: ConsumerClass): void {
          const event = new CustomEvent<ContextEventDetails>(eventName, {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {consume: this[$$consume]},
          });

          this.dispatchEvent(event);

          if (!this[$$unsubscribe]) {
            throw new Error(`No provider found for ${this.constructor.name}`);
          }

          this[$$unsubscribe] = event.detail.unsubscribe;

          supers.connectedCallback!.call(this);
        },
        disconnectedCallback(this: ConsumerClass): void {
          this[$$unsubscribe]?.(this[$$consume]);
          supers.disconnectedCallback!.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    klass.__initializers.push((self: ConsumerClass) => {
      self[$$consume] = v => {
        self[$value as 'value'] = v;
      };
    });
  }) as ClassDecorator;

export default consumer;
