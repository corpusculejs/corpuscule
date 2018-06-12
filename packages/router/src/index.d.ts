import createContext from "@corpuscule/context";
import UniversalRouter, {Options, Route} from "universal-router";

export {
  UniversalRouter,
  Options,
  Route,
};

export interface Constructor<T> {
  new(...args: any[]): T; // tslint:disable-line:readonly-array
}

export interface CustomElement extends HTMLElement {
  attributeChangedCallback?(attrName: string, oldVal: string, newVal: string): void;

  connectedCallback?(): void;

  disconnectedCallback?(): void;

  adoptedCallback?(): void;
}

export const layout: unique symbol;

export const createRouter: (routes: Route | ReadonlyArray<Route>, options?: Options) => UniversalRouter;

export class Link extends HTMLElement implements CustomElement {
  public static readonly is: string;
  public static readonly observedAttributes: ReadonlyArray<string>;

  public to: string; // tslint:disable-line:readonly-keyword

  public attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void;

  public connectedCallback(): void;
}

export const push: (path: string, title?: string) => void;

export const provider: ReturnType<typeof createContext>["provider"];
export const router: unique symbol;

export const route:
  (routes: ReadonlyArray<Route>) =>
    <T extends Constructor<CustomElement>>(target: T) => T;
