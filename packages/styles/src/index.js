import assertKind from "@corpuscule/utils/lib/assertKind";
import {html} from "lit-html";
import {style} from "./tokens";

export {link} from "./utils";
export {style};

const stylePattern = /[{}]/;

const styles = (...pathsOrStyles) => ({elements, kind}) => {
  assertKind("styles", "class", kind);

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
