/**
 * This module provides tools to add styles to a web component. In general,
 * there are 4 approaches.
 *
 * @module styles
 */

import getSupers from '@corpuscule/utils/lib/getSupers';

/**
 * A list of additional options that `stylesAdvanced` decorator accepts.
 * Defines whether the browser supports specific technologies or the ShadyCSS
 * polyfill is provided.
 */
export interface StylesDecoratorOptions {
  /**
   * Defines whether the browser supports the [Constructable Stylesheet proposal](https://wicg.github.io/construct-stylesheets/).
   */
  readonly adoptedStyleSheets: boolean;
  /**
   * Defines whether the [Shady CSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss)
   * polyfill is provided.
   */
  readonly shadyCSS: boolean;
}

/**
 * A symbolic class property name
 */
export const stylesAttachedCallback = Symbol();

interface ConstructableCSSStyleSheet extends CSSStyleSheet {
  readonly replaceSync: (style: string) => void;
}

const observerConfig = {childList: true};

/**
 * A decorator to add styles to a web component. There are four ways to do it;
 * based on the browser features and the user's preferences, the best one will
 * be chosen.
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
 * @param {StylesDecoratorOptions} options an object that contains options to change the default
 * behavior of the decorator.
 *
 * @param pathsOrStyles an array that can contain strings or `URL` instances
 * that define paths to the desired component styles.
 */
export function stylesAdvanced<T extends Array<string | URL>>(
  {shadyCSS, adoptedStyleSheets}: StylesDecoratorOptions,
  ...pathsOrStyles: T
): ClassDecorator {
  return target => {
    const {prototype} = target;
    const template = document.createElement('template');
    const constructableStyles: Array<string | ConstructableCSSStyleSheet> = [];

    for (const pathOrStyle of pathsOrStyles) {
      if (pathOrStyle instanceof URL) {
        // If link to CSS file received
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href =
          pathOrStyle.origin === location.origin
            ? pathOrStyle.pathname + pathOrStyle.search
            : pathOrStyle.toString();
        template.content.appendChild(link);
      } else if (shadyCSS) {
        // If ShadyCSS
        constructableStyles.push(pathOrStyle);
      } else if (adoptedStyleSheets) {
        // If there is a support for the Constructable Style Sheets proposal
        const sheet = new CSSStyleSheet() as ConstructableCSSStyleSheet;
        sheet.replaceSync(pathOrStyle);
        constructableStyles.push(sheet);
      } else {
        // Otherwise, just create a style tag
        const style = document.createElement('style');
        style.textContent = pathOrStyle;
        template.content.appendChild(style);
      }
    }

    const supers = getSupers(prototype, ['attachShadow', stylesAttachedCallback]);

    target.prototype.attachShadow = function attachShadow(
      this: any,
      init: ShadowRootInit,
    ): ShadowRoot {
      const root = supers.attachShadow.call(this, init);

      if (constructableStyles.length > 0) {
        if (shadyCSS) {
          (window as any).ShadyCSS.prepareAdoptedCssText(constructableStyles, this.localName);
        } else {
          root.adoptedStyleSheets = constructableStyles;
        }
      }

      if (template.content.hasChildNodes()) {
        const styleElements = template.content.cloneNode(true);

        const observer = new MutationObserver(() => {
          root.prepend(styleElements);
          observer.disconnect();
          supers[stylesAttachedCallback].call(this);
        });

        observer.observe(root, observerConfig);
      } else {
        supers[stylesAttachedCallback].call(this);
      }

      return root;
    };
  };
}

const defaultOptions = {
  adoptedStyleSheets: 'adoptedStyleSheets' in Document.prototype,
  shadyCSS: 'ShadyCSS' in window && !(window as any).ShadyCSS.nativeShadow,
};

const styles = <T extends Array<string | URL>>(...pathsOrStyles: T): ClassDecorator =>
  stylesAdvanced(defaultOptions, ...pathsOrStyles);

export default styles;
