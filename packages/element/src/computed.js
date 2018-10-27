import assertKind from "@corpuscule/utils/lib/assertKind";
import useInitializer from "@corpuscule/utils/lib/useInitializer";

const createComputingPair = () => {
  const cache = new WeakMap();
  const dirty = Symbol("dirty");

  const computed = ({
    descriptor: {get},
    key,
    kind,
    placement,
  }) => {
    assertKind("computed", "getter", kind, !!get);

    return {
      descriptor: {
        configurable: true,
        get() {
          const cachedValue = cache.get(this);

          if (cachedValue === dirty) {
            const newValue = get.call(this);
            cache.set(this, newValue);

            return newValue;
          }

          return cachedValue;
        },
      },
      key,
      kind,
      placement,
    };
  };

  const observe = ({
    descriptor: {get: previousGet, set: previousSet},
    key,
    kind,
    initializer,
    placement,
  }) => {
    const isMethod = kind === "method";

    assertKind(
      "observe",
      "field or accessor",
      kind,
      // eslint-disable-next-line no-extra-parens
      kind === "field" || (isMethod && (previousGet || previousSet))
    );

    let descriptor = {
      configurable: true,
      enumerable: true,
    };

    let initializerDescriptor;

    if (isMethod) {
      descriptor = {
        ...descriptor,
        get: previousGet,
        set(value) {
          previousSet.call(this, value);
          cache.set(this, dirty);
        },
      };

      initializerDescriptor = useInitializer((instance) => {
        cache.set(instance, dirty);
      }, placement === "static");
    } else {
      const privateName = new WeakMap();

      descriptor = {
        ...descriptor,
        get() {
          return privateName.get(this);
        },
        set(value) {
          privateName.set(this, value);
          cache.set(this, dirty);
        },
      };

      initializerDescriptor = useInitializer((instance) => {
        privateName.set(instance, initializer.call(instance));
        cache.set(instance, dirty);
      }, placement === "static");
    }

    return {
      descriptor,
      extras: [initializerDescriptor],
      key,
      kind: "method",
      placement: placement === "own" ? "prototype" : placement,
    };
  };

  return {computed, observe};
};

export default createComputingPair;
