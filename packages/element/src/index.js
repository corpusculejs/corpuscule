import * as $$ from "./tokens/internal";
import * as $ from "./tokens/lifecycle";
import {
  defaultPropertyOptions,
  getDescriptors, getPropertyDescriptor,
  handleError,
  parseAttributeValue, prepareComputed,
  toAttribute,
} from "./utils";
import schedule from "./scheduler";

export * from "./tokens/lifecycle";

const renderPromise = window.Corpuscule && window.Corpuscule.compatibility === true
  ? import("lit-html/lib/shady-render").then(({render}) => [render, true])
  : import("lit-html/lib/lit-extended").then(({render}) => [render, false]);

export default class CorpusculeElement extends HTMLElement {
  static get observedAttributes() {
    if (this[$.propertyMap]) {
      this[$$.initProperties](getDescriptors(this, $.propertyMap));
    }

    if (this[$.stateMap]) {
      this[$$.initStates](getDescriptors(this, $.stateMap));
    }

    if (this[$.computedMap]) {
      this[$$.initComputed](getDescriptors(this, $.computedMap));
    }

    return this[$.attributeMap]
      ? this[$$.initAttributes](getDescriptors(this, $.attributeMap))
      : [];
  }

  static [$.deriveStateFromProps]() {
    return null;
  }

  static [$.shouldUpdate]() {
    return true;
  }

  static [$$.initAttributes](attributes) {
    const attributesRegistry = new Map();

    for (const [
      propertyName,
      [attributeName, guard, {pure} = defaultPropertyOptions],
    ] of Object.entries(attributes)) {
      attributesRegistry.set(attributeName, [propertyName, guard]);

      Object.defineProperty(this.prototype, propertyName, {
        configurable: true,
        get() {
          return this[$$.properties][propertyName];
        },
        set(value) {
          const {[$$.properties]: props} = this;

          if (pure && value === props[propertyName]) {
            return;
          }

          if (typeof value !== guard.name.toLowerCase()) {
            throw new TypeError(`Value applied to "${propertyName}" is not ${guard.name}`);
          }

          props[propertyName] = value;

          if (this[$$.isMount]) {
            toAttribute(this, attributeName, value);
          }

          this[$$.invalidate]("props").catch(handleError);
        },
      });
    }

    this[$$.attributesRegistry] = attributesRegistry;

    return Array.from(attributesRegistry.keys());
  }

  static [$$.initProperties](properties) {
    for (const [propertyName, descriptor] of Object.entries(properties)) {
      let guard = null;
      let pure = true;

      if (descriptor !== null) {
        if (typeof descriptor === "function") {
          guard = descriptor;
        } else {
          [guard, {pure = defaultPropertyOptions.pure}] = descriptor;
        }
      }

      Object.defineProperty(this.prototype, propertyName, {
        configurable: true,
        get() {
          return this[$$.properties][propertyName];
        },
        set(value) {
          const {[$$.properties]: props} = this;

          if (pure && value === props[propertyName]) {
            return;
          }

          if (guard && !guard(value)) {
            throw new TypeError(`Value applied to "${propertyName}" has wrong type`);
          }

          props[propertyName] = value;

          this[$$.invalidate]("props").catch(handleError);
        },
      });
    }
  }

  static [$$.initStates](states) {
    for (const propertyName of states) {
      Object.defineProperty(this.prototype, propertyName, {
        configurable: true,
        get() {
          return this[$$.states][propertyName];
        },
        set(value) {
          this[$$.states][propertyName] = value;
          this[$$.invalidate]("states").catch(handleError);
        },
      });
    }
  }

  static [$$.initComputed](computed) {
    for (const [propertyName, watchings] of Object.entries(computed)) {
      const descriptor = getPropertyDescriptor(this.prototype, propertyName);

      if (!descriptor || !descriptor.get) {
        throw new Error(`Property "${propertyName}" is not defined or is not a getter`);
      }

      const {get} = descriptor;

      const registry = new WeakMap();

      Object.defineProperty(this.prototype, propertyName, {
        configurable: true,
        get() {
          const computedData = prepareComputed(
            this,
            propertyName,
            registry,
            watchings,
            get,
          );

          const {cache} = computedData;
          let isValueUpdated = false;

          for (const [watchingProperty, watchingValue] of cache) {
            if (this[watchingProperty] !== watchingValue) {
              if (!isValueUpdated) {
                computedData.value = get.call(this);
                isValueUpdated = true;
              }

              cache.set(watchingProperty, this[watchingProperty]);
            }
          }

          isValueUpdated = false;

          return computedData.value;
        },
      });
    }
  }

