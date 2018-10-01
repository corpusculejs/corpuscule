import assertKind from "@corpuscule/utils/lib/assertKind";

const createComputingEntanglement = () => {
  const registry = new WeakMap();
  const observables = [];

  const computed = ({
    descriptor: {get},
    key,
    kind,
    placement,
  }) => {
    assertKind("computed", "getter", kind, !get);

    return {
      descriptor: {
        configurable: true,
        get() {
          let record = registry.get(this);

          if (!record) {
            record = {
              cache: new Map(observables.map(property => [property, null])),
              value: null,
            };

            registry.set(this, record);
          }

          let isValueUpdated = false;

          for (const [watchingProperty, oldValue] of record.cache) {
            const newValue = this[watchingProperty];

            if (newValue !== oldValue) {
              if (!isValueUpdated) {
                record.value = get.call(this);
                isValueUpdated = true;
              }

              record.cache.set(watchingProperty, newValue);
            }
          }

          return record.value;
        },
      },
      key,
      kind,
      placement,
    };
  };

  const observe = (descriptor) => {
    const {key, kind} = descriptor;
    assertKind("observe", "field or method", kind, kind !== "field" && kind !== "method");

    observables.push(key);

    return descriptor;
  };

  return {computed, observe};
};

export default createComputingEntanglement;
