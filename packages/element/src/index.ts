import {TemplateResult} from 'lit-html';
import {render} from 'lit-html/lib/shady-render';
import schedule from './scheduler';
import * as i from './tokens/internal';
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

export default abstract class CorpusculeElement extends HTMLElement {
  public static readonly is: string;
  public static get observedAttributes(): ReadonlyArray<string> {
    if (this._properties) {
      initProperties(this, getAllPropertyDescriptors(this, '_properties'));
    }

    if (this._states) {
      initStates(this, getAllPropertyDescriptors(this, '_states'));
    }

    if (this._computed) {
      initComputed(this, getAllPropertyDescriptors(this, '_computed'));
    }

    return this._attributes
      ? initAttributes(this, getAllPropertyDescriptors(this, '_attributes'))
      : [];
  }

  protected static readonly _attributes?: AttributeDescriptorMap<{}>;
  protected static readonly _properties?: PropertyDescriptorMap<{}>;
  protected static readonly _states?: StateDescriptorMap<{}>;
  protected static readonly _computed?: ComputedDescriptorMap<{}>;

  // tslint:disable-next-line:no-unused-variable
  private static readonly [i.attributesRegistry]: Map<string, [string, AttributeGuard]>;

  protected static _deriveStateFromProps(
    _nextProps: {},
    _prevProps: {},
    _prevState: {},
  ): {} | null {
    return null;
  }

  protected static _shouldUpdate(
    _nextProps: {},
    _nextState: {},
    _prevProps: {},
    _prevState: {},
  ): boolean {
    return true;
  }

  // tslint:disable-next-line:no-unused-variable
  private static [i.parseAttributeValue](value: string | null, guard: AttributeGuard): boolean | number | string {
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
    return this[i.rendering] || Promise.resolve();
  }

  private readonly [i.root]: Element | DocumentFragment = this._createRoot();

  // tslint:disable:readonly-keyword no-unused-variable
  private readonly [i.properties]: {[propertyName: string]: any} = {};
  private readonly [i.scheduler]: Scheduler = {
    force: false,
    initial: true,
    mounting: false,
    props: false,
    valid: false,
  };

  private [i.isMount]: boolean = false;
  private [i.previousProperties]: {[propertyName: string]: any} = {};
  private [i.previousStates]: {[propertyName: string]: any} = {};
  private [i.rendering]?: Promise<void>;
  private [i.states]: {[propertyName: string]: any} = {};
  // tslint:enable:readonly-keyword

  public async attributeChangedCallback(attrName: string, oldVal: string, newVal: string): Promise<void> {
    if (oldVal === newVal) {
      return;
    }

    const {
      [i.attributesRegistry]: registry,
      [i.parseAttributeValue]: parse,
    } = this.constructor as typeof CorpusculeElement;

    const [propertyName, guard] = registry.get(attrName)!;
    this[i.properties][propertyName] = parse(newVal, guard);

    await this[i.invalidate](UpdateType.Props);
  }

  public async connectedCallback(): Promise<void> {
    const {
      [i.attributesRegistry]: registry,
      [i.parseAttributeValue]: parse,
    } = this.constructor as typeof CorpusculeElement;

    const {[i.properties]: props} = this;

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

    await this[i.invalidate](UpdateType.Mounting);
  }

  public disconnectedCallback(): void {
    this._didUnmount();
    this[i.isMount] = false;
  }

  public async forceUpdate(): Promise<void> {
    return this[i.invalidate](UpdateType.Force);
  }

  protected _createRoot(): Element | DocumentFragment {
    return this.attachShadow({mode: 'open'});
  }

  // tslint:disable:no-empty
  protected _didMount(): void {}

  protected _didUpdate(
    _prevProperties: {},
    _prevStates: {},
  ): void {}

  protected _didUnmount(): void {}
  // tslint:enable:no-empty

  protected abstract _render(): TemplateResult | null;

  private async [i.invalidate](type: UpdateType): Promise<void> {
    const {[i.scheduler]: scheduler} = this;

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

    this[i.rendering] = schedule(() => {
      const {
        is,
        _deriveStateFromProps,
        _shouldUpdate,
      } = this.constructor as typeof CorpusculeElement;

      const {
        [i.previousProperties]: prevProps,
        [i.previousStates]: prevStates,
        [i.properties]: props,
        [i.states]: states,
      } = this;

      if (scheduler.mounting || scheduler.props || scheduler.force) {
        this[i.states] = {
          ...states,
          ..._deriveStateFromProps(props, prevProps, prevStates),
        };
      }

      const shouldUpdate = !scheduler.force && !scheduler.mounting
        ? _shouldUpdate(
          props,
          states,
          prevProps,
          prevStates,
        )
        : true;

      if (shouldUpdate) {
        const rendered = this._render();

        if (rendered) {
          render(rendered, this[i.root], is);
        }
      }

      if (scheduler.mounting) {
        this._didMount();
        this[i.isMount] = true;
      }

      if (shouldUpdate && !scheduler.mounting) {
        this._didUpdate(prevProps, prevStates);
      }

      this[i.previousProperties] = {
        ...prevProps,
        ...props,
      };

      this[i.previousStates] = {
        ...prevStates,
        ...states,
      };

      scheduler.valid = true;

      scheduler.initial = false;
      scheduler.mounting = false;
      scheduler.props = false;
    }, scheduler.initial);

    return this[i.rendering];
  }
}
