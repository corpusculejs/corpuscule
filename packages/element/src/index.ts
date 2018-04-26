import {TemplateResult} from 'lit-html';
import {render} from 'lit-html/lib/shady-render';
import {attributeMap} from './decorators';
import schedule from './scheduler';
import {InvalidationType, PropertiesList} from './types';

export * from './decorators';

// tslint:disable:readonly-keyword
interface ToUpdate {
  mounting: boolean;
  props: boolean;
}
// tslint:enable:readonly-keyword

export default class CorpusculeElement extends HTMLElement {
  public static readonly is: string;
  public static readonly observedAttributes: ReadonlyArray<string>;

  protected static _getDerivedStateFromProps?(
    nextProps: PropertiesList,
    prevProps: PropertiesList,
    prevState: PropertiesList,
  ): PropertiesList;

  protected static _shouldComponentUpdate(
    _nextProps: PropertiesList,
    _nextState: PropertiesList,
    _prevProps: PropertiesList,
    _prevState: PropertiesList,
  ): boolean {
    return true;
  }

  private __isFirstRender: boolean = true; // tslint:disable-line:readonly-keyword
  private __isValid: boolean = true; // tslint:disable-line:readonly-keyword
  private readonly __prevProps: PropertiesList = {};
  private readonly __prevState: PropertiesList = {};
  private readonly __props: PropertiesList = {};
  private readonly __root: ShadowRoot | HTMLDivElement;
  private readonly __state: PropertiesList = {};
  private readonly __toUpdate: ToUpdate = {
    mounting: false,
    props: false,
  };

  public constructor() {
    super();

    if (!(this.constructor as typeof CorpusculeElement).is) {
      throw new Error('@element() decorator is missing');
    }

    this.__root = this.attachShadow({mode: 'open'});
  }

  public attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
    if (oldVal === newVal) {
      return;
    }

    const attributes = attributeMap.get(this.constructor.prototype)!;
    const data = attributes.get(attrName);

    if (data) {
      const [propertyName, convert] = data;
      this.__props[propertyName] = convert ? convert(newVal) : newVal;
    }

    this._invalidate(InvalidationType.Props);
  }

  public async connectedCallback(): Promise<void> {
    const map = attributeMap.get(this.constructor.prototype);

    if (map) {
      for (const [attribute, [propertyName, convert]] of map) {
        const value = this.getAttribute(attribute);
        this.__props[propertyName] = convert ? convert(value) : value;
      }
    }

    await this._invalidate(InvalidationType.Mounting);

    if (this._componentDidMount) {
      this._componentDidMount();
    }
  }

  public disconnectedCallback(): void {
    if (this._componentWillUnmount) {
      this._componentWillUnmount();
    }
  }

  protected _componentDidMount?(): void;

  protected _componentDidUpdate?(): void;

  protected _componentWillUnmount?(): void;

  protected _render(): TemplateResult {
    throw new Error('_render() is not implemented');
  }

  protected async _invalidate(type: InvalidationType): Promise<void> {
    const {__toUpdate} = this;

    if (type === InvalidationType.Mounting) {
      __toUpdate.mounting = true;
    } else if (type === InvalidationType.Props) {
      __toUpdate.props = true;
    }

    if (!this.__isValid) {
      return;
    }

    this.__isValid = false;

    schedule(() => {
      const {
        is,
        _getDerivedStateFromProps,
        _shouldComponentUpdate,
      } = this.constructor as typeof CorpusculeElement;

      if (
        _getDerivedStateFromProps
        && (__toUpdate.props || __toUpdate.mounting)
      ) {
        Object.assign(
          this.__state,
          _getDerivedStateFromProps(this.__props, this.__prevProps, this.__prevState),
        );
      }

      const shouldUpdate = _shouldComponentUpdate(
        this.__props,
        this.__state,
        this.__prevProps,
        this.__prevState,
      );

      if (shouldUpdate) {
        render(this._render(), this.__root, is);
      }

      Object.assign(this.__prevProps, this.__props);
      Object.assign(this.__prevState, this.__state);

      this.__isValid = true;

      if (shouldUpdate && !__toUpdate.mounting && this._componentDidUpdate) {
        this._componentDidUpdate();
      }

      __toUpdate.mounting = false;
      __toUpdate.props = false;
      this.__isFirstRender = false;
    }, this.__isFirstRender);
  }
}
