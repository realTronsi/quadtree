const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "quadtree.min.js",
    library: {
      name: "Quadtree",
      type: "umd",
      export: "Quadtree"
    },
    globalObject: "this"
  }
};