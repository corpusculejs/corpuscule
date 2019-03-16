const customElementNameRegistry = new WeakMap();

const define = customElements.define;

// Monkey-patch the customElements registry to allow using "withCustomElement"
// with any CustomElement used in the project
customElements.define = function(name, constructor, options) {
  define.call(this, name, constructor, options);
  customElementNameRegistry.set(constructor, name);
};

export default customElementNameRegistry;
