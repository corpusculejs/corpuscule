/* eslint-disable capitalized-comments */
import {assertKind} from '@corpuscule/utils/lib/asserts';
import {field} from '@corpuscule/utils/lib/descriptors';
import {style} from './tokens';

export {link} from './utils';
export {style};

const stylePattern = /[{}]/;

const styles = (...pathsOrStyles) => ({elements, kind}) => {
  assertKind('styles', 'class', kind);

  const template = document.createElement('template');
  template.innerHTML = pathsOrStyles
    .map(pathOrStyle =>
      stylePattern.test(pathOrStyle)
        ? `<style>${pathOrStyle}</style>`
        : `<link rel="stylesheet" type="text/css" href="${pathOrStyle}" />`,
    )
    .join('');

  return {
    elements: [
      ...elements.filter(({key}) => key !== style),
      field(
        {
          initializer() {
            return template.content.cloneNode(true);
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
