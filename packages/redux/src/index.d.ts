/**
 * This module provides a [Redux](https://redux.js.org/) connector for web
 * components.
 *
 * @module @corpuscule/redux
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
 * A default version of the [@gearAdvanced]{@link @corpuscule/redux.gearAdvanced}
 * with the token already provided.
 */
export const gear: PropertyDecorator;

/**
 * A default version of the [@dispatcherAdvanced]{@link @corpuscule/redux.dispatcherAdvanced}
 * with the token already provided.
 */
export const dispatcher: PropertyDecorator;

/**
 * A default version of the [@isProviderAdvanced]{@link @corpuscule/redux.isProviderAdvanced}
 * with the token already provided.
 */
export function isProvider(target: unknown): boolean;

/**
 * A default version of the [@providerAdvanced]{@link @corpuscule/redux.providerAdvanced}
 * with the token already provided.
 */
export const provider: ClassDecorator;

/**
 * A default version of the [@reduxAdvanced]{@link @corpuscule/redux.reduxAdvanced}
 * with the token already provided.
 */
export const redux: ClassDecorator;

/**
 * A default version of the [@unitAdvanced]{@link @corpuscule/redux.unitAdvanced}
 * with the token already provided.
 */
export function unit<S>(getter: (state: S) => any): PropertyDecorator;

/**
 * Creates tokens to bind decorators with each other.
 */
export function createReduxToken(): Token;

/**
 * A decorator that converts a class method or field (with an action creator
 * assigned) to a redux [dispatcher](https://redux.js.org/api/store#dispatch).
 * Redux will dispatch everything the wrapped function returns.
 *
 * ### Example
 * ```typescript
 * const someExternalAction = (value: string) => ({
 *   type: 'SOME_EXTERNAL_ACTION',
 *   payload: value,
 * });
 *
 * @redux
 * class ReduxExample extends HTMLElement {
 *   @dispatch public fieldExample = someExternalAction;
 *
 *   private secretNumber: number = 10;
 *
 *   @dispatch
 *   public methodExample(value: number) {
 *     return {type: 'SOME_ACTION', payload: value + this.secretNumber};
 *   }
 * }
 * ```
 *
 * @param token a token issued by a [[createReduxToken]] function that connects
 * all decorators in a single working system.
 */
export function dispatcherAdvanced(token: Token): PropertyDecorator;

/**
 * A decorator that works as a [@value]{@link @corpuscule/context.value} for the
 * [@provider]{@link @corpuscule/redux.providerAdvanced}.
 */
export const gearAdvanced: typeof contextValue;

/**
 * Works as a [isProvider]{@link @corpuscule/context.isProvider} for the
 * [@provider]{@link @corpuscule/redux.providerAdvanced}.
 */
export const isProviderAdvanced: typeof isContextProvider;

/**
 * A decorator that works as a Redux store provider. See
 * [@provider]{@link @corpuscule/context.provider} for more information.
 */
export const providerAdvanced: typeof contextProvider;

/**
 * A decorator that makes a class declaration a Redux provider with a store as a
 * context value. The [@consumer]{@link @corpuscule/context.consumer} decorator
 * is used internally.
 *
 * @param token a token issued by a [[createReduxToken]] function that connects
 * all decorators in a single working system.
 */
export function reduxAdvanced(token: Token): ClassDecorator;

/**
 * A decorator that makes a class property a reflection for the specific store
 * value. Whenever the value is changed, the property receives an update as
 * well.
 *
 * ### Example
 * ```typescript
 * @redux
 * class ReduxExample extends HTMLElement {
 *   @unit(store => store.foo)
 *   public foo!: number;
 * }
 * ```
 *
 * @param token a token issued by a [[createReduxToken]] function that connects
 * all decorators in a single working system.
 *
 * @param getter a function that extracts the value to reflect from the store.
 */
export function unitAdvanced<S>(token: Token, getter: (state: S) => any): PropertyDecorator;
