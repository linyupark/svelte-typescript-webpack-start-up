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

const ossPath = {
  production: `pub/`,
  test: `test/`
};

let define = {
  // 后面的路径如果需要变为云地址，请自行修改
  __CDN__:
    process.env.ENV === 'dev'
      ? '/dist/'
      : `https://assets.51wakeup.com/assets/${new Date().getFullYear()}/h5/${ossPath[
          process.env.ENV
        ]}`,
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
    chunkFilename: '[id].[chunkhash].js',
    path: path.resolve('./www/dist'),
    publicPath: define.__CDN__
  },
  resolve: {
    extensions: ['.ts', '.js', '.sve'],
    modules: [path.resolve('node_modules'), path.resolve('src')],
    alias: {
      view: path.resolve('src/view'),
      model: path.resolve('src/model'),
      component: path.resolve('src/component'),
      common: path.resolve('src/common'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('src'),
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } }
        ]
      },
      {
        test: /\.ts$/,
        include: path.resolve('src'),
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } },
          { loader: 'ts-loader' }
        ]
      },
      {
        test: /\.sve$/,
        include: path.resolve('src'),
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } },
          { loader: 'svelte-loader' }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        include: path.resolve('src'),
        use: ['url-loader?name=img/[hash:8].[name].[ext]']
        // use: ['url-loader?limit=8192&name=img/[hash:8].[name].[ext]']
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
          title: '醒来',
          template: './src/index.ejs',
          hash: true,
          favicon: './src/common/asset/favicon.png',
          filename: '../index.html',
          alwaysWriteToDisk: true
        },
        define
      )
    ),
    new HtmlWebpackHarddiskPlugin(),
    
    // 代码分离部分的模块命名
    new webpack.NamedChunksPlugin(function(chunk) {
      if (chunk.name) return chunk.name;
      const regex = new RegExp(path.resolve('src/page'));
      for (let m of chunk._modules) {
        if (regex.test(m.context)) {
          return path
            .relative(path.resolve('src'), m.userRequest)
            .split('/')
            .slice(1)
            .join('_')
            .split('.')[0]
        }
      }
      return null;
    })
  ]
};

if (process.env.ENV === 'dev') {
  // 开发服务器
  config.devServer = {
    port: 8080,
    host: '0.0.0.0',
    inline: true,
    contentBase: path.resolve(__dirname, 'www'),
    publicPath: define.__CDN__,
    stats: 'minimal'
  };

  // config.devtool = 'eval-source-map';

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

    // 压缩脚本
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      sourceMap: false,
      compress: {
        warnings: false,
        drop_console: true,
        collapse_vars: true,
        reduce_vars: true
      }
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
