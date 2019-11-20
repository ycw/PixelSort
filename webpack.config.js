module.exports = [{
    mode: 'production',
    devtool: 'source-map',
    entry: './src/glue.ts',
    output: {
        path: require('path').join(__dirname, './dist'),
        filename: 'pixelsort.js',
        library: 'PixelSort'
    },
    module: {
        rules: [
            { test: /\.ts$/, use: [{ loader: 'ts-loader' }] },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}]; 