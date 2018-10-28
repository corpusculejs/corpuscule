import {render} from "lit-html";
import schedule from "./scheduler";
import {
  invalidate as $$invalidate,
  rendering as $$rendering,
  root as $$root,
  scheduler as $$scheduler,
} from "./tokens/internal";
import {
  createRoot as $createRoot,
  didUpdate as $didUpdate,
  render as $render,
  shouldUpdate as $shouldUpdate,
} from "./tokens/lifecycle";
import {
  forceStage,
  mountingStage,
  propsChangedStage,
  stateChangedStage,
} from "./tokens/stages";
import {attributeRegistry} from "./decorators/attribute";

export {default as attribute} from "./decorators/attribute";
export {default as createComputingPair} from "./decorators/computed";
export {default as element} from "./decorators/element";
export {default as property} from "./decorators/property";
export {default as state} from "./decorators/state";
export {default as dhtml, unsafeStatic, UnsafeStatic} from "./dhtml";
export * from "./tokens/lifecycle";

export default class CorpusculeElement extends HTMLElement {
  static get observedAttributes() {
    return attributeRegistry.has(this)
      ? Array.from(attributeRegistry.get(this))
      : [];
  }

  get elementRendering() {
    return this[$$rendering] || Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  get [$shouldUpdate]() {
    return true;
  }

  constructor() {
    super();

    this[$$root] = this[$createRoot]();
    this[$$scheduler] = {
      force: false,
      mounting: false,
      props: false,
      valid: true,
    };
  }

  async attributeChangedCallback(_, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }

    await this[$$invalidate](propsChangedStage);
  }

  async connectedCallback() {
    await this[$$invalidate](mountingStage);
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  disconnectedCallback() {}

  forceUpdate() {
    return this[$$invalidate](forceStage);
  }

  [$createRoot]() {
    return this.attachShadow({mode: "open"});
  }

  // eslint-disable-next-line no-empty-function, class-methods-use-this
  [$didUpdate]() {}

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
      const shouldUpdate = !scheduler.force && !scheduler.mounting
        ? this[$shouldUpdate]
        : true;

      if (shouldUpdate) {
        const rendered = this[$render]();

        if (rendered) {
          render(rendered, this[$$root]);
        }
      }

      const shouldRunDidUpdate = shouldUpdate && !scheduler.mounting;

      scheduler.mounting = false;
      scheduler.force = false;
      scheduler.props = false;
      scheduler.valid = true;

      if (shouldRunDidUpdate) {
        this[$didUpdate]();
      }
    });

    return this[$$rendering];
  }
}
