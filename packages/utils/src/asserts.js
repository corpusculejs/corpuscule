/* eslint-disable no-bitwise, capitalized-comments */
import {getName} from './propertyUtils';

const Field = 1;
const Accessor = 2;
const Method = 4;
const Getter = 8;
const Setter = 16;
const Class = 32;

const Own = 1;
const Prototype = 2;
const Static = 4;

export const Kinds = {
  Accessor,
  Class,
  Field,
  Getter,
  Method,
  Setter,
};

export const Placements = {
  Own,
  Prototype,
  Static,
};

const stringifyAllowed = (mask, enumeration) => {
  const result = Object.entries(enumeration).reduce((arr, [kind, value]) => {
    if ((mask & value) === value) {
      arr.push(kind.toLowerCase());
    }

    return arr;
  }, []);

  return result.length > 1 ? `${result.slice(0, -1).join(',')} or ${result.slice(-1)}` : result[0];
};

// eslint-disable-next-line complexity
export const assertKind = (
  decoratorName,
  allowed,
  {descriptor: {get, set, value} = {}, key, kind},
) => {
  if (
    !(
      ((allowed & Field) === Field && kind === 'field') ||
      ((allowed & Accessor) === Accessor && kind === 'method' && get && set) ||
      ((allowed & Method) === Method && kind === 'method' && value) ||
      ((allowed & Getter) === Getter && kind === 'method' && get && !set) ||
      ((allowed & Setter) === Setter && kind === 'method' && !get && set) ||
      ((allowed & Class) === Class && kind === 'class')
    )
  ) {
    throw new TypeError(
      `@${decoratorName} cannot be applied to ${
        kind === 'class' ? 'class' : getName(key)
      }: it is not ${stringifyAllowed(allowed, Kinds)}`,
    );
  }
};

export const assertPlacement = (decoratorName, allowed, {key, placement}) => {
  if (
    !(
      ((allowed & Own) === Own && placement === 'own') ||
      ((allowed & Prototype) === Prototype && placement === 'prototype') ||
      ((allowed & Static) === Static && placement === 'static')
    )
  ) {
    throw new TypeError(
      `@${decoratorName} cannot be applied to ${getName(key)}: it is not ${stringifyAllowed(
        allowed,
        Placements,
      )} class element`,
    );
  }
};

export const assertRequiredProperty = (...args) => {
  let decoratorName;
  let markerName;
  let propertyName = 'any';
  let property;

  if (args.length === 3) {
    [decoratorName, markerName, property] = args;
  } else {
    [decoratorName, markerName, propertyName, property] = args;
  }

  if (property === undefined) {
    throw new Error(
      `@${decoratorName} requires ${propertyName} property marked with @${markerName}`,
    );
  }
};
