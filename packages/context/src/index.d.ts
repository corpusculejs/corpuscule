import {CustomElementClass, UncertainCustomElementClass} from "@corpuscule/types";

declare const createContext: <T>(defaultValue?: T) => {
  readonly consumer: <T = {}>(target: UncertainCustomElementClass<T>) => CustomElementClass<T>;
  readonly contextValue: "contextValue"; // hack to resolve unique symbol widening
  readonly provider: <T = {}>(target: UncertainCustomElementClass<T>) => CustomElementClass<T>;
  readonly providingValue: "providingValue"; // hack to resolve unique symbol widening
};

export default createContext;
