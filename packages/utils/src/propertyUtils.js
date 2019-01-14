export const isPublic = property =>
  typeof property === 'number' || typeof property === 'string' || typeof property === 'symbol';

export const getValue = (self, property) =>
  isPublic(property) ? self[property] : property.get(self);

// eslint-disable-next-line no-return-assign
export const setValue = (self, property, value) =>
  isPublic(property) ? (self[property] = value) : property.set(self, value);

export const call = (self, property, ...args) =>
  isPublic(property) ? self[property](...args) : property.get(self).apply(self, args);

export const getName = property =>
  typeof property === 'string' || typeof property === 'number' ? property : property.description;
