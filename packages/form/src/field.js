import {consumer} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import defineExtendable from '@corpuscule/utils/lib/defineExtendable';
import reflectClassMethods from '@corpuscule/utils/lib/reflectClassMethods';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {setObject} from '@corpuscule/utils/lib/setters';
import {fieldSubscriptionItems} from 'final-form';
import {getTargetValue, isNativeDefinition, noop, setTargetValues, tokenRegistry} from './utils';

export const all = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

const field = (
  token,
  {auto = false, scheduler = defaultScheduler, childrenSelector = 'input, select, textarea'} = {},
) => klass => {
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

  const sharedPropertiesRegistry = tokenRegistry.get(token);
  const isNativeField = isNativeDefinition(klass);

  const $$connected = Symbol();
  const $$isSubscriptionScheduled = Symbol();
  const $$handleFocusOut = Symbol();
  const $$handleInput = Symbol();
  const $$handleFocusIn = Symbol();
  const $$ref = Symbol();
  const $$scheduleSubscription = Symbol();
  const $$selfChange = Symbol();
  const $$state = Symbol();
  const $$subscribe = Symbol();
  const $$unsubscribe = Symbol();
  const $$update = Symbol();

  const supers = reflectClassMethods(klass.prototype, [
    'connectedCallback',
    'disconnectedCallback',
  ]);

  setObject(sharedPropertiesRegistry, klass, {
    ref: $$ref,
    schedule: $$scheduleSubscription,
  });

  klass.__registrations.push(() => {
    ({
      // @gear
      formApi: $formApi,
      input: $input,
      meta: $meta,

      // @options
      format: $format,
      formatOnBlur: $formatOnBlur,
      isEqual: $isEqual,
      name: $name,
      parse: $parse,
      subscription: $subscription,
      validate: $validate,
      validateFields: $validateFields,
    } = sharedPropertiesRegistry.get(klass) || {});

    assertRequiredProperty('field', 'gear', 'form', $formApi);
    assertRequiredProperty('field', 'gear', 'input', $input);
    assertRequiredProperty('field', 'gear', 'meta', $meta);

    assertRequiredProperty('field', 'option', 'name', $name);
  });

  defineExtendable(
    klass,
    {
      connectedCallback() {
        this.addEventListener('input', this[$$handleInput]);
        this.addEventListener('focusin', this[$$handleFocusIn]);
        this.addEventListener('focusout', this[$$handleFocusOut]);

        if (auto && !isNativeField) {
          for (const element of this[$$ref]) {
            element.name = this[$name];
          }
        }

        this[$$connected] = true;

        if (this[$name]) {
          this[$$subscribe]();
        }

        supers.connectedCallback.call(this);
      },
      disconnectedCallback() {
        this.removeEventListener('input', this[$$handleInput]);
        this.removeEventListener('focusin', this[$$handleFocusIn]);
        this.removeEventListener('focusout', this[$$handleFocusOut]);

        this[$$unsubscribe]();
        supers.disconnectedCallback.call(this);
      },
    },
    supers,
    klass.__initializers,
  );

  Object.assign(klass.prototype, {
    [$$scheduleSubscription]() {
      if (this[$$isSubscriptionScheduled] || !this[$$connected]) {
        return;
      }

      this[$$isSubscriptionScheduled] = true;

      scheduler(() => {
        this[$$subscribe]();
        this[$$isSubscriptionScheduled] = false;
      });
    },
    [$$subscribe]() {
      this[$$unsubscribe]();

      this[$$unsubscribe] = this[$formApi].registerField(
        this[$name],
        this[$$update],
        ($subscription && this[$subscription]) || all,
        {
          getValidator: () => $validate && this[$validate],
          isEqual: $isEqual && this[$isEqual],
          validateFields: $validateFields && this[$validateFields],
        },
      );
    },
  });

  Object.defineProperties(klass.prototype, {
    [$$ref]: {
      get: auto
        ? isNativeField
          ? function() {
              return this;
            }
          : function() {
              return this.querySelectorAll(childrenSelector);
            }
        : noop,
    },
  });

  consumer(token)(klass);

  klass.__initializers.push(self => {
    Object.assign(self, {
      // Properties
      [$$connected]: false,
      [$$isSubscriptionScheduled]: false,
      [$$selfChange]: false,
      [$$unsubscribe]: noop,

      // Methods
      // eslint-disable-next-line sort-keys
      [$$handleFocusIn]() {
        this[$$state].focus();
      },
      [$$handleFocusOut]() {
        const format = $format && self[$format];
        const {blur, change, name, value} = self[$$state];

        blur();

        if (format && $formatOnBlur && self[$formatOnBlur]) {
          change(format(value, name));
        }
      },
      [$$handleInput](event) {
        const isCustomEvent = event instanceof CustomEvent;
        const parse = $parse && self[$parse];
        const {change, name, value} = self[$$state];

        // We should update form only if it is an auto field or event is custom.
        // By default field does not receive native change events.
        if (isCustomEvent || auto) {
          const changed = isCustomEvent ? event.detail : getTargetValue(event.target, value);
          change(parse ? parse(changed, name) : changed);

          self[$$selfChange] = !isCustomEvent;
        }
      },
      [$$update](state) {
        self[$$state] = state;

        const format = $format && self[$format];

        const {blur: _b, change: _c, focus: _f, name, length: _l, value, ...metadata} = state;

        const finalValue =
          !($formatOnBlur && self[$formatOnBlur]) && format ? format(value, name) : value;

        self[$input] = {
          name,
          value: finalValue,
        };

        self[$meta] = metadata;

        if (auto && !self[$$selfChange]) {
          setTargetValues(self[$$ref], finalValue);
        }

        self[$$selfChange] = false;
      },
    });
  });
};

export default field;
