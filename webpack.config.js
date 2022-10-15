const webpack = require("webpack");

module.exports = {
  mode: 'production',
  optimization: {
    minimize: false
  },
  entry: "./src/index.ts",
  output: {
    library:{
        name: "EncryptedIndexedDB",
        type: "umd"
    },
    umdNamedDefine: true,
    filename: "encrypted-indexed-db.js"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
      {
        test: /\.md$/,
        use: 'ignore-loader'
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
    }
  },
  plugins: [
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
  externals: {
    "node-webcrypto-ossl": "node-webcrypto-ossl"
  }
};