import {consumer, share} from '@corpuscule/context';
import {CustomElement} from '@corpuscule/typings';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {Token} from '@corpuscule/utils/lib/tokenRegistry';
import {FieldSubscription, fieldSubscriptionItems, FormApi} from 'final-form';
import {
  $$connected,
  $$handleFocusIn,
  $$handleFocusOut,
  $$handleInput,
  $$isSubscriptionScheduled,
  $$refGetter,
  $$scheduleSubscription,
  $$selfChange,
  $$state,
  $$subscribe,
  $$unsubscribe,
  $$update,
  convertAndSetFormValuesToTarget,
  convertTargetValueToFormValue,
  FormFieldConstructor,
  isNativeFormElement,
  NativeFormElement,
  noop,
  reflectMethods,
  SharedFieldProps,
  tokenRegistry,
} from './utils';

export type FieldDecoratorOptions = {
  auto?: boolean;
  childrenSelector?: string;
  scheduler?: (task: () => void) => Promise<void>;
};

export const all = (fieldSubscriptionItems as ReadonlyArray<
  keyof FieldSubscription
>).reduce<FieldSubscription>((result, key) => {
  result[key] = true;

  return result;
}, {} as FieldSubscription);

const field = (
  token: Token,
  {
    auto = false,
    scheduler = defaultScheduler,
    childrenSelector = 'input, select, textarea',
  }: Readonly<FieldDecoratorOptions> = {},
): ClassDecorator =>
  (<C extends CustomElement>(klass: FormFieldConstructor<C>) => {
    const {
      input: $input,
      meta: $meta,
      format: $format,
      formatOnBlur: $formatOnBlur,
      isEqual: $isEqual,
      name: $name,
      parse: $parse,
      subscription: $subscription,
      validate: $validate,
      validateFields: $validateFields,
    } = tokenRegistry.get(token) as SharedFieldProps;

    const $formApi: WeakMap<C, FormApi> = share(token)!;

    const isNativeElement = isNativeFormElement(klass.prototype);
    const supers = reflectMethods(klass.prototype);

    defineExtendable(
      klass,
      {
        connectedCallback(this: C): void {
          this.addEventListener('input', $$handleInput.get(this)!);
          this.addEventListener('focusin', $$handleFocusIn.get(this)!);
          this.addEventListener('focusout', $$handleFocusOut.get(this)!);

          const name = $name.get(this);

          if (auto && !isNativeElement) {
            // TODO: Check with the 3.8 version
            // @ts-ignore
            for (const element of $$refGetter
              .get(klass)!
              .call(this) as NodeListOf<HTMLElement>) {
              element.name = name;
            }
          }

          $$connected.set(this, true);

          if (name) {
            $$subscribe.get(klass)!(this);
          }

          supers.connectedCallback.call(this);
        },
        disconnectedCallback(this: C): void {
          this.removeEventListener('input', $$handleInput.get(this)!);
          this.removeEventListener('focusin', $$handleFocusIn.get(this)!);
          this.removeEventListener('focusout', $$handleFocusOut.get(this)!);

          $$unsubscribe.get(this)!();
          supers.disconnectedCallback.call(this);
        },
      },
      supers,
      klass.__initializers,
    );

    $$scheduleSubscription.set(klass, (self: C) => {
      if ($$isSubscriptionScheduled.get(self) || !$$connected.get(self)) {
        return;
      }

      $$isSubscriptionScheduled.set(self, true);

      scheduler(() => {
        $$subscribe.get(klass)!(self);
        $$isSubscriptionScheduled.set(self, false);
      });
    });

    $$subscribe.set(klass, self => {
      $$unsubscribe.get(self)!();

      $$unsubscribe.set(
        self,
        $formApi
          .get(self)!
          .registerField(
            $name.get(self)!,
            $$update.get(self)!,
            $subscription.get(self) ?? all,
            {
              getValidator: () => $validate.get(klass)!.bind(self),
              isEqual: $isEqual.get(klass)!.bind(self),
              validateFields: $validateFields.get(self),
            },
          ),
      );
    });

    // ERROR
    $$refGetter.set(
      klass,
      auto
        ? isNativeElement
          ? function(this: C) {
              return this;
            }
          : function(this: C) {
              return this.querySelectorAll(childrenSelector);
            }
        : noop,
    );

    consumer(token)(klass);

    klass.__initializers.push(self => {
      $$connected.set(self, false);
      $$isSubscriptionScheduled.set(self, false);
      $$selfChange.set(self, false);
      $$unsubscribe.set(self, noop);

      $$handleFocusIn.set(self, () => {
        $$state.get(self)!.focus();
      });

      $$handleFocusOut.set(self, () => {
        const format = $format.get(klass);
        const {blur, change, name, value} = $$state.get(self)!;

        blur();

        if (format && $formatOnBlur.get(self)) {
          change(format.call(self, value, name));
        }
      });

      $$handleInput.set(self, (event: Event | CustomEvent) => {
        const isCustomEvent = event instanceof CustomEvent;
        const parse = $parse.get(klass);
        const {change, name, value} = $$state.get(self)!;

        // We should update form only if it is an auto field or event is custom.
        // By default field does not receive native change events.
        if (isCustomEvent || auto) {
          const changed = isCustomEvent
            ? (event as CustomEvent).detail
            : convertTargetValueToFormValue(
                event.target as
                  | HTMLInputElement
                  | HTMLSelectElement
                  | HTMLTextAreaElement,
                value,
              );
          change(parse ? parse.call(self, changed, name) : changed);

          $$selfChange.set(self, !isCustomEvent);
        }
      });

      $$update.set(self, state => {
        $$state.set(self, state);

        const format = $format.get(klass);

        const {
          blur: _b,
          change: _c,
          focus: _f,
          name,
          length: _l,
          value,
          ...metadata
        } = state;

        const finalValue =
          !$formatOnBlur.get(self) && format
            ? format.call(self, value, name)
            : value;

        $input.set(self, {
          name,
          value: finalValue,
        });

        $meta.set(self, metadata);

        if (auto && !$$selfChange.get(self)) {
          convertAndSetFormValuesToTarget(
            $$refGetter.get(klass)!.call(self) as
              | NativeFormElement
              | NodeListOf<NativeFormElement>,
            finalValue,
          );
        }

        $$selfChange.set(self, false);
      });
    });
  }) as any;

export default field;
