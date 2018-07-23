module.exports = {
  entry: __dirname + "/server/server.js", //已多次提及的唯一入口文件
  output: {
    path: __dirname + "/dist",
    filename: "server.js"
  },
  devtool: 'none',
  module: {
    rules: [{
      test: /(\.jsx|\.js)$/,
      use: {
        loader: "babel-loader"
      },
      exclude: /node_modules/
    }
    ]
  }
}
