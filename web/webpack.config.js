var path = require('path')

function resolve(dir) {
    console.log(__dirname)
    return path.join(__dirname, dir)
}

module.exports = {
    chainWebpack: config => {
        config.resolve.alias
            // .set(key, value) // key,value自行定义，比如.set('@@', resolve('src/components'))
            .set('@', resolve('src'))

        const svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule.use('vue-svg-loader').loader('vue-svg-loader');
    }
}

