/**
 * This module provides tools to add styles to a web component.
 *
 * ```typescript
 * import styles, {stylesAttachedCallback} from '@corpuscule/styles';
 * ```
 *
 * @module @corpuscule/styles
 */

/**
 * A symbolic name of the [[StylesGears.stylesAttachedCallback]]. Use it to
 * declare the method.
 * ```typescript
 * class Foo extends HTMLElement {
 *   [stylesAttachedCallback](): void {
 *     // method body
 *   }
 * }
 * ```
 */
export const stylesAttachedCallback: unique symbol;

/**
 * This interface is only for documentation purposes. It cannot be implemented
 * since all methods have symbolic names.
 */
export interface StylesGears {
  /**
   * A method that is called when all styles are properly added. There are three
   * different timings it can fire:
   * * If the `URL` instance is used, it will fire after all CSS files are
   * loaded.
   * * If the `HTMLStyleElement` is used and no `URL` instance exists, it will
   * fire after the `<style>` tag is mounted.
   * * If nothing above is used, it will fire immediately after the
   * `attachShadow` is called.
   */
  stylesAttachedCallback(): void;
}

export interface StylesDecoratorOptions {
  /**
   * Defines whether the decorator should use the [Constructible Stylesheet
   * proposal](https://wicg.github.io/construct-stylesheets/).
   */
  readonly adoptedStyleSheets?: boolean;
  /**
   * Defines whether the decorator should use the [Shady CSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss)
   * polyfill.
   */
  readonly shadyCSS?: boolean;
}
/**
 * A decorator to add styles to a web component. There are four ways to do it.
 *
 * ### URL instances
 * Using an `URL` instance, you can define the path to the CSS file you want to
 * use for your web component. A `<link>` tag is created in the `ShadowRoot`
 * and the file is loaded; when the loading is over, the styles are applied to
 * the component. All styles are scoped, so the result is equal to othe
 * approaches.
 *
 * This approach brings some disadvantages:
 * * Loading CSS files is a time-consuming process, and while styles are not
 * loaded, the component might look ugly. To avoid it, you can use
 * [[stylesAttachedCallback]] method, which is called after all styles are
 * loaded.
 * * Loading many small files is quite expensive, and you cannot unite all the
 * CSS files in a big one: it will break the whole idea of the Shadow DOM.
 *
 * Considering all the facts, it may be not a good idea to use this approach in
 * production; on the other hand, it would be a great addition to the
 * development process along with the native ES modules because it does not
 * require any building process.
 *
 * ```typescript
 * import styles, {stylesAttachedCallback} from '@corpuscule/styles';
 *
 * @styles(new URL('styles.css', import.meta.url))
 * class StyledComponent extends HTMLElement {
 *   public connectedCallback() {
 *     this.shadowRoot!.innerHTML = '<div hidden class="foo">Bar</div>';
 *   }
 *
 *   private [stylesAttachedCallback]() {
 *      this.shadowRoot!.querySelector('.foo')!.hidden = false;
 *   }
 * }
 *
 * customElements.define('styled-component', StyledComponent);
 * ```
 *
 * This approach is used if the element is an `URL` instance.
 *
 * ### Constructible Stylesheets
 * The Constructible Stylesheets proposal allows attaching styles directly to a
 * component `ShadowRoot` as if a browser defined it. No intermediate `<style>`
 * tag is required.
 *
 * There are two approaches this function supports.
 *
 * #### Adopt existing stylesheet
 * If you provide a `CSSStyleSheet` object as an element of the `pathsOrStyles`
 * array, it will just be adopted.
 *
 * This approach will be used whether the [adoptedStyleSheets]{@link StylesDecoratorOptions.adoptedStyleSheets}
 * is enabled or not. Providing `CSSStyleSheet` object is enough.
 *
 * #### Create new stylesheet
 * If you provide a string as an element of the `pathsOrStyles` array, the new
 * `CSSStyleSheet` object will be created and adopted.
 *
 * This approach will be used if [adoptedStyleSheets]{@link StylesDecoratorOptions.adoptedStyleSheets}
 * is enabled.
 *
 * ### ShadyCSS
 * `ShadyCSS` provides support for a Constructible Stylesheets proposal, so
 * this approach does not differ a lot from the previous one; just the polyfill
 * is used.
 *
 * This approach is used if the element is a string and the
 * [shadyCSS]{@link StylesDecoratorOptions.shadyCSS} is enabled.
 *
 * ### HTMLStyleElement
 * If no approach described above works, the fallback to a `<style>` tag in the
 * top of `ShadowRoot` will be used.
 *
 * ```typescript
 * import styles, {stylesAttachedCallback} from '@corpuscule/styles';
 * import css from './styles.css';
 *
 * @styles(css)
 * class StyledComponent extends HTMLElement {
 *   public connectedCallback() {
 *     this.shadowRoot!.innerHTML = '<div class="foo">Bar</div>';
 *   }
 * }
 *
 * customElements.define('styled-component', StyledComponent);
 * ```
 *
 * @param pathsOrStyles an array with paths to the CSS files (as `URL`
 * instances), `CSSStyleSheet` objects or strings with CSS code.
 *
 * @param options an object that contains options to change the default
 * behavior of the decorator.
 */
export function stylesAdvanced(
  pathsOrStyles: Array<string | URL | CSSStyleSheet>,
  options?: StylesDecoratorOptions,
): ClassDecorator;

/**
 * A default version of [[stylesAdvanced]] decorator with automatically
 * detected options from [[StylesDecoratorOptions]].
 *
 * ### Detection algorithm
 * * [adoptedStyleSheets]{@link StylesDecoratorOptions.adoptedStyleSheets} is
 * enabled if the browser supports Constructible Stylesheet proposal.
 * * [shadyCSS]{@link StylesDecoratorOptions.shadyCSS} is enabled if the
 * ShadyCSS polyfill is used, and its support for the native shadow root is not
 * activated.
 */
export default function styles(
  ...pathsOrStyles: Array<string | URL | CSSStyleSheet>
): ClassDecorator;
