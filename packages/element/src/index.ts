import {TemplateResult} from 'lit-html';
import {render} from 'lit-html/lib/shady-render';
import schedule from './scheduler';
import {
  AttributeDescriptor,
  AttributeGuard,
  ComputedDescriptor,
  PropertyGuard,
  PropertyList,
  Scheduler,
  UpdateType
} from './types';
import {getBasePrototype, initAttributes, initComputed, initProperties, initStates} from './utils';

export {
  AttributeDescriptor,
  AttributeGuard,
  ComputedDescriptor,
  PropertyList,
  PropertyGuard,
};

export default abstract class CorpusculeElement extends HTMLElement {
  public static readonly is: string;
  public static get observedAttributes(): ReadonlyArray<string> {
    if (this._properties) {
      initProperties(getBasePrototype(this, '_properties')!, this._properties);
    }

    if (this._states) {
      initStates(getBasePrototype(this, '_states')!, this._states);
    }

    if (this._computed) {
      initComputed(getBasePrototype(this, '_computed')!, this._computed);
    }

    return this._attributes
      ? initAttributes(getBasePrototype(this, '_attributes')!, this._attributes)
      : [];
  }

  protected static readonly _attributes?: PropertyList<AttributeDescriptor>;
  protected static readonly _properties?: PropertyList<PropertyGuard>;
  protected static readonly _states?: ReadonlyArray<string> = [];
  protected static readonly _computed?: PropertyList<ComputedDescriptor>;

  private static readonly __attributesRegistry: Map<string, [string, AttributeGuard]>;

  protected static _deriveStateFromProps(
    _nextProps: PropertyList<any>,
    _prevProps: PropertyList<any>,
    _prevState: PropertyList<any>,
  ): PropertyList<any> | null {
    return null;
  }

  protected static _shouldUpdate(
    _nextProps: PropertyList<any>,
    _nextState: PropertyList<any>,
    _prevProps: PropertyList<any>,
    _prevState: PropertyList<any>,
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

  private readonly __prevProperties: PropertyList<any> = {};
  private readonly __prevStates: PropertyList<any> = {};
  private readonly __properties: PropertyList<any> = {};
  private readonly __states: PropertyList<any> = {};

  private readonly __root: Element | DocumentFragment = this._createRoot();
  private readonly __scheduler: Scheduler = {
    force: false,
    initial: true,
    mounting: false,
    props: false,
    valid: false,
  };

  private __isMount: boolean = false; // tslint:disable-line:readonly-keyword

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
        this.__properties[propertyName] = __parseAttributeValue(attributeValue, guard);
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
    _prevProperties: PropertyList<any>,
    _prevStates: PropertyList<any>,
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

    return schedule(() => {
      const {
        is,
        _deriveStateFromProps,
        _shouldUpdate,
      } = this.constructor as typeof CorpusculeElement;

      if (scheduler.mounting || scheduler.props || scheduler.force) {
        Object.assign(
          this.__states,
          _deriveStateFromProps(this.__properties, this.__prevProperties, this.__prevStates),
        );
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

      Object.assign(this.__prevProperties, this.__properties);
      Object.assign(this.__prevStates, this.__states);

      scheduler.valid = true;

      scheduler.initial = false;
      scheduler.mounting = false;
      scheduler.props = false;
    }, scheduler.initial);
  }
}
