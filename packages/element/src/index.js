import {render} from "lit-html";
import {
  attributeRegistry,
  propertyInitializerRegistry,
  stateInitializerRegistry,
} from "./decorators";
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

export {attribute, computed, property, state} from "./decorators";
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

  async forceUpdate() {
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

  async [$$invalidate](type) {
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

    this[$$rendering] = Promise.resolve().then(() => {
      const {
        [$$prevProps]: prevProps,
        [$$prevStates]: prevStates,
        [$$props]: props,
        [$$states]: states,
      } = this;

      this[$$states] = {
        ...states,
        ...this.constructor[$deriveStateFromProps](props, states),
      };

      const shouldUpdate = !scheduler.force && !scheduler.mounting
        ? this.constructor[$shouldUpdate](props, states, prevProps, prevStates)
        : true;

      if (shouldUpdate) {
        const rendered = this[$render]();

        if (rendered) {
          render(rendered, this[$$root]);
        }
      }

      if (scheduler.mounting) {
        this[$didMount]();
        this[$$isMount] = true;
      }

      if (shouldUpdate && !scheduler.mounting) {
        this[$didUpdate](prevProps, prevStates);
      }

      this[$$prevProps] = {
        ...prevProps,
        ...props,
      };

      this[$$prevStates] = {
        ...prevStates,
        ...states,
      };

      scheduler.valid = true;

      scheduler.mounting = false;
      scheduler.props = false;
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
