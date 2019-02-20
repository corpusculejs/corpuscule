import {assertKind, assertRequiredProperty, Kind} from '@corpuscule/utils/lib/asserts';
import * as $ from '@corpuscule/utils/lib/descriptors';
import {method as lifecycleMethod} from '@corpuscule/utils/lib/lifecycleDescriptors';
import {getValue, setValue} from '@corpuscule/utils/lib/propertyUtils';
import {all, filter, getTargetValue, noop} from './utils';
import getSupers from '@corpuscule/utils/lib/getSupers';

const [connectedCallbackKey, disconnectedCallbackKey] = $.lifecycleKeys;

const createField = (
  {consumer},
  {form: formApi, input, meta},
  options,
  {scheduler, subscribe, update},
) => descriptor => {
  assertKind('field', Kind.Class, descriptor);

  const {elements, finisher = noop, kind} = descriptor;

  let constructor;
  const getConstructor = () => constructor;

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

  const $$formState = Symbol();
  const $$onBlur = Symbol();
  const $$onChange = Symbol();
  const $$onFocus = Symbol();
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
            this.addEventListener('blur', this[$$onBlur]);
            this.addEventListener('change', this[$$onChange]);
            this.addEventListener('focus', this[$$onFocus]);

            supers[connectedCallbackKey].call(this);
            this[$$subscribe]();
          },
        },
        supers,
        getConstructor,
      ),
      ...lifecycleMethod(
        {
          key: disconnectedCallbackKey,
          method() {
            this.removeEventListener('blur', this[$$onBlur]);
            this.removeEventListener('change', this[$$onChange]);
            this.removeEventListener('focus', this[$$onFocus]);

            this[$$unsubscribe]();
            supers[disconnectedCallbackKey].call(this);
          },
        },
        supers,
        getConstructor,
      ),

      // Private
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
      $.method({
        bound: true,
        key: $$onBlur,
        method() {
          const format = $format && getValue(this, $format);

          const {blur, change, name, value} = this[$$formState];

          blur();

          if (format && $formatOnBlur && getValue(this, $formatOnBlur)) {
            change(format(value, name));
          }
        },
      }),
      $.method({
        bound: true,
        key: $$onChange,
        method({detail, target}) {
          const parse = $parse && getValue(this, $parse);
          const {change, name, value} = this[$$formState];

          const changeValue = detail || getTargetValue(target, value);

          change(parse ? parse(changeValue, name) : changeValue);
        },
      }),
      $.method({
        bound: true,
        key: $$onFocus,
        method() {
          this[$$formState].focus();
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
              this[$$formState] = state;
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
              $$formState
            ];

            setValue(this, $input, {
              name,
              value:
                !($formatOnBlur && getValue(this, $formatOnBlur)) && format
                  ? format(value, name)
                  : value,
            });

            setValue(this, $meta, metadata);
            this[$$updatingValid] = true;
          });
        },
      }),

      // Static Hooks
      $.hook({
        start() {
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

      $formApi = formApi.get(target);
      $input = input.get(target);
      $meta = meta.get(target);

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
