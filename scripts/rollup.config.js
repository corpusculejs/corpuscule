const packages = require("./project");

module.exports = Object.entries(packages).reduce((acc, [pack, entries]) => {
  for (const file of entries) {
    acc.push({
      external: [
        ".",
      ],
      input: `packages/${pack}/src/${file}.js`,
      output: {
        file: `packages/${pack}/dist/${file}.js`,
        format: "es",
      },
    });
  }

  return acc;
}, []);
