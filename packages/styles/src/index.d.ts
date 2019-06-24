/**
 * This module provides tools to add styles to a web component.
 *
 * @module styles
 *
 * @import
 * ```typescript
 * import styles, {stylesAttachedCallback} from '@corpuscule/styles';
 * ```
 */

/**
 * A symbolic name of the method that is called when all styles are properly
 * added. There are three different timings it can fire:
 * * If the `URL` instance is used, it will fire after all CSS files are
 * loaded.
 * * If the `HTMLStyleElement` is used and no `URL` instance exists, it will
 * fire after the `<style>` tag is mounted.
 * * If nothing above is used, it will fire immediately after the
 * `attachShadow` is called.
 *
 * @example
 * ```typescript
 * @styles(new URL('styles.css', import.meta.url))
 * class Component extends HTMLElement {
 *   public connectedCallback() {
 *     this.shadowRoot!.innerHTML = 'Loading...';
 *   }
 *
 *   private [stylesAttachedCallback]() {
 *     this.shadowRoot!.innerHTML = '<div class="foo">Bar</div>'
 *   }
 * }
 * ```
 */
export const stylesAttachedCallback: unique symbol;

export interface StylesDecoratorOptions {
  /**
   * Defines whether the decorator should use the [Constructable Stylesheet
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
 * A decorator to add styles to a web component. There are four ways to do it;
 * based on the received options and type of the following parameters, the best
 * one will be chosen.
 *
 * ## URL instance
 * You can use the `URL` class instance as one of the decorator parameters.
 * This way, the `<link>` tag with the provided URL will be added to the
 * `ShadowRoot` of the component. All styles loaded via the `HTMLLinkElement`
 * are scoped, so this approach would be an excellent addition to the native ES
 * modules while the [CSS modules](https://github.com/w3c/webcomponents/issues/759)
 * proposal is under development.
 *
 * However, loading CSS files is a time-consuming process, and while it is not
 * finished, your component might look ugly without proper styling. To avoid
 * it, you can use the [[stylesAttachedCallback]] method instead of the usual
 * `connectedCallback`. It fires when all styles are loaded.
 *
 * ## Shady CSS
 * `ShadyCSS` has support for Constructable Stylesheets, so using it implies
 * using Constructable Stylesheet polyfill. The algorithm decides to use this
 * method if the path is a string, and the [[shadyCSS]] option is enabled.
 *
 * ## Constructable Stylesheets
 * The [Constructable Stylesheet proposal ](https://wicg.github.io/construct-stylesheets/)
 * allows attaching styles directly to a component via JavaScript without the
 * intermediate `<style>` tag. This way will be chosen if the path is a string,
 * and the [[adoptedStyleSheets]] option is enabled.
 *
 * ## HTMLStyleElement
 * If no other option works, the decorator will add `<style>` tag as a first
 * child of `ShadowRoot`.
 *
 * @param options an object that contains options to change the default
 * behavior of the decorator.
 *
 * @param pathsOrStyles an array that can contain strings or `URL` instances
 * that define paths to the desired component styles.
 */
export function stylesAdvanced(
  pathsOrStyles: Array<string | URL>,
  options?: StylesDecoratorOptions,
): ClassDecorator;

/**
 * A default version of [[stylesAdvanced]] decorator with automatically
 * detected options from [[StylesDecoratorOptions]].
 *
 * ## Detection algorithm
 * `adoptedStyleSheets` is enabled if the browser supports Constructable
 * Stylesheet proposal.
 *
 * `shadyCSS` is enabled if the ShadyCSS polyfill is used, and its support for
 * the native shadow root is not activated.
 */
export default function styles(...pathsOrStyles: Array<string | URL>): ClassDecorator;
