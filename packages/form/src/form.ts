import {provider, share} from '@corpuscule/context';
import {CustomElement} from '@corpuscule/typings';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {
  Config as FormConfig,
  configOptions,
  createForm,
  Decorator,
  FormApi,
  FormSubscription,
  formSubscriptionItems,
} from 'final-form';
import {
  $$reset,
  $$submit,
  $$unsubscriptions,
  FormFieldConstructor,
  reflectMethods,
  SharedFormProps,
  tokenRegistry,
} from './utils';

export const all = (formSubscriptionItems as ReadonlyArray<
  keyof FormSubscription
>).reduce<Record<keyof FormSubscription, boolean>>((result, key) => {
  result[key] = true;

  return result;
}, {} as Record<keyof FormSubscription, boolean>);

export type FormDecoratorOptions = {
  decorators?: readonly Decorator[];
  subscription?: FormSubscription;
};

const form = (
  token: Token,
  {decorators = [], subscription = all}: Readonly<FormDecoratorOptions> = {},
): ClassDecorator =>
  (<C extends CustomElement>(klass: FormFieldConstructor<C>) => {
    const sharedProperties = tokenRegistry.get(token)! as SharedFormProps;

    const {state: $state, onSubmit: $onSubmit} = sharedProperties;
    const $formApi: WeakMap<C, FormApi> = share(token)!;

    const supers = reflectMethods(klass.prototype);

    klass.__registrations.push(() => {
      assertRequiredProperty(
        'form',
        'option',
        'onSubmit',
        $onSubmit.get(klass),
      );
    });

    defineExtendable(
      klass,
      {
        connectedCallback(this: C): void {
          const instance = $formApi.get(this)!;
          const usubscriptions = $$unsubscriptions.get(this)!;

          for (const decorate of decorators) {
            usubscriptions.push(decorate(instance));
          }

          usubscriptions.push(
            instance.subscribe(newState => {
              $state.set(this, newState);
            }, subscription),
          );

          this.addEventListener('submit', $$submit.get(this)!);
          this.addEventListener('reset', $$reset.get(this)!);

          supers.connectedCallback.call(this);
        },
        disconnectedCallback(this: C): void {
          for (const unsubscribe of $$unsubscriptions.get(this)!) {
            unsubscribe();
          }

          $$unsubscriptions.set(this, []);

          this.removeEventListener('submit', $$submit.get(this)!);
          this.removeEventListener('reset', $$reset.get(this)!);

          supers.disconnectedCallback.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    provider(token)(klass);

    klass.__initializers.push(self => {
      const instance = createForm(
        configOptions.reduce<FormConfig>((acc, key) => {
          if (sharedProperties[key].has(self)) {
            // @ts-ignore
            acc[key] = sharedProperties[key].get(self);
          } else if (sharedProperties[key].has(klass)) {
            // @ts-ignore
            acc[key] = (sharedProperties[key].get(klass) as Function).bind(
              self,
            );
          }

          return acc;
        }, {} as FormConfig),
      );

      $formApi.set(self, instance);

      $$unsubscriptions.set(self, []);
      $$reset.set(self, (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        $formApi.get(self)!.reset();
      });
      $$submit.set(self, (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        $formApi.get(self)!.submit();
      });
    });
  }) as any;

export default form;
