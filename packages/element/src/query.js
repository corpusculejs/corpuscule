const executeQuery = callback => ({
  configurable: true,
  get() {
    return callback(this.shadowRoot || this);
  },
});

export const query = selector => () => executeQuery(root => root.querySelector(selector));
export const queryAll = selector => () => executeQuery(root => root.querySelectorAll(selector));
