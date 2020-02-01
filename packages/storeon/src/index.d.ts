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
import {Token} from '@corpuscule/utils/lib/tokenRegistry';

/**
 * A default version of the [@gearAdvanced]{@link @corpuscule/storeon.gearAdvanced}
 * with the token already provided.
 */
export const gear: PropertyDecorator;

/**
 * A default version of the [@dispatcherAdvanced]{@link @corpuscule/storeon.dispatcherAdvanced}
 * with the token already provided.
 */
export function dispatcher(eventName?: PropertyKey): PropertyDecorator;

/**
 * A default version of the [@isProviderAdvanced]{@link @corpuscule/storeon.isProviderAdvanced}
 * with the token already provided.
 */
export function isProvider(klass: unknown): boolean;

/**
 * A default version of the [@providerAdvanced]{@link @corpuscule/storeon.providerAdvanced}
 * with the token already provided.
 */
export const provider: ClassDecorator;

/**
 * A default version of the [@storeonAdvanced]{@link @corpuscule/storeon.storeonAdvanced}
 * with the token already provided.
 */
export const storeon: ClassDecorator;

/**
 * A default version of the [@storeonAdvanced]{@link @corpuscule/storeon.storeonAdvanced}
 * with the token already provided.
 */
export function unit<S extends object>(storeKey: keyof S): PropertyDecorator;

/**
 * Creates tokens to bind decorators with each other.
 */
export function createStoreonToken(): Token;

/**
 * A decorator that converts a class method or field to a storeon dispatcher.
 * There are three possible types of the dispatcher.
 *
 * ### Full dispatcher
 * Literally, it is a `storeon.dispatch` method bound to a class property. To
 * get it, omit the `eventKey` parameter while applying the decorator to a class
 * field.
 *
 * Signature of the resulting method is the following:
 * ```typescript
 * method(eventKey: PropertyKey, data: unknown): void;
 * ```
 *
 * #### Example
 * ```typescript
 * @storeon
 * class StoreonComponent extends HTMLElement {
 *   @dispatcher() dispatch!: (eventKey: PropertyKey, data: number) => void ;
 *
 *   run(): void {
 *     this.dispatch('inc', 10);
 *   }
 * }
 * ```
 *
 * ### Specified dispatcher
 * It is a curried version of the `storeon.dispatch` with the predefined
 * `eventKey`. To get it, send the `eventKey` parameter while applying the
 * decorator to a class field.
 *
 * Signature of the resulting method is the following:
 * ```typescript
 * method(data: unknown): void;
 * ```
 *
 * #### Example
 * ```typescript
 * @storeon
 * class StoreonComponent extends HTMLElement {
 *   @dispatcher('inc') increase!: (data: number) => void;
 *
 *   run() {
 *     this.increase(10);
 *   }
 * }
 * ```
 *
 * ### Dispatcher-computer
 * This kind of dispatcher calculates its value before dispatching and then acts
 * like a [specified dispatcher](#specified-dispatcher). To get it, apply the
 * decorator with provided `eventKey` parameter to a method. The result the
 * method returns will be dispatched.
 *
 * #### Example
 * ```typescript
 * @storeon
 * class StoreonComponent extends HTMLElement {
 *   @dispatcher('inc')
 *   increase(num1: number, num2: number): number {
 *     return num1 * num2;
 *   }
 *
 *   run(): void {
 *     this.increase(10, 10);
 *   }
 * }
 * ```
 *
 * @param token a token issued by a [[createStoreonToken]] function that
 * connects all decorators in a single working system.
 *
 * @param eventName a name of the event this dispatcher will trigger on call.
 */
export function dispatcherAdvanced(
  token: Token,
  eventName?: PropertyKey,
): PropertyDecorator;

/**
 * A decorator that works as a [@value]{@link @corpuscule/context.value} for the
 * [@provider]{@link @corpuscule/storeon.providerAdvanced}.
 */
export const gearAdvanced: typeof contextValue;

/**
 * Works as a [isProvider]{@link @corpuscule/context.isProvider} for the
 * [@provider]{@link @corpuscule/storeon.providerAdvanced}.
 */
export const isProviderAdvanced: typeof isContextProvider;

/**
 * A decorator that creates a Storeon store provider. See [@provider]{@link @corpuscule/context.provider}
 * for more information.
 */
export const providerAdvanced: typeof contextProvider;

/**
 * A decorator that makes a class declaration a Storeon provider with a store as
 * a context value. The [@consumer]{@link @corpuscule/context.consumer}
 * decorator is used internally.
 *
 * @note Do not use the [@gear]{@link @corpuscule/storeon.gearAdvanced}
 * decorator for fields of the class declaration marked with this decorator. It
 * will cause an error.
 *
 * @param token a token issued by a [[createStoreonToken]] function that
 * connects all decorators in a single working system.
 */
export function storeonAdvanced(token: Token): ClassDecorator;

/**
 * A decorator that makes a class property a reflection for the specific store
 * value. Whenever the value is changed, the property receives an update as
 * well.
 *
 * ### Example
 * ```typescript
 * @storeon
 * class StoreonComponent extends HTMLElement {
 *   @unit('count') count!: number;
 * }
 * ```
 *
 * @param token a token issued by a [[createStoreonToken]] function that
 * connects all decorators in a single working system.
 *
 * @param storeKey a key to extract a value to reflect from the store.
 */
export function unitAdvanced<S extends object>(
  token: Token,
  storeKey: keyof S,
): PropertyDecorator;
