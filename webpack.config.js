const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const WebpackAliyunOssPlugin = require('webpack-aliyun-oss-plugin');

let ossConfig = null;
try {
  ossConfig = require('./ossconfig.json');
} catch (e) {}

let define = {
  // 后面的路径如果需要变为云地址，请自行修改
  __CDN__:
    process.env.ENV === 'developer'
      ? '/dist/'
      : `https://assets.51wakeup.com/assets/${new Date().getFullYear()}/h5/${process.env.ENV}`,
  __ENV__: JSON.stringify(process.env.ENV),
  __API__: JSON.stringify(process.env.API || process.env.ENV),
  __VER__: require('./package.json').version
};

let config = {
  entry: {
    svelte: ['./src/index.ts']
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name][id].[chunkhash].js',
    path: path.resolve('./www/dist'),
    publicPath: define.__CDN__
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve('node_modules'), path.resolve('src')]
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        include: path.resolve('src'),
        use: [{ loader: 'babel-loader' }, { loader: 'ts-loader' }]
      },
      {
        test: /\.sve$/,
        include: path.resolve('src'),
        use: [{ loader: 'babel-loader' }, { loader: 'svelte-loader' }]
      },
      {
        test: /\.(png|jpg)$/,
        include: path.resolve('src'),
        use: ['url-loader?limit=8192&name=img/[hash:8].[name].[ext]']
      },
      {
        test: /\.(less|css)$/,
        include: path.resolve('src'),
        use:
          ['test', 'production'].indexOf(process.env.ENV) >= 0
            ? ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  {
                    loader: 'css-loader',
                    options: { importLoaders: 1, modules: false }
                  },
                  { loader: 'less-loader' }
                ]
              })
            : [
                { loader: 'style-loader' },
                {
                  loader: 'css-loader',
                  options: { importLoaders: 1, modules: false }
                },
                { loader: 'less-loader' }
              ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin(
      Object.assign({}, define, {
        __VER__: JSON.stringify(define.__VER__)
      })
    ),
    new HtmlWebpackPlugin(
      Object.assign(
        {
          title: 'App',
          template: './src/index.ejs',
          hash: true,
          favicon: './src/common/asset/favicon.png',
          filename: '../index.html',
          alwaysWriteToDisk: true
        },
        define
      )
    ),
    new HtmlWebpackHarddiskPlugin()
  ]
};

if (process.env.ENV === 'developer') {

  // 开发服务器
  config.devServer = {
    port: 8080,
    host: '0.0.0.0',
    inline: true,
    contentBase: path.resolve(__dirname, 'www'),
    publicPath: define.__CDN__,
    stats: 'minimal'
  };

  config.devtool = 'source-map';

  // 忽略自动刷新监视文件夹
  config.watchOptions = {
    ignored: /node_modules/
  };
}

if (['test', 'production'].indexOf(process.env.ENV) >= 0) {

  // 打包关闭
  config.devtool = false;

  config.plugins = [].concat(config.plugins, [

    // 优化模块合并
    new webpack.optimize.ModuleConcatenationPlugin(),

    // 压缩脚本
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      compress: {
        warnings: false,
        drop_console: true,
        collapse_vars: true,
        reduce_vars: true
      }
    }),

    // 异步js合并
    new webpack.optimize.CommonsChunkPlugin({
      async: true,
      children: true,
      minChunks: 4
    }),

    // 合并样式
    new ExtractTextPlugin({
      filename: '[name].css',
      disable: false,
      allChunks: true
    }),

    // 压缩gzip
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]);

  // 上传 oss
  if (ossConfig) {
    config.plugins = [].concat(config.plugins, [
      new WebpackAliyunOssPlugin({
        ak: ossConfig.ak,
        sk: ossConfig.sk,
        bucket: ossConfig.bucket,
        region: ossConfig.region,
        filter: function(asset) {
          return !/\.html$/.test(asset);
        }
      })
    ]);
  }
}

module.exports = config;
