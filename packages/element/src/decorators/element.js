import assertKind from "@corpuscule/utils/lib/assertKind";
import {unsafeStatic} from "../dhtml";

const element = name => ({kind, elements}) => {
  assertKind("element", "class", kind);

  const tag = unsafeStatic(name);

  return {
    elements: [
      ...elements.filter(({key}) => key !== "is"),
      {
        descriptor: {
          configurable: true,
          get() {
            return name;
          },
        },
        key: "is",
        kind: "method",
        placement: "static",
      },
      {
        descriptor: {
          configurable: true,
          get() {
            return tag;
          },
        },
        key: "tag",
        kind: "method",
        placement: "static",
      },
    ],
    finisher(target) {
      customElements.define(name, target);
    },
    kind,
  };
};

export default element;
