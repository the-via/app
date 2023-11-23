const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

const hash = fs.readFileSync('public/definitions/hash.json', 'utf8');

module.exports = {
  // Entry point of your application
  entry: './src/index.tsx',

  // Output of the bundled file
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'index.bundle.js',
    chunkFilename: '[name].bundle.js',
  },
  // Chunk
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // },

  // Resolving file extensions
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets'),
    },
  },

  // Loaders and rules
  module: {
    rules: [
      {
        // TypeScript and JavaScript files
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
            },
          },
        ],
      },
      {
        // CSS Files
        test: /\.css$/,
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            url: true,
          },
        }],
      },
      {
        // Image Files
        test: /\.(png|svg|jpg|jpeg|gif|glb)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/', // Fonts will be copied to dist/fonts
            },
          },
        ],
      },
    ],
  },

  // Plugins
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
      templateParameters: {
        hash,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.DEBUG_PROD': JSON.stringify(process.env.DEBUG_PROD),
      'process.env.MODE': JSON.stringify(process.env.MODE),
      'process.env.DEV': JSON.stringify(process.env.DEV),
    }),
  ],

  // Development server configuration
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
  },
};
