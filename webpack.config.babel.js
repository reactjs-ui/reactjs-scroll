import path from 'path';
import webpack from 'webpack';

const webpackConfig = {
  resolve: {
    //自动扩展文件后缀名
    extensions: ['.js', '.jsx', '.scss']
  },
  entry: {
    index: ['./src/scripts/index.js']
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    'prop-types': 'prop-types'
  },
  output: {
    path: path.join(__dirname, 'build'), //打包输出目录
    filename: '[name].js', //文件名称
    publicPath: './', //生成文件基于上下文路径
    library: ['reactScroll'],
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      // https://github.com/MoOx/eslint-loader
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            configFile: '.eslintrc',
            emitError: true, // 验证失败，终止
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      },
    ]
  },

  plugins: [
    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    //用来优化生成的代码 chunk,合并相同的代码
    new webpack.optimize.AggressiveMergingPlugin(),
    //用来保证编译过程不出错
    new webpack.NoEmitOnErrorsPlugin(),
  ]
};

module.exports = webpackConfig;
