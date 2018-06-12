import {html, render} from "lit-html/lib/lit-extended";
import push from "./push";
import * as $$ from "./tokens/internal";

export default class Link extends HTMLElement {
  static get is() {
    return "corpuscule-link";
  }

  static get observedAttributes() {
    return ["to"];
  }

  constructor() {
    super();
    this.attachShadow({mode: "open"});
  }

  get to() {
    return this[$$.to];
  }

  set to(value) {
    this[$$.to] = value;
    this[render]();
  }

  attributeChangedCallback(_attrName, oldVal, newVal) {
    if (oldVal !== newVal) {
      this.to = newVal;
    }
  }

  connectedCallback() {
    this.to = this.getAttribute("to") || "";
  }

  [render]() {
    render(html`
      <style>
        :host {
          --corpuscule-link-color-default: #0000ee;
          --corpuscule-link-color-visited: #551a8b;
          --corpuscule-link-color-active: #ff0000;
          --corpuscule-link-text-decoration: underline;
          --corpuscule-link-text-decoration-hover: none;
        }
        :host[rel~=help] a:link, :host[rel~=help] a:visited { cursor: help; }
        :link { color: var(--corpuscule-link-color-default); }
        :visited { color: var(--corpuscule-link-color-visited); }
        :link:hover, :visited:hover { text-decoration: var(--corpuscule-link-text-decoration-hover); }
        :link:active, :visited:active, :link:hover, :visited:hover { color: var(--corpuscule-link-color-active); }
        :link, :visited { text-decoration: var(--corpuscule-link-text-decoration); cursor: pointer; }
      </style>
      <a href="${this[$$.to]}" on-click="${this[$$.handleClick]}">
        <slot></slot>
      </a>
    `, this.shadowRoot);
  }

  [$$.handleClick](e) {
    e.preventDefault();
    push(this[$$.to]);
  }
}
