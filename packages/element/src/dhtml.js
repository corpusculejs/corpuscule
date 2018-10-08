/* eslint-disable max-depth */
import {html} from "lit-html";

export class UnsafeStatic {
  constructor(value) {
    this.value = value;
  }
}

export const unsafeStatic = value => new UnsafeStatic(value);

const registry = new WeakMap();

const dhtml = (strings, ...values) => {
  const record = registry.get(strings);

  let recordStrings;
  let valueIndexesToFilter;

  if (!record) {
    valueIndexesToFilter = [];

    if (values.some(value => value instanceof UnsafeStatic)) {
      recordStrings = [];

      let previousValueWasStatic = false;

      for (let i = 0; i < strings.length; i++) {
        if (previousValueWasStatic) {
          recordStrings[recordStrings.length - 1] += strings[i];
        } else {
          recordStrings.push(strings[i]);
        }

        if (i < strings.length - 1 && values[i] instanceof UnsafeStatic) {
          recordStrings[recordStrings.length - 1] += String(values[i].value);
          valueIndexesToFilter.push(i);
          previousValueWasStatic = true;
        } else {
          previousValueWasStatic = false;
        }
      }
    } else {
      recordStrings = strings;
    }

    registry.set(strings, [recordStrings, valueIndexesToFilter]);
  } else {
    [recordStrings, valueIndexesToFilter] = record;
  }

  return html(
    recordStrings,
    ...valueIndexesToFilter.length > 0
      ? values.filter((_, i) => !valueIndexesToFilter.includes(i))
      : values,
  );
};

export default dhtml;
