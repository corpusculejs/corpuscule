const navigate = path => {
  history.pushState(path, null, path);
  dispatchEvent(new PopStateEvent('popstate', {state: history.state}));
};

export default navigate;
