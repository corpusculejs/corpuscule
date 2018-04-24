const Styles = (path: string) => (target: any) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = path;

  const promise = new Promise((resolve) => {
    link.onload = resolve as any;
  });

  const {connectedCallback: superConnectedCallback} = target.prototype;

  target.prototype.connectedCallback = async function connectedCallback(this: any): Promise<void> {
    const layout = document.createElement('div');
    this.__root.appendChild(link);
    this.__root.appendChild(layout);
    this.__root = layout;

    await promise;

    superConnectedCallback.call(this);
  };
};

export default Styles;
