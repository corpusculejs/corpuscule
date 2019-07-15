/**
 * This module provides tools to define web components in a declarative way.
 *
 * ## How it works
 * By default, web components are too low-level to define them directly. They
 * require too much boilerplate to create and support. This module provides
 * special decorators that allow setting main parts of web components in the
 * most declarative way possible. These decorators combined, create a component
 * system that works together and is easy to interact with.
 *
 * There are the following decorators that makes the system work:
 * * [@attribute]{@link attribute},
 * * [@property]{@link property},
 * * [@internal]{@link internal},
 *
 * ## Element Lifecycle
 * Each custom element marked with an [@element]{@link element} decorator has
 * the following lifecycle (including standard JS class and custom element
 * lifecycle).
 *
 * @note A rendering system is able to wait until multiple properties are set
 * synchronously; only then the single rendering will be performed. However, be
 * careful with the asynchronous setting: it may cause re-rendering on each
 * assignment.
 *
 * | Name                        | Hook Type      | Stage      | Description                                                                                                                                                                                                                                        |
 * |-----------------------------|----------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
 * | constructor                 | JS Class       | Creation   | Since DOM element can be created with the `document.createElement` method, this hook is separate.                                                                                                                                                  |
 * | connectedCallback           | Custom Element | Connecting | This callback is invoked whenever the element is connected to the DOM. During the connection, Corpuscule performs the initial rendering, and then user-defined `connectedCallback` is fired. Can be invoked multiple times for the single element. |
 * | disconnectedCallback        | Custom Element | Connecting | This callback is invoked after the element is disconnected from DOM. Since there is nothing for Corpuscule to do at this time, user-defined `disconnectedCallback` will be invoked directly. Can be invoked multiple times for the single element. |
 * | attributeChangedCallback    | Custom Element | Update     | This callback is invoked each time the [attribute](#attribute-property) property is changed. The method receives a string name of the changed property, its old and new value (in a string form).                                                  |
 * | [[propertyChangedCallback]] | Corpuscule     | Update     | see the description by the link.                                                                                                                                                                                                                   |
 * | [[internalChangedCallback]] | Corpuscule     | Update     | see the description by the link.                                                                                                                                                                                                                   |
 * | [[updatedCallback]]         | Corpuscule     | Update     | see the description by the link.                                                                                                                                                                                                                   |
 * | [[render]]                  | Corpuscule     | Rendering  | see the description by the link.                                                                                                                                                                                                                   |
 *
 * @module @corpuscule/element
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

import {Token} from '@corpuscule/utils/lib/tokenRegistry';

/**
 * This interface is not necessary to be implemented because it covers only the
 * one case when all your properties are string and you do not plan to use
 * specific property names.
 */
export interface ElementGears {
  /**
   * A method that is invoked when an [internal]{@link @corpuscule/element.internal}
   * property is assigned. The behavior is identical to
   * `attributeChangedCallback`. It does trigger an update each time it is
   * invoked.
   *
   * @param propertyName a property name (either string or symbolic).
   * @param oldValue a value of the property that was before the update started.
   * @param newValue a new value to set to the property.
   */
  internalChangedCallback?(propertyName: PropertyKey, oldValue: unknown, newValue: unknown): void;

  /**
   * A method that is invoked when a [regular]{@link @corpuscule/element.property}
   * property is assigned. The behavior is identical to
   * `attributeChangedCallback`. It does not trigger a re-rendering if the
   * `oldValue` is equal to `newValue` (by the strict equality check `===`).
   *
   * @param propertyName a property name (either string or symbolic).
   * @param oldValue a value of the property that was before the update started.
   * @param newValue a new value to set to the property.
   */
  propertyChangedCallback?(propertyName: PropertyKey, oldValue: unknown, newValue: unknown): void;

  /**
   * A method that is invoked each time any of the component properties (either
   * [attribute]{@link @corpuscule/element.attribute}, [regular]{@link @corpuscule/element.property}
   * or [internal]{@link @corpuscule/element.internal}) causes re-rendering. The
   * method work synchronously; returned result of its work will be handled by a
   * [renderer]{@link ElementDecoratorOptions.renderer} function.
   *
   * If you do not define this method, rendering won't ever happen on your
   * element.
   */
  render?(): unknown;

