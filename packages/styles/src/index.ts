const Styles = (path: string) => (target: any) => {
  const {connectedCallback: superConnectedCallback} = target.prototype;

  target.prototype.connectedCallback = async function connectedCallback(this: any): Promise<void> {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = path;

    const promise = new Promise<void>((resolve) => {
      link.onload = resolve as any;
    });

    const layout = document.createElement('div');
    this.__root.appendChild(link);
    this.__root.appendChild(layout);
    this.__root = layout;

    await promise;

    superConnectedCallback.call(this);
  };
};

export default Styles;
