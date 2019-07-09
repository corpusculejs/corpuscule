/**
 * This module provides a [Storeon](https://github.com/storeon/storeon)
 * connector for web components.
 *
 * @module @corpuscule/storeon
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

import {
  isProvider as isContextProvider,
  provider as contextProvider,
  value as contextValue,
} from '@corpuscule/context';
import {Token, TokenCreator} from '@corpuscule/utils/lib/tokenRegistry';

export const gear: PropertyDecorator;
export function dispatcher(eventKey?: PropertyKey): PropertyDecorator;
export function isProvider(klass: unknown): boolean;
export const provider: ClassDecorator;
export const storeon: ClassDecorator;
export function unit<S extends object>(storeKey: keyof S): PropertyDecorator;

export const createStoreonToken: TokenCreator;

export function dispatcherAdvanced(token: Token): PropertyDecorator;
export const gearAdvanced: typeof contextValue;
export const isProviderAdvanced: typeof isContextProvider;
export const providerAdvanced: typeof contextProvider;
export function storeonAdvanced(token: Token): ClassDecorator;
export function unitAdvanced<S extends object>(token: Token, storeKey: keyof S): PropertyDecorator;