  get renderingPromise() {
    return this[$$.rendering] || Promise.resolve();
  }

  constructor() {
    super();
    this[$$.isMount] = false;
    this[$$.properties] = {};
    this[$$.previousProperties] = {};
    this[$$.previousStates] = {};
    this[$$.root] = this[$.createRoot]();
    this[$$.scheduler] = {
      force: false,
      initial: true,
      mounting: false,
      props: false,
      valid: false,
    };
    this[$$.states] = {};
  }

  async attributeChangedCallback(attrName, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }

    const {[$$.attributesRegistry]: registry} = this.constructor;

    const [propertyName, guard] = registry.get(attrName);
    this[$$.properties][propertyName] = parseAttributeValue(newVal, guard);

    await this[$$.invalidate]("props");
  }

  async connectedCallback() {
    const {[$$.attributesRegistry]: registry} = this.constructor;
    const {[$$.properties]: props} = this;

    if (registry) {
      for (const [attributeName, [propertyName, guard]] of registry) {
        const attributeValue = this.getAttribute(attributeName);
        const property = props[propertyName];

        if (attributeValue !== null) {
          props[propertyName] = parseAttributeValue(attributeValue, guard);
        } else if (property !== undefined && property !== null) {
          toAttribute(this, attributeName, property);
        }
      }
    }

    await this[$$.invalidate]("mounting");
  }

  disconnectedCallback() {
    this[$.didUnmount]();
    this[$$.isMount] = false;
  }

  async forceUpdate() {
    return this[$$.invalidate]("force");
  }

  [$.createRoot]() {
    return this.attachShadow({mode: "open"});
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$.didMount]() {
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$.didUpdate]() {
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$.didUnmount]() {
  }

  // eslint-disable-next-line class-methods-use-this
  [$.render]() {
    throw new Error("[render]() is not implemented");
  }

  async [$$.invalidate](type) {
    const {[$$.scheduler]: scheduler} = this;

    switch (type) {
      case "force":
        scheduler.force = true;
        break;
      case "mounting":
        scheduler.mounting = true;
        scheduler.valid = true;
        break;
      case "props":
        scheduler.props = true;
        break;
      default:
        break;
    }

    if (!scheduler.valid) {
      return this[$$.rendering];
    }

    scheduler.valid = false;

    this[$$.rendering] = schedule(async () => {
      const {
        is,
        [$.deriveStateFromProps]: derive,
        [$.shouldUpdate]: shouldUpdate,
      } = this.constructor;

      const {
        [$$.previousProperties]: prevProps,
        [$$.previousStates]: prevStates,
        [$$.properties]: props,
        [$$.states]: states,
      } = this;

      if (scheduler.mounting || scheduler.props || scheduler.force) {
        this[$$.states] = {
          ...states,
          ...derive(props, prevProps, prevStates),
        };
      }

      const should = !scheduler.force && !scheduler.mounting
        ? shouldUpdate(props, states, prevProps, prevStates)
        : true;

      if (should) {
        const [rendered, [render, compatibilityMode]] = await Promise.all([
          this[$.render](),
          renderPromise,
        ]);

        if (rendered) {
          render(rendered, this[$$.root], compatibilityMode ? is : undefined);
        }
      }

      if (scheduler.mounting) {
        this[$.didMount]();
        this[$$.isMount] = true;
      }

      if (should && !scheduler.mounting) {
        this[$.didUpdate](prevProps, prevStates);
      }

      this[$$.previousProperties] = {
        ...prevProps,
        ...props,
      };

      this[$$.previousStates] = {
        ...prevStates,
        ...states,
      };

      scheduler.valid = true;

      scheduler.initial = false;
      scheduler.mounting = false;
      scheduler.props = false;
    }, scheduler.initial);

    return this[$$.rendering];
  }
}
