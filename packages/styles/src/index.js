import {html} from "lit-html";
import {style} from "./tokens";

export {link} from "./utils";
export {style};

const stylePattern = /[{}]/;

const styles = (...pathsOrStyles) => ({elements, kind}) => {
  if (kind !== "class") {
    throw new TypeError(`@connected can be applied only to a class but is applied to ${kind}`);
  }

  return {
    elements: [...elements.filter(({key}) => key !== style), {
      descriptor: {
        configurable: true,
      },
      initializer() {
        return html`${
          pathsOrStyles.map(pathOrStyle => ( // eslint-disable-line no-extra-parens
            stylePattern.test(pathOrStyle)
              ? html`<style>${pathOrStyle}</style>`
              : html`<link rel="stylesheet" type="text/css" href="${pathOrStyle}"/>`
          ))
        }`;
      },
      key: style,
      kind: "field",
      placement: "static",
    }],
    kind,
  };
};

export default styles;
