const executeQuery = (callback, {lightDOM = false} = {}) => ({
  configurable: true,
  get() {
    return callback(this.shadowRoot && !lightDOM ? this.shadowRoot : this);
  },
});

export const query = (selector, options) => () =>
  executeQuery(root => root.querySelector(selector), options);
export const queryAll = (selector, options) => () =>
  executeQuery(root => root.querySelectorAll(selector), options);
