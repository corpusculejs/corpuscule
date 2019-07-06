/**
 * This module provides an interface to create a context for web components.
 *
 * The context is a technique to share some data between one parent component
 * and its multiple descendants, no matter how deeply nested they are. This
 * approach reduces the complexity of the application because you no longer
 * need to send necessary properties through all the component chain up to the
 * desired descendant.
 *
 * ## How it works
 * The implementation of the context in this module works on an idea of [token
 * access]{@link Token}. All you need to send a token created with the
 * [[createContextToken]] function to decorators you would like to link.
 *
 * The module provides three decorators: [@provider]{@link provider},
 * [@consumer]{@link consumer} and [@value]{@link value}. When you apply
 * [@provider]{@link provider} decorator to a component, it gets an ability to
 * send the value of its field marked with [@value]{@link value} decorator down
 * the DOM branch. Component marked with [@consumer]{@link consumer} decorator
 * can receive this value in its field marked with [@value]{@link value} during
 * connection stage if it is a descendant of a provider component.
 *
 * You also can:
 * * Use multiple contexts for a single DOM tree branch.
 * * Use single context for multiple DOM tree branches.
 *
 * What does it mean? Let's imagine that we have two contexts, `A` and `B`
 * and two components that provide contexts down to the DOM tree, e.g.,
 * `a-provider` and `b-provider`. Then you make `b-provider` a child of an
 * `a-provider` and add a couple of components as children of `b-provider`.
 * These components now can receive both `A` and `B` contexts if you make
 * them consumers for these contexts.
 *
 * Schema for this idea is following:
 * ```
 * <!-- first branch -->
 * <a-provider>                               | A
 *   <b-provider>                             |    | B
 *     <my-component-1>                       |    |
 *       <my-component-2></my-component-2>    V    V
 *     </my-component-1>
 *   </b-provider>
 * </a-provider>
 * <!-- second branch -->
 * <a-provider-2>                             | A
 *   <my-component-1>                         |
 *     <my-component-2></my-component-2>      V
 *   </my-component-1>
 * </a-provider>
 * ```
 *
 * @note You can link one [@provider]{@link provider} with only one
 * [@consumer]{@link consumer}.
 * @advice To avoid sending token again and again you can create wrapping
 * decorators for the single token.
 *
 * ## Example
 * ```html
 * <script type="module">
 *   import {createContextToken, consumer, provider, value} from '@corpuscule/context';
 *
 *   const token = createContextToken();
 *
 *   @provider(token)
 *   class Provider extends HTMLElement {
 *     @value(token) providingValue = 10;
 *   }
 *
 *   @consumer(token)
 *   class Consumer extends HTMLElement {
 *     @value(token) contextValue;
 *   }
 *
 *   customElement.define('my-provider', Provider);
 *   customElement.define('my-consumer', Consumer);
 *
 *   customElement.whenDefined('my-consumer').then(() => {
 *     const consumer = document.querySelector('my-consumer');
 *     assert(consumer.contextValue === 10);
 *   });
 * </script>
 *
 * <my-provider>
 *   <my-consumer></my-consumer>
 * </my-provider>
 * ```
 *
 * @module @corpuscule/context
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

import {Token} from '@corpuscule/utils/lib/tokenRegistry';

/**
 * Creates tokens to bind decorators between each other.
 */
export function createContextToken(): Token;

/**
 * A decorator that makes the class declaration the context consumer. Now the
 * property of the class declaration marked with the [@value]{@link value}
 * becomes able to receive the shared date sent by a provider.
 *
 * @param token a token created by [[createContextToken]] function.
 */
export function consumer(token: Token): ClassDecorator;

/**
 * Detects if the class declaration plays the provider role in the context
 * system.
 *
 * @note If you use the wrong token result will be negative even if the class
 * declaration is the actual provider.
 *
 * @param token a token created by [[createContextToken]] function and sent to
 * the [@provider]{@link provider} decorator applied to the class declaration.
 *
 * @param klass a class declaration to check.
 */
export function isProvider(token: Token, klass: unknown): boolean;

/**
 * A decorator that makes the class declaration the context provider. Now the
 * property of the class declaration marked with the [@value]{@link value}
 * becomes able to send the shared data down the DOM branch to consumers.
 *
 * @param token a token created by [[createContextToken]] function.
 *
 * @param defaultValue if the [@value]{@link value} property is undefined,
 * this value will be sent instead.
 */
export function provider(token: Token, defaultValue?: unknown): ClassDecorator;

/**
 * A service decorator that makes class property able to send or receive
 * (depending on the class-level decorator) the shared data. Each provider and
 * consumer requires to have one property marked with this decorator.
 *
 * @param token a token created by [[createContextToken]] function. It should
 * be the same for this decorator and the class-level one.
 */
export function value(token: Token): PropertyDecorator;
