import {TemplateResult} from 'lit-html';
import {render} from 'lit-html/lib/shady-render';
import schedule from './scheduler';
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

  private static readonly __attributesRegistry: Map<string, [string, AttributeGuard]>;

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

  private static __parseAttributeValue(value: string | null, guard: AttributeGuard): boolean | number | string {
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
    return this.__rendering || Promise.resolve();
  }

  private readonly __properties: {[propertyName: string]: any} = {}; // tslint:disable-line:readonly-keyword

  private readonly __root: Element | DocumentFragment = this._createRoot();
  private readonly __scheduler: Scheduler = {
    force: false,
    initial: true,
    mounting: false,
    props: false,
    valid: false,
  };

  // tslint:disable:readonly-keyword
  private __isMount: boolean = false;
  private __prevProperties: {[propertyName: string]: any} = {}; // tslint:disable-line:readonly-keyword
  private __prevStates: {[propertyName: string]: any} = {}; // tslint:disable-line:readonly-keyword
  private __rendering?: Promise<void>;
  private __states: {[propertyName: string]: any} = {}; // tslint:disable-line:readonly-keyword
  // tslint:enable:readonly-keyword

  public async attributeChangedCallback(attrName: string, oldVal: string, newVal: string): Promise<void> {
    if (oldVal === newVal) {
      return;
    }

    const {
      __attributesRegistry,
      __parseAttributeValue,
    } = this.constructor as typeof CorpusculeElement;

    const [propertyName, guard] = __attributesRegistry.get(attrName)!;
    this.__properties[propertyName] = __parseAttributeValue(newVal, guard);

    await this.__invalidate(UpdateType.Props);
  }

  public async connectedCallback(): Promise<void> {
    const {
      __attributesRegistry,
      __parseAttributeValue,
    } = this.constructor as typeof CorpusculeElement;

    if (__attributesRegistry) {
      for (const [attributeName, [propertyName, guard]] of __attributesRegistry) {
        const attributeValue = this.getAttribute(attributeName);
        const property = this.__properties[propertyName];

        if (attributeValue !== null) {
          this.__properties[propertyName] = __parseAttributeValue(attributeValue, guard);
        } else if (property !== undefined && property !== null) {
          toAttribute(this, attributeName, property);
        }
      }
    }

    await this.__invalidate(UpdateType.Mounting);
  }

  public disconnectedCallback(): void {
    this._didUnmount();
    this.__isMount = false;
  }

  public async forceUpdate(): Promise<void> {
    return this.__invalidate(UpdateType.Force);
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

  protected abstract _render(): TemplateResult;

  private async __invalidate(type: UpdateType): Promise<void> {
    const {__scheduler: scheduler} = this;

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

    this.__rendering = schedule(() => {
      const {
        is,
        _deriveStateFromProps,
        _shouldUpdate,
      } = this.constructor as typeof CorpusculeElement;

      if (scheduler.mounting || scheduler.props || scheduler.force) {
        this.__states = {
          ...this.__states,
          ..._deriveStateFromProps(this.__properties, this.__prevProperties, this.__prevStates),
        };
      }

      const shouldUpdate = !scheduler.force && !scheduler.mounting
        ? _shouldUpdate(
          this.__properties,
          this.__states,
          this.__prevProperties,
          this.__prevStates,
        )
        : true;

      if (shouldUpdate) {
        render(this._render(), this.__root, is);
      }

      if (scheduler.mounting) {
        this._didMount();
        this.__isMount = true;
      }

      if (shouldUpdate && !scheduler.mounting) {
        this._didUpdate(this.__prevProperties, this.__prevStates);
      }

      this.__prevProperties = {
        ...this.__prevProperties,
        ...this.__properties,
      };

      this.__prevStates = {
        ...this.__prevStates,
        ...this.__states,
      };

      scheduler.valid = true;

      scheduler.initial = false;
      scheduler.mounting = false;
      scheduler.props = false;
    }, scheduler.initial);

    return this.__rendering;
  }
}
