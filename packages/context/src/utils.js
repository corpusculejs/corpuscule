export const checkValue = (value, target) => {
  if (!value.has(target)) {
    throw new Error(`No ${target.name} field is marked with @value`);
  }
};