  /**
   * A method that is invoked each time the rendering is over and the component
   * acquires the new state. This method is not called during the initial render
   * (`connectedCallback` is invoked instead).
   */
  updatedCallback?(): void;
}

export interface ElementDecoratorOptions {
  /**
   * This option allows constructing the [Customized built-in
   * element](https://developers.google.com/web/fundamentals/web-components/customelements#extendhtml).
   * Customized built-in elements differ from regular custom elements in many
   * ways. E.g., many native elements cannot be extended by creating Shadow
   * Root on them; by default, LightDOM will be created for these elements.
   *
   * To create a customized built-in element, you also have to extend a proper
   * class (e.g. `HTMLAnchorElement` for `<a>`).
   *
   * @note Do not forget that using a customized built-in element requires a
   * polyfill for Safari that does not support this part of the specification.
   *
   * ```typescript
   * @element('my-anchor', {extends: 'a'})
   * class MyAnchor extends HTMLAnchorElement {}
   * ```
   *
   * ### List of native elements allowed to create the Shadow Root
   * * `<article>`
   * * `<aside>`
   * * `<blockquote>`
   * * `<body>`
   * * `<div>`
   * * `<footer>`
   * * `<header>`
   * * `<main>`
   * * `<nav>`
   * * `<p>`
   * * `<section>`
   * * `<span>`
   */
  readonly extends?: keyof HTMLElementTagNameMap;

  /**
   * If this option is enabled, the [Light
   * DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom#lightdom)
   * will be used instead of the Shadow DOM; a result of the [[render]]
   * function will be written directly to the element.
   *
   * @warning Be careful, rendering to the Light DOM will erase any existing
   * markup and make setting it from the outside buggy.
   *
   * @note This option is enabled automatically if Shadow Root is not allowed
   * for this element. See [extends]{@link ElementDecoratorOptions.extends}
   * option.
   */
  readonly lightDOM?: boolean;

  /**
   * This option defines the rendering function that applies result returned
   * from the [[render]] function to the component body.
   *
   * If you omit this property, rendering won't ever happen on your element.
   *
   * @param renderingResult a result returned by a [[render]] function.
   *
   * @param container a component root to which result should be applied. It
   * can be either the component shadow root or a component itself if the
   * [lightDOM]{@link ElementDecoratorOptions.lightDOM} is enabled.
   *
   * @param context a component instance; it can be used in specific cases like
   * setting the [eventContext](https://lit-html.polymer-project.org/api/interfaces/lit_html.renderoptions.html#eventcontext)
   * of lit-html.
   */
  renderer?(
    renderingResult: unknown,
    container: Element | DocumentFragment,
    context: unknown,
  ): void;

  /**
   * This option defines the function that schedules the rendering process.
   * Since each component renders independently and synchronously, it requires
   * a scheduling system to run the update at the right time and not freeze the
   * user interface. Using this option you can specify your own scheduling
   * function instead of the default one.
   *
   * By default, the [schedule]{@link @corpuscule/utils/lib/scheduler.schedule}
   * is used.
   *
   * @param task a callback that will be run at the scheduled time.
   */
  scheduler?(task: () => void): Promise<void>;
}

export type PropertyGuard = (value: unknown) => boolean;

/**
 * A decorator that binds a class property to an appropriate attribute and
 * provides a transformation to the property value to and from the attribute
 * string.
 *
 * An attribute is the most well-known property type and also the most complex
 * type to work with. Standard requires that it should only be a string type,
 * but Corpuscule allows it to have three primitive types: `String`, `Boolean`,
 * and `Number`.
 *
 * ### Features and limitations
 * * The attribute cannot have a default value. The reason is that creating an
 * element with attributes defined in a constructor is [forbidden](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance)
 * by the standard. Setting attributes manually in `connectedCallback` is
 * allowed yet also limited, because component users can set these attributes
 * before connection to DOM and would be upset if default values override ones
 * made by them. If you consider all these possibilities, you can set defaults
 * in `connectedCallback` manually; it will require additional render for your
 * component though.
 * * Attribute are saved as strings in `HTMLElement` attributes storage, and
 * whenever you request them, cast to proper type happens. That's the reason
 * you cannot save in attribute more than just a primitive type.
 * * It is not required for the attribute name to be equal to the property it
 * is bound with. There are no restrictions for it.
 * * Attributes start the rendering only when the old and the new value are not
 * equal. To find it out the simple strict equality check is performed.
 * * Each attribute update calls the `attributeChangedCallback` method with
 * attribute name, old and new value.
 * * Each attribute update initiates rendering.
 *
 * ### Example
 * ```html
 * <script type="module">
 * @element('my-button', {renderer})
 * class MyButton extends HTMLElement {
 *   @attribute('disabled', Boolean) isDisabled;
 *
 *   [render]() {
 *     return html`
 *       <button disabled=${this.isDisabled}><slot></slot></button>
 *       ${this.isDisabled ? html`<span>Button disabled</span>` : nothing}
 *     `;
 *   }
 * }
 * </script>
 * <my-button disabled>Don't click me</my-button>
 * ```
 *
 * @param attributeName a name of the attribute to bind.
 *
 * @param guard a type of the property value that should be converted.
 */
