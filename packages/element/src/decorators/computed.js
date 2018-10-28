import assertKind from "@corpuscule/utils/lib/assertKind";
import useInitializer from "@corpuscule/utils/lib/useInitializer";

const createComputingPair = () => {
  const cache = new WeakMap();
  const dirty = Symbol("dirty");

  const computed = deriver => ({
    descriptor: {get: previousGet, set: previousSet},
    initializer,
    key,
    kind,
    placement,
  }) => {
    let getCallback;
    let set;
    let initializerCallback;

    if (deriver) {
      const isMethod = kind === "method";

      assertKind(
        "computed",
        "field or accessor",
        kind,
        // eslint-disable-next-line no-extra-parens
        kind === "field" || (isMethod && (previousGet && previousSet)),
      );

      let setCallback;

      if (isMethod) {
        getCallback = instance => deriver(previousGet.call(instance));
        setCallback = (instance, value) => previousSet.call(instance, value);
      } else {
        const privateName = new WeakMap();

        getCallback = instance => deriver(privateName.get(instance));
        setCallback = (instance, value) => privateName.set(instance, value);

        initializerCallback = (instance) => {
          privateName.set(instance, initializer.call(instance));
        };
      }

      /* eslint-disable no-shadow, no-invalid-this */
      set = function set(value) {
        setCallback(this, value);
        cache.set(this, dirty);
      };
      /* eslint-enable no-shadow, no-invalid-this */
    } else {
      assertKind("computed", "getter", kind, previousGet && !previousSet);
      getCallback = instance => previousGet.call(instance);
    }

    return {
      descriptor: {
        configurable: true,
        enumerable: true,
        get() {
          let value = cache.get(this);

          if (value === dirty) {
            value = getCallback(this);
            cache.set(this, value);
          }

          return value;
        },
        set,
      },
      extras: initializerCallback ? [
        useInitializer(initializerCallback, placement === "static"),
      ] : undefined,
      key,
      kind,
      placement,
    };
  };

  const observer = ({
    descriptor: {get: previousGet, set: previousSet},
    key,
    kind,
    initializer,
    placement,
  }) => {
    const isMethod = kind === "method";

    assertKind(
      "observer",
      "field or accessor",
      kind,
      // eslint-disable-next-line no-extra-parens
      kind === "field" || (isMethod && (previousGet || previousSet))
    );

    let get;
    let set;
    let initializerCallback;

    if (isMethod) {
      get = previousGet;
      set = previousSet;

      initializerCallback = (instance) => {
        cache.set(instance, dirty);
      };
    } else {
      const privateName = new WeakMap();

      /* eslint-disable no-shadow, no-invalid-this */
      get = function get() {
        return privateName.get(this);
      };

      set = function set(value) {
        privateName.set(this, value);
      };
      /* eslint-enable no-shadow, no-invalid-this */

      initializerCallback = (instance) => {
        privateName.set(instance, initializer.call(instance));
        cache.set(instance, dirty);
      };
    }

    return {
      descriptor: {
        configurable: true,
        enumerable: true,
        get,
        set(value) {
          set.call(this, value);
          cache.set(this, dirty);
        },
      },
      extras: [
        useInitializer(initializerCallback, placement === "static"),
      ],
      key,
      kind: "method",
      placement: placement === "own" ? "prototype" : placement,
    };
  };

  return {computed, observer};
};

export default createComputingPair;
