import {CustomElement} from '@corpuscule/typings';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {
  $consume,
  $unsubscribe,
  ContextClass,
  ContextEventDetails,
  reflectMethods,
  tokenRegistry,
} from './utils';

const consumer = (token: Token): ClassDecorator =>
  (<C extends CustomElement>(klass: ContextClass<C>) => {
    const [$eventName, $value] = tokenRegistry.get(token)!;
    const {prototype} = klass;
    const supers = reflectMethods(prototype);

    defineExtendable(
      klass,
      {
        connectedCallback(this: C): void {
          const event = new CustomEvent<ContextEventDetails>($eventName, {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {consume: $consume.get(this)!},
          });

          this.dispatchEvent(event);

          if (!event.detail.unsubscribe) {
            throw new Error(`No provider found for ${this.constructor.name}`);
          }

          $unsubscribe.set(this, event.detail.unsubscribe);

          supers.connectedCallback!.call(this);
        },
        disconnectedCallback(this: C): void {
          $unsubscribe.get(this)?.($consume.get(this)!);
          supers.disconnectedCallback!.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    klass.__initializers.push((self: C) => {
      $consume.set(self, v => {
        $value.set(self, v);
      });
    });
  }) as ClassDecorator;

export default consumer;
