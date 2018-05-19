export interface Constructor<T> {
  new (...args: any[]): T; // tslint:disable-line:readonly-array
}

export const registerAndMount = <T extends HTMLElement>(
  name: string,
  element: Constructor<T>,
  beforeMount: (el: T) => void = () => void 0,
): T => {
  customElements.define(name, element);

  return mount(name, beforeMount);
};

export const mount = <T extends HTMLElement>(
  name: string,
  beforeMount: (el: T) => void = () => void 0,
): T => {
  const el = document.createElement(name) as T;
  beforeMount(el);
  document.body.appendChild(el);

  return el;
};
