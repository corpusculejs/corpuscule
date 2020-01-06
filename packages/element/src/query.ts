import {
  BabelPropertyDescriptor,
  CustomElement,
  HTMLRoot,
} from '@corpuscule/typings';

export type QueryOptions = {
  lightDOM?: boolean;
};

const executeQuery = <C extends CustomElement>(
  callback: (root: HTMLRoot) => Element | NodeListOf<Element> | null,
  {lightDOM = false}: QueryOptions = {},
): BabelPropertyDescriptor => ({
  configurable: true,
  get(this: C) {
    return callback(this.shadowRoot && !lightDOM ? this.shadowRoot : this);
  },
});

export const query = (
  selector: string,
  options?: QueryOptions,
): PropertyDecorator => () =>
  executeQuery(root => root.querySelector(selector), options);

export const queryAll = (
  selector: string,
  options?: QueryOptions,
): PropertyDecorator => () =>
  executeQuery(root => root.querySelectorAll(selector), options);
