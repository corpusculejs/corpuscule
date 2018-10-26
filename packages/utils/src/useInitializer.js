const useInitializer = initializer => ({
  descriptor: {},
  initializer() {
    initializer(this);

    return undefined;
  },
  key: Symbol("initializer"),
  kind: "field",
  placement: "own",
});

export default useInitializer;
