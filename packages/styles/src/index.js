/* eslint-disable capitalized-comments, no-sync */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import createSupers from '@corpuscule/utils/lib/createSupers';
import {method} from '@corpuscule/utils/lib/descriptors';

const observerConfig = {childList: true};

const attachShadowKey = 'attachShadow';
const {attachShadow} = HTMLElement.prototype;

export const stylesAttachedCallback = Symbol();

export const createStylesDecorator = ({shadyCSS, adoptedStyleSheets}) => (...pathsOrStyles) => ({
  elements,
  kind,
}) => {
  assertKind('styles', 'class', kind);

  const template = document.createElement('template');
  const constructableStyles = [];

  for (const pathOrStyle of pathsOrStyles) {
    if (pathOrStyle instanceof URL) {
      // If link to CSS file received
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href =
        pathOrStyle.origin === location.origin
          ? pathOrStyle.pathname + pathOrStyle.search
          : pathOrStyle;
      template.content.appendChild(link);
    } else if (shadyCSS) {
      // If ShadyCSS
      constructableStyles.push(pathOrStyle);
    } else if (adoptedStyleSheets) {
      // If there is support for Constructable Style Sheets proposal
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(pathOrStyle);
      constructableStyles.push(sheet);
    } else {
      // Otherwise, just create a style tag
      const style = document.createElement('style');
      style.textContent = pathOrStyle;
      template.content.appendChild(style);
    }
  }

  const $$stylesAttachedCallback = Symbol();

  const supers = createSupers(
    elements,
    new Map([[stylesAttachedCallback, $$stylesAttachedCallback]]),
  );

  return {
    elements: [
      ...elements.filter(({key}) => key !== stylesAttachedCallback),
      ...supers,
      method(
        {
          key: attachShadowKey,
          value(options) {
            const root = attachShadow.call(this, options);

            if (constructableStyles.length > 0) {
              if (shadyCSS) {
                window.ShadyCSS.prepareAdoptedCssText(constructableStyles, this.localName);
              } else {
                root.adoptedStyleSheets = constructableStyles;
              }
            }

            if (template.content.hasChildNodes()) {
              const styleElements = template.content.cloneNode(true);

              const observer = new MutationObserver(() => {
                root.prepend(styleElements);
                observer.disconnect();
                this[$$stylesAttachedCallback]();
              });

              observer.observe(root, observerConfig);
            } else {
              this[$$stylesAttachedCallback]();
            }

            return root;
          },
        },
        {isBound: true},
      ),
    ],
    kind,
  };
};

const styles = createStylesDecorator({
  adoptedStyleSheets: 'adoptedStyleSheets' in Document.prototype,
  shadyCSS: window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow,
});

export default styles;
