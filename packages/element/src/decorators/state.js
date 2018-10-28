import useInitializer from "@corpuscule/utils/lib/useInitializer";
import {assertElementDecoratorsKindAndPlacement} from "../utils";
import {invalidate as $$invalidate} from "../tokens/internal";
import {stateChangedStage} from "../tokens/stages";
import {oldValueRegistry} from "../getOldValue";

const state = ({
  initializer,
  key,
  kind,
  placement,
}) => {
  assertElementDecoratorsKindAndPlacement("state", kind, placement);

  const privateName = new WeakMap();

  return {
    descriptor: {
      configurable: true,
      enumerable: true,
      get() {
        return privateName.get(this);
      },
      set(value) {
        oldValueRegistry.get(this).set(key, privateName.get(this));
        privateName.set(this, value);
        this[$$invalidate](stateChangedStage);
      },
    },
    extras: [
      useInitializer((instance) => {
        privateName.set(instance, initializer.call(instance));
        oldValueRegistry.set(instance, new Map([[key, undefined]]));
      }),
    ],
    key,
    kind: "method",
    placement: "prototype",
  };
};

export default state;
