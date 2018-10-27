const useInitializer = (initializer, shouldPlacementBeStatic = false) => ({
  descriptor: {},
  initializer() {
    initializer(this);

    return undefined;
  },
  key: Symbol("initializer"),
  kind: "field",
  placement: shouldPlacementBeStatic ? "static" : "own",
});

export default useInitializer;
