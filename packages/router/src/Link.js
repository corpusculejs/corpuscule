import push from "./push";
import {handleClick as $$handleClick} from "./tokens/internal";

export default class Link extends HTMLAnchorElement {
  static get is() {
    return "corpuscule-link";
  }

  constructor() {
    super();
    this[$$handleClick] = this[$$handleClick].bind(this);
  }

  connectedCallback() {
    this.addEventListener("click", this[$$handleClick]);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this[$$handleClick]);
  }

  [$$handleClick](e) {
    e.preventDefault();
    push(`${this.pathname}${this.search}${this.hash}`);
  }
}

customElements.define(Link.is, Link, {extends: "a"});
