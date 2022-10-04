module.exports = {
  mode: 'production',
  optimization: {
    minimize: false
  },
  entry: "./src/index.ts",
  output: {
    library: "EncryptedStorage",
    libraryTarget: "umd",
    umdNamedDefine: true,
    filename: "encrypted-storage.js"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [],
  externals: {
    "node-webcrypto-ossl": "node-webcrypto-ossl"
  }
};