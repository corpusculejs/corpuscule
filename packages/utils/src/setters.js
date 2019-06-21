export const setArray = (store, key, array) => {
  if (store.has(key)) {
    store.get(key).push(...array);
  } else {
    store.set(key, array);
  }
};

export const setObject = (store, key, object) => {
  if (store.has(key)) {
    Object.assign(store.get(key), object);
  } else {
    store.set(key, object);
  }
};