export function attribute(
  attributeName: string,
  guard: BooleanConstructor | NumberConstructor | StringConstructor,
): PropertyDecorator;

/**
 * A decorator that transforms a class getter to a computed property. It is an
 * approach that can be used to reduce the number of expensive calculations by
 * remembering the latest result produced by the getter and providing it until
 * all the class properties the getter depends on are changed.
 *
 * @param token a token produced by a [[createComputingToken]] to bind this
 * decorator with [@observer]{@link observer}.
 */
export function computer(token: Token): PropertyDecorator;

/**
 * A decorator that converts a class declaration to a Custom Element and unites
 * all other decorators making a complete working system from them.
 *
 * @note new custom element definition with `@element` decorator is an
 * asynchronous operation. You cannot use it immediately. If you need to do
 * something with the element right after it is created, use the following
 * approach:
 * ```typescript
 * @element('my-component', {renderer})
 * class MyComponent extends HTMLElement {}
 *
 * customElements.whenDefined('my-component').then(() => {
 *  const myComponent = new MyComponent();
 * });
 * ```
 * @advice to avoid setting `renderer` each time you can create a wrapper decorator:
 * ```javascript
 * import {element as elementUniversal} from '@corpuscule/element';
 * import renderer from '@coruscule/lit-html-renderer';
 *
 * const element = (name, options) => elementUniversal(name, {...options, renderer});
 * ```
 *
 * ### Example
 * ```typescript
 * import {element, render} from '@corpuscule/element';
 * import renderer from '@coruscule/lit-html-renderer';
 *
 * @element('my-component', {renderer})
 * class MyComponent extends HTMLElement {
 *   protected [render](): TemplateResult {
 *     return html`<div>Hello, World!</div>`
 *   }
 * }
 *  ```
 * @param name a name of the new Custom Element. According to the standard, it
 * should contain a dash symbol.
 *
 * @param options a list of options that tunes the custom element according to
 * the requirements.
 */
export function element(name: string, options?: ElementDecoratorOptions): ClassDecorator;

/**
 * A decorator that converts a class property to a part of the Corpuscule
 * Element mechanism and allows defining [[ElementGears]] functions.
 *
 * If you do not plan to use the specific properties names, you can implement
 * the [[ElementGears]] interface.
 *
 * @param responsibilityKey
 */
export function gear(responsibilityKey?: keyof ElementGears): PropertyDecorator;

/**
 * A decorator that transforms a class property to a component internal
 * property.
 *
 * An internal property is a property that works under the hood. Its role is to
 * be an intrinsic mechanism, so it would be better to avoid sharing and
 * reusing it outside of the class.
 *
 * For React users, this concept may be familiar as a [Component State](https://reactjs.org/docs/state-and-lifecycle.html).
 *
 * ### Features and limitations
 * * Any change of the internal property initiates rendering; the equality
 * check of the old and the new value is not performed.
 * * The internal property doesn't have any guard on it.
 * * Each internal property update calls [[internalChangedCallback]] with
 * internal property name, old and new value.
 *
 * ### Example
 * ```typescript
 * @element('my-component-with-modal', {renderer})
 * class MyComponentWithModal extends HTMLElement {
 *   @internal private isOpen: boolean = false;
 *
 *   private handleOpen(): void {
 *     this.isOpen = !this.isOpen;
 *   }
 *
 *   private [render](): TemplateResult {
 *     return html`
 *       <button @click=${this.handleOpen}>Open modal</button>
 *       <some-modal ?open=${this.isOpen}></some-modal>
 *     `;
 *   }
 * }
 * ```
 */
