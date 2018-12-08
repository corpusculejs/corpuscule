/* eslint-disable capitalized-comments */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import {field} from '@corpuscule/utils/lib/descriptors';
import {html} from 'lit-html';
import {style} from './tokens';

export {link} from './utils';
export {style};

const stylePattern = /[{}]/;

const styles = (...pathsOrStyles) => ({elements, kind}) => {
  assertKind('styles', 'class', kind);

  return {
    elements: [
      ...elements.filter(({key}) => key !== style),
      field(
        {
          initializer() {
            return html`${
                pathsOrStyles.map(
                  (
                  pathOrStyle, // eslint-disable-line no-extra-parens
                ) =>
                  stylePattern.test(pathOrStyle)
                    ? html`<style>${pathOrStyle}</style>` // prettier-ignore
                    : html`<link rel="stylesheet" type="text/css" href="${pathOrStyle}" />`, // prettier-ignore
                )
              }`; // prettier-ignore
          },
          key: style,
        },
        {isStatic: true},
      ),
    ],
    kind,
  };
};

export default styles;
