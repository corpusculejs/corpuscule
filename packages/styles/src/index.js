/* eslint-disable capitalized-comments, no-sync */
import getSupers from '@corpuscule/utils/lib/getSupersNew';

export const stylesAttachedCallback = Symbol();

const observerConfig = {childList: true};

export const stylesAdvanced = ({shadyCSS, adoptedStyleSheets}, ...pathsOrStyles) => target => {
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

  const supers = getSupers(target, ['attachShadow', stylesAttachedCallback]);

  target.__initializers.push(self => {
    Object.assign(self, {
      attachShadow(options) {
        const root = supers.attachShadow.call(self, options);

        if (constructableStyles.length > 0) {
          if (shadyCSS) {
            window.ShadyCSS.prepareAdoptedCssText(constructableStyles, self.localName);
          } else {
            root.adoptedStyleSheets = constructableStyles;
          }
        }

        if (template.content.hasChildNodes()) {
          const styleElements = template.content.cloneNode(true);

          const observer = new MutationObserver(() => {
            root.prepend(styleElements);
            observer.disconnect();
            supers[stylesAttachedCallback].call(self);
          });

          observer.observe(root, observerConfig);
        } else {
          supers[stylesAttachedCallback].call(self);
        }

        return root;
      },
    });
  });
};

const defaultOptions = {
  adoptedStyleSheets: 'adoptedStyleSheets' in Document.prototype,
  shadyCSS: window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow,
};

const styles = (...pathsOrStyles) => stylesAdvanced(defaultOptions, ...pathsOrStyles);

export default styles;
