/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @source https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/shallowEqual.js
 */

const has = Object.prototype.hasOwnProperty;

const shallowEqual = (objA, objB) => {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== "object" || objA === null
    || typeof objB !== "object" || objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !has.call(objB, keysA[i])
      || !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
};

export default shallowEqual;
