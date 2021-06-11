const path = require('path');
const config = {
    target:'node',
    mode:'production',
    entry: path.resolve('src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename:'index.js',
        libraryTarget: 'commonjs',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                // include: [],
                exclude: /node_module/,//优先级比include高
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: [
                        ['@babel/preset-env']
                    ],
                },

            }
        ],
    },

};

module.exports = config;
