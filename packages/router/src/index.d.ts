import createContext from "@corpuscule/context";
import {CustomElement, CustomElementClass, UncertainCustomElementClass} from "@corpuscule/types";
import UniversalRouter, {Options, Route} from "universal-router";

export const layout: unique symbol;

export const createRouter: (routes: Route | ReadonlyArray<Route>, options?: Options) => UniversalRouter;

export class Link extends HTMLAnchorElement implements CustomElement {
  public static readonly is: "corpuscule-link";

  public connectedCallback(): void;

  public disconnectedCallback(): void;
}

export const push: (path: string, title?: string) => void;

export const provider: ReturnType<typeof createContext>["provider"];
export const router: unique symbol;

export interface RouterOutlet {
  readonly resolvingPromise: Promise<void>;
}

export const outlet:
  (routes: ReadonlyArray<Route>) => {
    <T = {}>(target: UncertainCustomElementClass<T>): CustomElementClass<T & RouterOutlet>,
    <T extends UncertainCustomElementClass<T>>(target: T): T,
  };
