export const getName = property =>
  typeof property === 'symbol' ? property.description : property;
