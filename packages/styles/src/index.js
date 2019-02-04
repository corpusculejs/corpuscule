/* eslint-disable capitalized-comments, no-sync */
import {assertKind, Kind} from '@corpuscule/utils/lib/asserts';
import {method} from '@corpuscule/utils/lib/descriptors';
import getSupers from '@corpuscule/utils/lib/getSupers';

const observerConfig = {childList: true};

const attachShadowKey = 'attachShadow';

export const stylesAttachedCallback = Symbol();

export const createStylesDecorator = ({shadyCSS, adoptedStyleSheets}) => (
  ...pathsOrStyles
) => descriptor => {
  assertKind('styles', Kind.Class, descriptor);

  const {elements, kind} = descriptor;

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

  const [supers, finisher] = getSupers(elements, [attachShadowKey, stylesAttachedCallback]);

  return {
    elements: [
      ...elements.filter(({key, placement}) => !(key === attachShadowKey && placement === 'own')),

      method({
        key: attachShadowKey,
        method(options) {
          const root = supers.attachShadow.call(this, options);

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
              supers[stylesAttachedCallback].call(this);
            });

            observer.observe(root, observerConfig);
          } else {
            supers[stylesAttachedCallback].call(this);
          }

          return root;
        },
        placement: 'own',
      }),
    ],
    finisher,
    kind,
  };
};

const styles = createStylesDecorator({
  adoptedStyleSheets: 'adoptedStyleSheets' in Document.prototype,
  shadyCSS: window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow,
});

export default styles;
