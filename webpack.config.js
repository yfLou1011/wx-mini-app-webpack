const path = require("path");
const glob = require("globby");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const MiniPlugin = require("mini-program-webpack-loader").plugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const chalk = require("chalk");
const figlet = require("figlet");

const ENTRY_PATH = {
  pattern: [
    "./miniprogram/*",
    // "./miniprogram/pages/**/*.styl",
    // "./miniprogram/components/**/*.styl",
    // "./miniprogram/app.styl",
  ],
  miniprogram: path.join(__dirname, "miniprogram"),
};

const getEntryPath = (config) => {
  const fileList = glob.sync(config.pattern);
  console.log("===getEntryPath===", { __dirname, fileList });
  return fileList.reduce((previous, current) => {
    const filePath = path.parse(path.relative(config.miniprogram, current));
    const withoutSuffix = path.join(filePath.dir, filePath.name);
    previous[withoutSuffix] = path.resolve(__dirname, current);
    return previous;
  }, {});
};

const pathJoin = (dir) => {
  return path.join(__dirname, "../", dir);
};

const fileLoader = (name) => ({
  loader: "file-loader",
  options: {
    publicPath: "",
    context: path.resolve(__dirname, pathJoin("miniprogram")),
    name,
  },
});

const config = {
  entry: getEntryPath(ENTRY_PATH),
  output: {
    // path: __dirname,
    // filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    // 你可以在 json wxml wxss styl 中使用这里配置的 alias
    alias: {
      "@": path.resolve(__dirname, pathJoin("miniprogram")),
      //   src: path.resolve(__dirname, utils.resolve('src')),
      pages: path.resolve(__dirname, pathJoin("./pages")),
      utils: path.resolve(__dirname, pathJoin("./utils")),
      components: path.resolve(
        __dirname,
        path.join(__dirname, "../", "./components")
      ),
    },
  },
  mode: "production",
  watch: true,
  watchOptions: {
    ignored: ["cli/**", "node_modules/**"],
  },
  plugins: [
    // new FixStyleOnlyEntriesPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "miniprogram", to: "dist" }],
    }),
    // new MiniPlugin({
    //   // extfile: true,
    //   // setSubPackageCacheGroup
    // }),
    // new MiniCssExtractPlugin({
    //   filename: "./miniprogram/[name].wxss",
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        include: path.resolve(__dirname, pathJoin("miniprogram")),
        exclude: path.resolve(__dirname, pathJoin("node_modules")),
        use: [
          {
            loader: "eslint-loader",
            options: {
              formatter: require("eslint-friendly-formatter"),
            },
          },
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true, // cacheDirectory用于缓存babel的编译结果,加快重新编译的速度
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(styl)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"],
      },
      {
        test: /\.wxss$/,
        use: [fileLoader("[path][name].[ext]"), "mini-program-webpack-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".styl"],
  },
};

const init = () => {
  console.log(
    chalk.bold.green(
      figlet.textSync("MINIAPP CLI", {
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
};
init();
module.exports = config;
