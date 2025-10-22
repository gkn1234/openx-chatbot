const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;
const { env } = require('node:process');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig,
        },
      },
    ],
  },
  externals: env.MODE === 'production' ?
      [] :
      [
        nodeExternals({
          allowlist: [/^@openx\/.*/],
        }),
      ],
};
