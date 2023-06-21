const path = require('path')

function getCommonConfig (outputFileName) {
    return {
        mode: 'development',
        entry: path.resolve(__dirname, './src/index.js'),
          // the property name here populates the [name] inside of filename in the output object
        output: {
          path: path.resolve(__dirname, './dist'),
          filename: outputFileName,
          library: {
            name: 'ScCore',
            type: 'umd'
          }
        },
        module: {
          rules: [
            {
              // specifies that all scss files should be loaded into the output file using the array of loaders
              test: /\.css$/i,
              use: ['style-loader', 'css-loader'],
            },
            {
              // specify js files
              test: /\.js$/,
              // don't use js files in node_modules
              exclude: /node_modules/,
              // use babel for cross browser stuff
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                },
              },
            },
          ],
        },
    }
} 

const client = {
    ...getCommonConfig('sc-core.js'),
    // target: 'web',
};

// const browser = {
//     ...getCommonConfig('sc-core.js'),
//     target: 'node',
// };

module.exports = [client];