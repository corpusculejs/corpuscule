const navigate = (path, contextData) => {
  const state = {data: contextData, path};
  history.pushState(state, '', path);
  dispatchEvent(new PopStateEvent('popstate', {state}));
};

export default navigate;