export const internal: PropertyDecorator;

/**
 * A decorator that makes a class property observed. It works together with the
 * computed property created via [@computer]{@link computer} decorator to reset
 * the remembered getter result. When a value of one of the observed properties
 * is changed, the remembered result of the computed one is reset, and the next
 * call to the getter will start the recalculation which result will be
 * remembered again.
 *
 * Each computed property will observe all the observed properties at once and
 * will drop the remembered result on any of their change.
 *
 * @note Be accurate with [internal properties]{@link internal}, they will
 * change (and invalidate the computation result) even if they have the same
 * value.
 *
 * @param token a token produced by a [[createComputingToken]] to bind this
 * decorator with [@computer]{@link computer}.
 */
export function observer(token: Token): PropertyDecorator;

/**
 * A decorator that converts a class property to a component regular property.
 *
 * A regular property of the component is a property that can be set only
 * imperatively by assigning the component instance filed.
 *
 * ### Features and limitations
 * * Property can be guarded by a function that checks its type. Since a
 * property can have any type, guarding them is a user's responsibility. If you
 * don't care about checking property types, you can omit the guard.
 * * Properties start the rendering only when the old and the new value are not
 * equal. To find it out the simple strict equality check is performed.
 * * Each property update calls [[propertyChangedCallback]] method with
 * property name, old and new value.
 * * Each property update initiates rendering.
 *
 * ### Example
 * ```typescript
 * @element('my-square-info', {renderer})
 * class MySquareInfo extends HTMLElement {
 *   @property(v => typeof v === 'object' && v.width && v.height)
 *   public square = {width: 10, height: 10};
 *
 *   protected [render](): TemplateResult {
 *     return html`
 *       <div>Square width: ${this.square.width}</div>
 *       <div>Square height: ${this.square.height}</div>
 *     `;
 *   }
 * }
 *
 * customElements.whenDefined('my-component').then(() => {
 *   const mySquareInfo = document.createElement('my-square-info');
 *   mySquareInfo.square = {width: 40, height: 40};
 *   document.body.append(mySquareInfo);
 * });
 * ```
 *
 * @param guard a function that checks the type of the assigned value; if it
 * returns `false`, the error will be thrown.
 */
export function property(guard?: PropertyGuard): PropertyDecorator;

/**
 * A decorator that converts a property to a getter that finds an element with
 * the `selector` in the Light or Shadow DOM of your element using the
 * `querySelector` method.
 *
 * ### Example
 * ```typescript
 * @element('my-element', {renderer})
 * class MyElement extends HTMLElement {
 *   @query('#target') private target: HTMLSpanElement;
 *
 *   protected [render](): TemplateResult {
 *     return html`
 *       <div class="wrapper">
 *         <span id="target"></span>
 *       </div>
 *     `;
 *   }
 * }
 * ```
 *
 * @param selector a selector of the desired element.
 */
export function query(selector: string): PropertyDecorator;

/**
 * A decorator that converts a property to a getter that finds all elements
 * with the `selector` in the Light or Shadow DOM of your element using the
 * `querySelectorAll` method.
 *
 * ### Example
 * ```typescript
 * @element('my-element', {renderer})
 * class MyElement extends HTMLElement {
 *   @queryAll('.target') private targets: HTMLCollectionOf<HTMLSpanElement>;
 *
 *   protected [render](): TemplateResult {
 *     return html`
 *       <div class="wrapper">
 *         <span class="target"></span>
 *         <span class="target"></span>
 *         <span class="target"></span>
 *       </div>
 *     `;
 *   }
 * }
 * ```
 *
 * @param selector a selector of the desired set of elements.
 */
export function queryAll(selector: string): PropertyDecorator;

/**
 * By default, [computed]{@link computer} and [observed]{@link observer}
 * properties do not know that they are connected. To link them with each
 * other, you have to use a token created via this function and send it to the
 * decorators of computed and observed properties you want to connect.
 */
export function createComputingToken(): Token;
