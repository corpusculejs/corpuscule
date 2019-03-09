import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import * as $ from '@corpuscule/utils/lib/descriptors';
import getSupers from '@corpuscule/utils/lib/getSupers';
import {method as lifecycleMethod} from '@corpuscule/utils/lib/lifecycleDescriptors';
import {getValue, setValue} from '@corpuscule/utils/lib/propertyUtils';
import {fieldSubscriptionItems} from 'final-form';
import {filter, getTargetValue, isNativeElement, noop, setTargetValues} from './utils';

const [connectedCallbackKey, disconnectedCallbackKey] = $.lifecycleKeys;

export const all = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

const createField = (
  {consumer},
  {formApi, input, meta},
  options,
  {ref, scheduler, subscribe, update},
) => ({auto = false, selector = 'input, select, textarea'} = {}) => descriptor => {
  assertKind('field', Kind.Class, descriptor);

  const {elements, finisher = noop, kind} = descriptor;

  let constructor;
  const getConstructor = () => constructor;

  let isNativeField;
  let getRef = noop;

  let $formApi;
  let $input;
  let $meta;

  let $format;
  let $formatOnBlur;
  let $isEqual;
  let $name;
  let $parse;
  let $subscription;
  let $validate;
  let $validateFields;

  const $$state = Symbol();
  const $$handleFocusOut = Symbol();
  const $$handleChange = Symbol();
  const $$handleFocusIn = Symbol();
  const $$ref = Symbol();
  const $$selfChange = Symbol();
  const $$subscribe = Symbol();
  const $$subscribingValid = Symbol();
  const $$unsubscribe = Symbol();
  const $$update = Symbol();
  const $$updatingValid = Symbol();

  const [supers, prepareSupers] = getSupers(elements, $.lifecycleKeys);

  return consumer({
    elements: [
      // Public
      ...lifecycleMethod(
        {
          key: connectedCallbackKey,
          method() {
            this.addEventListener('change', this[$$handleChange]);
            this.addEventListener('focusin', this[$$handleFocusIn]);
            this.addEventListener('focusout', this[$$handleFocusOut]);

            if (auto && !isNativeField) {
              for (const element of this[$$ref]) {
                element.name = getValue(this, $name);
              }
            }

            supers[connectedCallbackKey].call(this);

            if (getValue(this, $name)) {
              this[$$subscribe]();
            }
          },
        },
        supers,
        getConstructor,
      ),
      ...lifecycleMethod(
        {
          key: disconnectedCallbackKey,
          method() {
            this.removeEventListener('change', this[$$handleChange]);
            this.removeEventListener('focusin', this[$$handleFocusIn]);
            this.removeEventListener('focusout', this[$$handleFocusOut]);

            this[$$unsubscribe]();
            supers[disconnectedCallbackKey].call(this);
          },
        },
        supers,
        getConstructor,
      ),

      // Private
      $.field({
        initializer: () => false,
        key: $$selfChange,
      }),
      $.field({
        initializer: () => true,
        key: $$subscribingValid,
      }),
      $.field({
        initializer: () => noop,
        key: $$unsubscribe,
      }),
      $.field({
        initializer: () => true,
        key: $$updatingValid,
      }),
      $.accessor({
        get() {
          return getRef(this);
        },
        key: $$ref,
      }),
      $.method({
        bound: true,
        key: $$handleFocusOut,
        method() {
          const format = $format && getValue(this, $format);

          const {blur, change, name, value} = this[$$state];

          blur();

          if (format && $formatOnBlur && getValue(this, $formatOnBlur)) {
            change(format(value, name));
          }
        },
      }),
      $.method({
        bound: true,
        key: $$handleChange,
        method(event) {
          const isCustomEvent = event instanceof CustomEvent;
          const parse = $parse && getValue(this, $parse);
          const {change, name, value} = this[$$state];

          // We should update form only if it is an auto field or event is custom.
          // By default field does not receive native change events.
          if (isCustomEvent || auto) {
            const changed = isCustomEvent ? event.detail : getTargetValue(event.target, value);
            change(parse ? parse(changed, name) : changed);

            this[$$selfChange] = !isCustomEvent;
          }
        },
      }),
      $.method({
        bound: true,
        key: $$handleFocusIn,
        method() {
          this[$$state].focus();
        },
      }),
      $.method({
        key: $$subscribe,
        method() {
          if (!this[$$subscribingValid]) {
            return;
          }

          this[$$subscribingValid] = false;

          scheduler(() => {
            this[$$unsubscribe]();

            const listener = state => {
              this[$$state] = state;
              this[$$update]();
            };

            this[$$unsubscribe] = getValue(this, $formApi).registerField(
              getValue(this, $name),
              listener,
              ($subscription && getValue(this, $subscription)) || all,
              {
                getValidator: () => $validate && getValue(this, $validate),
                isEqual: $isEqual && getValue(this, $isEqual),
                validateFields: $validateFields && getValue(this, $validateFields),
              },
            );

            this[$$subscribingValid] = true;
          });
        },
      }),
      $.method({
        key: $$update,
        method() {
          if (!this[$$updatingValid]) {
            return;
          }

          this[$$updatingValid] = false;

          scheduler(() => {
            const format = $format && getValue(this, $format);

            const {blur: _b, change: _c, focus: _f, name, length: _l, value, ...metadata} = this[
              $$state
            ];

            const finalValue =
              !($formatOnBlur && getValue(this, $formatOnBlur)) && format
                ? format(value, name)
                : value;

            setValue(this, $input, {
              name,
              value: finalValue,
            });

            setValue(this, $meta, metadata);

            if (auto && !this[$$selfChange]) {
              setTargetValues(this[$$ref], finalValue);
            }

            this[$$selfChange] = false;
            this[$$updatingValid] = true;
          });
        },
      }),

      // Static Hooks
      $.hook({
        start() {
          ref.set(this, $$ref);
          subscribe.set(this, $$subscribe);
          update.set(this, $$update);
        },
      }),

      // Original elements
      ...filter(elements),
    ],
    finisher(target) {
      finisher(target);
      constructor = target;
      isNativeField = isNativeElement(target.prototype);

      $formApi = formApi.get(target);
      $input = input.get(target);
      $meta = meta.get(target);

      if (auto) {
        getRef = isNativeField ? self => self : self => self.querySelectorAll(selector);
      }

      assertRequiredProperty('field', 'api', 'form', $formApi);
      assertRequiredProperty('field', 'api', 'input', $input);
      assertRequiredProperty('field', 'api', 'meta', $meta);

      $format = options.format.get(target);
      $formatOnBlur = options.formatOnBlur.get(target);
      $isEqual = options.isEqual.get(target);
      $name = options.name.get(target);
      $parse = options.parse.get(target);
      $subscription = options.subscription.get(target);
      $validate = options.validate.get(target);
      $validateFields = options.validateFields.get(target);

      assertRequiredProperty('field', 'option', 'name', $name);
      prepareSupers(target);
    },
    kind,
  });
};

export default createField;
