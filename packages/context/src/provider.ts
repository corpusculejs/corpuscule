import {CustomElement} from '@corpuscule/typings';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {
  $consumers,
  $subscribe,
  $unsubscribe,
  Consume,
  ContextClass,
  ContextEventDetails,
  reflectMethods,
  tokenRegistry,
} from './utils';

const provider = (token: Token, defaultValue?: unknown): ClassDecorator =>
  (<C extends CustomElement>(klass: ContextClass<C>) => {
    const [$eventName, $value, $providers] = tokenRegistry.get(token)!;

    const {prototype} = klass;
    const supers = reflectMethods(prototype);
    $providers.add(klass);

    defineExtendable(
      klass,
      {
        connectedCallback(this: C) {
          this.addEventListener(
            $eventName,
            $subscribe.get(this) as EventListener,
          );
          supers.connectedCallback.call(this);
        },
        disconnectedCallback(this: C) {
          this.removeEventListener(
            $eventName,
            $subscribe.get(this) as EventListener,
          );
          supers.disconnectedCallback.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    klass.__initializers.push((self: C) => {
      $consumers.set(self, []);

      $subscribe.set(self, (event: CustomEvent<ContextEventDetails>) => {
        const {consume} = event.detail;

        $consumers.get(self)!.push(consume);
        consume($value.get(self));

        event.detail.unsubscribe = $unsubscribe.get(self)!;
        event.stopPropagation();
      });

      $unsubscribe.set(self, (consume: Consume) => {
        $consumers.set(
          self,
          $consumers.get(self)!.filter(p => p !== consume),
        );
      });

      if (!$value.has(self)) {
        $value.set(self, defaultValue);
      }
    });
  }) as ClassDecorator;

export default provider;
