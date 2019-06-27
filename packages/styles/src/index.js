/* eslint-disable capitalized-comments, no-sync */
import getSupers from '@corpuscule/utils/lib/getSupers';

export const stylesAttachedCallback = Symbol();

const observerConfig = {childList: true};

export const stylesAdvanced = (
  pathsOrStyles,
  {
    adoptedStyleSheets = 'adoptedStyleSheets' in Document.prototype,
    shadyCSS = window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow,
  } = {},
) => target => {
  const {prototype} = target;
  const linkNodes = document.createDocumentFragment();
  const styleNodes = document.createDocumentFragment();
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
      linkNodes.append(link);
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
      styleNodes.append(style);
    }
  }

  const supers = getSupers(prototype, ['attachShadow', stylesAttachedCallback]);

  target.prototype.attachShadow = function attachShadow(options) {
    const root = supers.attachShadow.call(this, options);

    if (constructableStyles.length > 0) {
      if (shadyCSS) {
        window.ShadyCSS.prepareAdoptedCssText(constructableStyles, this.localName);
      } else {
        root.adoptedStyleSheets = constructableStyles;
      }
    }

    if (linkNodes.hasChildNodes() || styleNodes.hasChildNodes()) {
      const observer = new MutationObserver(() => {
        root.prepend(styleNodes.cloneNode(true));

        if (linkNodes.hasChildNodes()) {
          const nodesToAppend = linkNodes.cloneNode(true);

          for (let i = 0, count = nodesToAppend.children.length; i < count; i++) {
            // eslint-disable-next-line no-loop-func
            nodesToAppend.children[i].addEventListener('load', () => {
              count -= 1;

              if (count === 0) {
                supers[stylesAttachedCallback].call(this);
              }
            });
          }

          root.prepend(nodesToAppend);
        } else {
          supers[stylesAttachedCallback].call(this);
        }

        observer.disconnect();
      });

      observer.observe(root, observerConfig);
    } else {
      supers[stylesAttachedCallback].call(this);
    }

    return root;
  };
};

const styles = (...pathsOrStyles) => stylesAdvanced(pathsOrStyles);

export default styles;
