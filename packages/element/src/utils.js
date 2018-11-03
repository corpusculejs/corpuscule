export const defaultPropertyOptions = {pure: true};

export const parseAttributeValue = (value, guard) => {
  switch (guard) {
    case Boolean:
      return value !== null;
    case Number:
      return Number(value);
    default:
      return String(value);
  }
};

export const toAttribute = (instance, attributeName, value) => {
  if (typeof value === 'boolean') {
    if (value) {
      instance.setAttribute(attributeName, '');
    } else {
      instance.removeAttribute(attributeName);
    }
  } else {
    instance.setAttribute(attributeName, value.toString());
  }
};

export const assertElementDecoratorsKindAndPlacement = (decoratorName, kind, placement) => {
  if (kind !== 'field') {
    throw new TypeError(
      `@${decoratorName} can be applied only to field, not to ${kind}. `
      + `Also @${decoratorName} expected to be the first executed decorator, so pay attention `
      + 'to an order of your decorators',
    );
  }

  if (placement !== 'own') {
    throw new TypeError(
      `@${decoratorName} can only be applied to an instance field, `
      + `it is unusable with ${placement}`,
    );
  }
};
