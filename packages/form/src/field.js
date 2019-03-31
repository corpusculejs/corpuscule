import {consumer} from '@corpuscule/context';
import {assertRequiredProperty} from '@corpuscule/utils/lib/asserts';
import define, {defaultDescriptor} from '@corpuscule/utils/lib/define';
import getSupers from '@corpuscule/utils/lib/getSupersNew';
import defaultScheduler from '@corpuscule/utils/lib/scheduler';
import {setObject} from '@corpuscule/utils/lib/setters';
import {fieldSubscriptionItems} from 'final-form';
import {getTargetValue, isNativeElement, noop, setTargetValues, tokenRegistry} from './utils';

export const all = fieldSubscriptionItems.reduce((result, key) => {
  result[key] = true;

  return result;
}, {});

const field = (
  token,
  {auto = false, scheduler = defaultScheduler, selector = 'input, select, textarea'} = {},
) => target => {
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

  const [sharedPropertiesRegistry] = tokenRegistry.get(token);
  const isNativeField = isNativeElement(target.prototype);

  const $$connected = Symbol();
  const $$connectedCallback = Symbol();
  const $$disconnectedCallback = Symbol();
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

  const supers = getSupers(target, ['connectedCallback', 'disconnectedCallback']);

  setObject(sharedPropertiesRegistry, target, {
    ref: $$ref,
    schedule: $$scheduleSubscription,
  });

  target.__registrations.push(() => {
    ({
      // @api
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
    } = sharedPropertiesRegistry.get(target) || {});

    assertRequiredProperty('field', 'api', 'form', $formApi);
    assertRequiredProperty('field', 'api', 'input', $input);
    assertRequiredProperty('field', 'api', 'meta', $meta);

    assertRequiredProperty('field', 'option', 'name', $name);
  });

  define(target.prototype, {
    connectedCallback() {
      this[$$connectedCallback]();
    },
    disconnectedCallback() {
      this[$$disconnectedCallback]();
    },

    // eslint-disable-next-line sort-keys
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

  define.raw(target.prototype, {
    [$$ref]: {
      ...defaultDescriptor,
      get: auto
        ? isNativeField
          ? function() {
              return this;
            }
          : function() {
              return this.querySelectorAll(selector);
            }
        : noop,
    },
  });

  consumer(token)(target);

  target.__initializers.push(self => {
    // Inheritance workaround. If class is inherited, method will work in a different way
    const isExtended = self.constructor !== target;

    define(self, {
      // Properties
      [$$connected]: false,
      [$$isSubscriptionScheduled]: false,
      [$$selfChange]: false,
      [$$unsubscribe]: noop,

      // Methods
      // eslint-disable-next-line sort-keys
      [$$connectedCallback]: isExtended
        ? supers.connectedCallback
        : () => {
            self.addEventListener('input', self[$$handleInput]);
            self.addEventListener('focusin', self[$$handleFocusIn]);
            self.addEventListener('focusout', self[$$handleFocusOut]);

            if (auto && !isNativeField) {
              for (const element of self[$$ref]) {
                element.name = self[$name];
              }
            }

            self[$$connected] = true;

            if (self[$name]) {
              self[$$subscribe]();
            }

            supers.connectedCallback.call(self);
          },
      [$$disconnectedCallback]: isExtended
        ? supers.disconnectedCallback
        : () => {
            self.removeEventListener('input', self[$$handleInput]);
            self.removeEventListener('focusin', self[$$handleFocusIn]);
            self.removeEventListener('focusout', self[$$handleFocusOut]);

            self[$$unsubscribe]();
            supers.disconnectedCallback.call(self);
          },
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
