const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', 'jsx']
    },
    entry: './Resources/Private/JavaScript/index.tsx',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'Resources/Public/JavaScript')
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new MiniCssExtractPlugin({
            filename: '../Styles/[name].css',
            chunkFilename: '[id].css'
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({}),
            new OptimizeCSSAssetsPlugin({})
        ],
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                include: [
                    path.resolve(__dirname, 'Resources/Private/JavaScript')
                ],
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader?sourceMap',
                    'sass-loader?sourceMap',
                ],
            }
        ]
    }
};
