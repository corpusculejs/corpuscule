const navigate = (path, contextData) => {
  const state = {data: contextData, path};
  history.pushState(state, null, path);
  dispatchEvent(new PopStateEvent('popstate', {state}));
};

export default navigate;
