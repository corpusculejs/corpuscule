/* eslint-disable max-depth */
import {html} from "lit-html";

export class UnsafeStatic {
  constructor(value) {
    this.value = value;
  }
}

export const unsafeStatic = value => new UnsafeStatic(value);

const registry = new WeakMap();

const isUnsafeStatic = value => value instanceof UnsafeStatic;

const dhtml = (strings, ...values) => {
  let record = registry.get(strings);

  if (!record) {
    if (values.some(isUnsafeStatic)) {
      record = [];

      let previousValueWasStatic = false;

      for (let i = 0; i < strings.length; i++) {
        if (previousValueWasStatic) {
          record[record.length - 1] += strings[i];
        } else {
          record.push(strings[i]);
        }

        if (i < strings.length - 1 && isUnsafeStatic(values[i])) {
          record[record.length - 1] += String(values[i].value);
          previousValueWasStatic = true;
        } else {
          previousValueWasStatic = false;
        }
      }
    } else {
      record = strings;
    }

    registry.set(strings, record);
  }

  return html(
    record,
    ...record !== strings
      ? values.filter(value => !isUnsafeStatic(value))
      : values,
  );
};

export default dhtml;
