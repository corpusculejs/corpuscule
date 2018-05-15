import push from './push';
import {CustomElement} from './types';

export default class Link extends HTMLElement implements CustomElement {
  public static readonly is: string = 'corpuscule-link';
  public static readonly observedAttributes: ReadonlyArray<string> = ['to'];

  private readonly __a: HTMLAnchorElement = document.createElement('a');
  private __to: string = ''; // tslint:disable-line:readonly-keyword

  public constructor() {
    super();
    const root = this.attachShadow({mode: 'open'});
    root.appendChild(this.__a);
    this.__a.appendChild(document.createElement('slot'));
  }

  public attributeChangedCallback(_attrName: string, oldVal: string, newVal: string): void {
    if (oldVal !== newVal) {
      this.__to = newVal;
      this.__a.href = this.__to;
    }
  }

  public connectedCallback(): void {
    this.__to = this.getAttribute('to') || '';
    this.__a.href = this.__to;
    this.__a.addEventListener('click', this.__handleClick);
  }

  public disconnectedCallback(): void {
    this.__a.removeEventListener('click', this.__handleClick);
  }

  public get to(): string {
    return this.__to;
  }

  public set to(value: string) {
    this.__to = value;
    this.setAttribute('to', this.__to);
  }

  private readonly __handleClick = (e: Event) => {
    e.preventDefault();
    push(this.__to);
  };
}

customElements.define(Link.is, Link);
