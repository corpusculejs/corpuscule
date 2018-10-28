import useInitializer from "@corpuscule/utils/lib/useInitializer";
import {assertElementDecoratorsKindAndPlacement} from "../utils";
import {invalidate as $$invalidate} from "../tokens/internal";
import {propsChangedStage} from "../tokens/stages";
import {oldValueRegistry} from "../getOldValue";

const property = (guard = null) => ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement("property", kind, placement);

  const privateName = new WeakMap();
  const check = (value) => {
    if (guard && !guard(value)) {
      throw new TypeError(`Value applied to "${key}" has wrong type`);
    }
  };

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return privateName.get(this);
      },
      set(value) {
        check(value);

        const oldValue = privateName.get(this);

        if (value === oldValue) {
          return;
        }

        oldValueRegistry.get(this).set(key, oldValue);
        privateName.set(this, value);

        this[$$invalidate](propsChangedStage);
      },
    },
    extras: [
      useInitializer((instance) => {
        const value = initializer.call(instance);
        check(value);
        privateName.set(instance, value);
        oldValueRegistry.set(instance, new Map([[key, undefined]]));
      }),
    ],
    key,
    kind: "method",
    placement: "prototype",
  };
};

export default property;
