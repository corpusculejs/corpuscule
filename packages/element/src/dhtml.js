/* eslint-disable max-depth */

import {html} from "lit-html";

const registry = new Map();

export class UnsafeStatic {
  constructor(value) {
    this.value = value;
  }
}

export const unsafeStatic = value => new UnsafeStatic(value);

const isElementOrUnsafeStatic = value => typeof value.is === "string" || value instanceof UnsafeStatic;

const dhtml = (strings, ...values) => {
  const record = registry.get(strings);

  let recordStrings;
  let valueIndexesToFilter;

  if (!record) {
    valueIndexesToFilter = [];

    if (values.some(isElementOrUnsafeStatic)) {
      recordStrings = [];

      let previousValueWasStatic = false;

      for (let i = 0; i < strings.length; i++) {
        if (previousValueWasStatic) {
          recordStrings[recordStrings.length - 1] += strings[i];
        } else {
          recordStrings.push(strings[i]);
        }

        if (i < strings.length - 1 && isElementOrUnsafeStatic(values[i])) {
          recordStrings[recordStrings.length - 1] += values[i].is || String(values[i].value);
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
