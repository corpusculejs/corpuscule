import assertKind from '@corpuscule/utils/lib/assertKind';

export const corpusculeElements = new WeakSet();

const element = name => ({kind, elements}) => {
  assertKind('element', 'class', kind);

  return {
    elements: [
      ...elements.filter(({key}) => key !== 'is'),
      {
        descriptor: {
          configurable: true,
          enumerable: true,
          get() {
            return name;
          },
        },
        key: 'is',
        kind: 'method',
        placement: 'static',
      },
    ],
    finisher(target) {
      customElements.define(name, target);
      corpusculeElements.add(target);
    },
    kind,
  };
};

export default element;
