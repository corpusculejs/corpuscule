import {html} from "lit-html/lib/lit-extended";
import {style} from "./tokens";

export {link} from "./utils";
export {style};

const stylePattern = /[{}]/;

const styles = (...pathsOrStyles) => (target) => {
  target[style] = html`${
    pathsOrStyles.map(pathOrStyle => ( // eslint-disable-line no-extra-parens
      stylePattern.test(pathOrStyle)
        ? html`<style>${pathOrStyle}</style>`
        : html`<link rel="stylesheet" type="text/css" href="${pathOrStyle}"/>`
    ))
  }`;

  return target;
};

export default styles;
