import push from "./push";
import {a, handleClick, to} from "./tokens";
import {CustomElement} from "./types";

export default class Link extends HTMLElement implements CustomElement {
  public static readonly is: string = "corpuscule-link";
  public static readonly observedAttributes: ReadonlyArray<string> = ["to"];

  private readonly [a]: HTMLAnchorElement = document.createElement("a");
  private [to]: string = ""; // tslint:disable-line:readonly-keyword

  public constructor() {
    super();
    const root = this.attachShadow({mode: "open"});
    root.appendChild(this[a]);
    this[a].appendChild(document.createElement("slot"));
  }

  public attributeChangedCallback(_attrName: string, oldVal: string, newVal: string): void {
    if (oldVal !== newVal) {
      this[to] = newVal;
      this[a].href = this[to];
    }
  }

  public connectedCallback(): void {
    this[to] = this.getAttribute("to") || "";
    this[a].href = this[to];
    this[a].addEventListener("click", this[handleClick]);
  }

  public disconnectedCallback(): void {
    this[a].removeEventListener("click", this[handleClick]);
  }

  public get to(): string {
    return this[to];
  }

  public set to(value: string) {
    this[to] = value;
    this.setAttribute("to", this[to]);
  }

  private readonly [handleClick] = (e: Event) => {
    e.preventDefault();
    push(this[to]);
  };
}

customElements.define(Link.is, Link);
