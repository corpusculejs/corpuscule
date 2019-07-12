/**
 * This module provides tools to render the [element]{@link @corpuscule/element}
 * content via the [lit-html](https://lit-html.polymer-project.org) library.
 *
 * @module @corpuscule/lit-html-renderer
 */

/**
 * Do not remove this comment; it keeps typedoc from misplacing the module
 * docs.
 */

import {TemplateResult} from 'lit-html';

/**
 * A function that runs the regular lit-html [render](https://lit-html.polymer-project.org/api/modules/lit_html.html#render)
 * function for the component's root with the specific result of the
 * [render]{@link @corpuscule/element.render} function.
 */
export default function renderRegular(
  result: TemplateResult,
  root: Element | DocumentFragment,
  context: unknown,
): void;
