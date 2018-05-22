import {TemplateResult} from 'lit-html';
import {render} from 'lit-html/lib/shady-render';
import schedule from './scheduler';
import * as $$ from './tokens/internal';
import * as $ from './tokens/lifecycle';
import {
  AttributeDescriptor,
  AttributeDescriptorMap,
  AttributeGuard,
  ComputedDescriptor,
  ComputedDescriptorMap,
  PropertyDescriptor,
  PropertyDescriptorMap,
  PropertyGuard,
  Scheduler,
  StateDescriptorMap,
  UpdateType,
} from './types';
import {
  getAllPropertyDescriptors,
  initAttributes,
  initComputed,
  initProperties,
  initStates,
  toAttribute,
} from './utils';

export {
  AttributeDescriptor,
  AttributeDescriptorMap,
  AttributeGuard,
  ComputedDescriptor,
  ComputedDescriptorMap,
  PropertyDescriptor,
  PropertyDescriptorMap,
  PropertyGuard,
  StateDescriptorMap,
};

export * from './tokens/lifecycle';

export default abstract class CorpusculeElement extends HTMLElement {
  public static readonly is: string;
  public static get observedAttributes(): ReadonlyArray<string> {
    if (this[$.propertyMap]) {
      initProperties(this, getAllPropertyDescriptors(this, $.propertyMap));
    }

    if (this[$.stateMap]) {
      initStates(this, getAllPropertyDescriptors(this, $.stateMap));
    }

    if (this[$.computedMap]) {
      initComputed(this, getAllPropertyDescriptors(this, $.computedMap));
    }

    return this[$.attributeMap]
      ? initAttributes(this, getAllPropertyDescriptors(this, $.attributeMap))
      : [];
  }

  protected static readonly [$.attributeMap]?: AttributeDescriptorMap<{}>;
  protected static readonly [$.propertyMap]?: PropertyDescriptorMap<{}>;
  protected static readonly [$.stateMap]?: StateDescriptorMap<any>;
  protected static readonly [$.computedMap]?: ComputedDescriptorMap<{}>;

  // tslint:disable-next-line:no-unused-variable
  private static readonly [$$.attributesRegistry]: Map<string, [string, AttributeGuard]>;

  protected static [$.deriveStateFromProps](
    _nextProps: {},
    _prevProps: {},
    _prevState: {},
  ): {} | null {
    return null;
  }

  protected static [$.shouldUpdate](
    _nextProps: {},
    _nextState: {},
    _prevProps: {},
    _prevState: {},
  ): boolean {
    return true;
  }

  // tslint:disable-next-line:no-unused-variable
  private static [$$.parseAttributeValue](value: string | null, guard: AttributeGuard): boolean | number | string {
    switch (guard) {
      case Boolean:
        return (value !== null);
      case Number:
        return Number(value);
      default:
        return String(value);
    }
  }

  public get rendering(): Promise<void> {
    return this[$$.rendering] || Promise.resolve();
  }

  private readonly [$$.root]: Element | DocumentFragment = this[$.createRoot]();

  // tslint:disable:readonly-keyword no-unused-variable
  private readonly [$$.properties]: {[propertyName: string]: any} = {};
  private readonly [$$.scheduler]: Scheduler = {
    force: false,
    initial: true,
    mounting: false,
    props: false,
    valid: false,
  };

  private [$$.isMount]: boolean = false;
  private [$$.previousProperties]: {[propertyName: string]: any} = {};
  private [$$.previousStates]: {[propertyName: string]: any} = {};
  private [$$.rendering]?: Promise<void>;
  private [$$.states]: {[propertyName: string]: any} = {};
  // tslint:enable:readonly-keyword

  public async attributeChangedCallback(attrName: string, oldVal: string, newVal: string): Promise<void> {
    if (oldVal === newVal) {
      return;
    }

    const {
      [$$.attributesRegistry]: registry,
      [$$.parseAttributeValue]: parse,
    } = this.constructor as typeof CorpusculeElement;

    const [propertyName, guard] = registry.get(attrName)!;
    this[$$.properties][propertyName] = parse(newVal, guard);

    await this[$$.invalidate](UpdateType.Props);
  }

  public async connectedCallback(): Promise<void> {
    const {
      [$$.attributesRegistry]: registry,
      [$$.parseAttributeValue]: parse,
    } = this.constructor as typeof CorpusculeElement;

    const {[$$.properties]: props} = this;

    if (registry) {
      for (const [attributeName, [propertyName, guard]] of registry) {
        const attributeValue = this.getAttribute(attributeName);
        const property = props[propertyName];

        if (attributeValue !== null) {
          props[propertyName] = parse(attributeValue, guard);
        } else if (property !== undefined && property !== null) {
          toAttribute(this, attributeName, property);
        }
      }
    }

    await this[$$.invalidate](UpdateType.Mounting);
  }

  public disconnectedCallback(): void {
    this[$.didUnmount]();
    this[$$.isMount] = false;
  }

  public async forceUpdate(): Promise<void> {
    return this[$$.invalidate](UpdateType.Force);
  }

  protected [$.createRoot](): Element | DocumentFragment {
    return this.attachShadow({mode: 'open'});
  }

  // tslint:disable:no-empty
  protected [$.didMount](): void {}

  protected [$.didUpdate](
    _prevProperties: {},
    _prevStates: {},
  ): void {}

  protected [$.didUnmount](): void {}
  // tslint:enable:no-empty

  protected abstract [$.render](): TemplateResult | null;

  private async [$$.invalidate](type: UpdateType): Promise<void> {
    const {[$$.scheduler]: scheduler} = this;

    switch (type) {
      case UpdateType.Force:
        scheduler.force = true;
        break;
      case UpdateType.Mounting:
        scheduler.mounting = true;
        scheduler.valid = true;
        break;
      case UpdateType.Props:
        scheduler.props = true;
        break;
      default:
        break;
    }

    if (!scheduler.valid) {
      return;
    }

    scheduler.valid = false;

    this[$$.rendering] = schedule(() => {
      const {
        is,
        [$.deriveStateFromProps]: derive,
        [$.shouldUpdate]: shouldUpdate,
      } = this.constructor as typeof CorpusculeElement;

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
        ? shouldUpdate(
          props,
          states,
          prevProps,
          prevStates,
        )
        : true;

      if (should) {
        const rendered = this[$.render]();

        if (rendered) {
          render(rendered, this[$$.root], is);
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
