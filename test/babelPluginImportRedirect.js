/* eslint-disable @typescript-eslint/no-require-imports */

const t = require('@babel/types');
const {readdirSync} = require('fs');
const {resolve} = require('path');

const packs = readdirSync(resolve(__dirname, '../packages')).map(
  pack => `@corpuscule/${pack}`,
);

module.exports = () => ({
  pre() {
    this.visitedNodes = new Set();
  },
  visitor: {
    ImportDeclaration(path) {
      if (this.visitedNodes.has(path.node)) {
        return;
      }

      const {specifiers, source} = path.node;

      if (!packs.some(pack => source.value.includes(pack))) {
        return;
      }

      const newUri = source.value.replace('@corpuscule', '../..');

      const newSource = t.stringLiteral(newUri);
      const newDeclaration = t.importDeclaration(specifiers, newSource);

      path.replaceWith(newDeclaration);

      this.visitedNodes.add(newDeclaration);
    },
  },
});
