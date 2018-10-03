import {render} from "lit-html";
import {
  attributeRegistry,
  propertyInitializerRegistry,
  stateInitializerRegistry,
} from "./decorators";
import schedule from "./schedule";
import {
  initializeValues as $$initializeValues,
  invalidate as $$invalidate,
  isMount as $$isMount,
  prevProps as $$prevProps,
  prevStates as $$prevStates,
  props as $$props,
  rendering as $$rendering,
  root as $$root,
  scheduler as $$scheduler,
  states as $$states,
} from "./tokens/internal";
import {
  createRoot as $createRoot,
  didMount as $didMount,
  didUpdate as $didUpdate,
  didUnmount as $didUnmount,
  deriveStateFromProps as $deriveStateFromProps,
  render as $render,
  shouldUpdate as $shouldUpdate,
} from "./tokens/lifecycle";
import {
  forceStage,
  mountingStage,
  propsChangedStage,
  stateChangedStage,
} from "./tokens/stages";
import {
  parseAttributeValue,
  toAttribute,
} from "./utils";

export {attribute, element, property, state} from "./decorators";
export * from "./tokens/lifecycle";

export default class CorpusculeElement extends HTMLElement {
  static get observedAttributes() {
    return attributeRegistry.has(this)
      ? Array.from(attributeRegistry.get(this).keys())
      : [];
  }

  static [$deriveStateFromProps]() {
    return null;
  }

  static [$shouldUpdate]() {
    return true;
  }

  get elementRendering() {
    return this[$$rendering] || Promise.resolve();
  }

  constructor() {
    super();

    this[$$isMount] = false;
    this[$$props] = this[$$initializeValues](propertyInitializerRegistry);
    this[$$prevProps] = {};
    this[$$prevStates] = {};
    this[$$root] = this[$createRoot]();
    this[$$scheduler] = {
      force: false,
      mounting: false,
      props: false,
      valid: false,
    };
    this[$$states] = this[$$initializeValues](stateInitializerRegistry);
  }

  async attributeChangedCallback(attrName, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }

    const registry = attributeRegistry.get(this.constructor);
    const [propertyName, guard] = registry.get(attrName);
    this[$$props][propertyName] = parseAttributeValue(newVal, guard);

    await this[$$invalidate](propsChangedStage);
  }

  async connectedCallback() {
    const registry = attributeRegistry.get(this.constructor);
    const {[$$props]: props} = this;

    if (registry) {
      // If attribute is set before component mounting, it is considered primary and
      // inner property should be set to attribute value; setting inner property during
      // class initialization is a fallback in case attribute is not set.
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

    await this[$$invalidate](mountingStage);
  }

  disconnectedCallback() {
    this[$didUnmount]();
    this[$$isMount] = false;
  }

  forceUpdate() {
    return this[$$invalidate](forceStage);
  }

  [$createRoot]() {
    return this.attachShadow({mode: "open"});
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$didMount]() {
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$didUpdate]() {
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$didUnmount]() {
  }

  // eslint-disable-next-line class-methods-use-this
  [$render]() {
    throw new Error("[render]() is not implemented");
  }

  [$$invalidate](type) {
    const {[$$scheduler]: scheduler} = this;

    // eslint-disable-next-line default-case
    switch (type) {
      case forceStage:
        scheduler.force = true;
        break;
      case mountingStage:
        scheduler.mounting = true;
        scheduler.valid = true;
        break;
      case propsChangedStage:
        scheduler.props = true;
        break;
      case stateChangedStage:
        break;
    }

    if (!scheduler.valid) {
      return this[$$rendering];
    }

    scheduler.valid = false;

    // Setting all component properties takes time. So it is necessary to wait until this setting
    // is over and only then component is able to update. Starting rendering after Promise.resolve()
    // allows to have single rendering even if all component properties are changed.
    this[$$rendering] = schedule(() => {
      const {
        [$$prevProps]: prevProps,
        [$$prevStates]: prevStates,
        [$$props]: props,
      } = this;

      let {[$$states]: states} = this;

      const derivedState = this.constructor[$deriveStateFromProps](props, states);

      this[$$states] = states = derivedState ? { // eslint-disable-line no-multi-assign
        ...states,
        ...derivedState,
      } : states;

      const shouldUpdate = !scheduler.force && !scheduler.mounting
        ? this.constructor[$shouldUpdate](props, states, prevProps, prevStates)
        : true;

      if (shouldUpdate) {
        const rendered = this[$render]();

        if (rendered) {
          render(rendered, this[$$root]);
        }
      }

      const shouldRunDidMount = scheduler.mounting;
      const shouldRunDidUpdate = shouldUpdate && !scheduler.mounting;

      this[$$prevProps] = {...props};
      this[$$prevStates] = {...states};

      scheduler.mounting = false;
      scheduler.force = false;
      scheduler.props = false;
      scheduler.valid = true;

      if (shouldRunDidMount) {
        this[$didMount]();
        this[$$isMount] = true;
      }

      if (shouldRunDidUpdate) {
        this[$didUpdate](prevProps, prevStates);
      }
    }).catch((e) => {
      throw e;
    });

    return this[$$rendering];
  }

  [$$initializeValues](registry) {
    const result = {};

    const initializers = registry.get(this.constructor);

    if (initializers) {
      for (const [key, initializer] of initializers) {
        result[key] = initializer ? initializer.call(this) : undefined;
      }
    }

    return result;
  }
}
