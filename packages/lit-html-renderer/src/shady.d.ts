/**
 * This module provides tools to render the [element]{@link @corpuscule/element}
 * content via the [lit-html](https://lit-html.polymer-project.org) library for
 * the older browsers that uses [Shady CSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss)
 * polyfill.
 *
 * @module @corpuscule/lit-html-renderer/lib/shady
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

import {TemplateResult} from 'lit-html';

/**
 * A function that runs the shady lit-html [render](https://lit-html.polymer-project.org/api/modules/shady_render.html#render)
 * function for the component's root with the specific result of the
 * [render]{@link @corpuscule/element.render} function.
 */
export default function renderShady(
  result: TemplateResult,
  root: Element | DocumentFragment,
  context: unknown,
): void;
