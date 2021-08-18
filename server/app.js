const Koa = require('koa')
const path = require('path')
const static = require('koa-static')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const {SessionApp} = require('./router/session')

// 写文件工具
const getUploadFileExt = require('./router/utils/getUploadFileExt');
const getUploadFileName = require('./router/utils/getUploadFileName');
const checkDirExist = require('./router/utils/checkDirExist');
const getUploadDirName = require('./router/utils/getUploadDirName');

const app = new Koa()


// 初始化 router session
const sessionApp = new SessionApp(app)
module.exports = {sessionApp}
const {router} = require('./router');

// 跨域
app.use(cors({
        // 允许跨域地址(带cookie必须指定地址,不能为*)
        origin: 'http://localhost:8080',
        // 是否允许发送cookie(前端相应设置 axios -> withCredentials: true)
        credentials: true,
        //指定本次预检请求的有效期，单位为秒。
        // maxAge: 15,
        //设置所允许的HTTP请求方法
        // allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        //设置服务器支持的所有头信息字段
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
        //设置获取其他自定义字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
    }
))

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    await next();
});

// 自定义中间件 洋葱模型
// const one = async(ctx,next) => {
//     if (ctx.url)
//     console.log('>> 1')
//     await next()
//     console.log('<< 2')
// }
// app.use(one)

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './static'
app.use(static(
    path.join(__dirname, staticPath)
))

app.use(koaBody({
    multipart: true, // 支持文件上传
    // encoding: 'gzip',
    formidable: {
        uploadDir: path.join(__dirname, './staticAsserts/transferFolder'),
        keepExtensions: true,
        maxFieldsSize: 2 * 1024 * 1024,
        onFileBegin: (name, file) => {
            // 获取文件后缀
            const ext = getUploadFileExt(file.name);

            // 最终要保存到的文件夹目录
            const dirName = getUploadDirName();
            const dir = path.join(__dirname, `./staticAsserts/transferFolder/${dirName}`);

            // 检查文件夹是否存在如果不存在则新建文件夹
            checkDirExist(dir);

            // 获取文件名称
            const fileName = getUploadFileName(ext);

            // 重新覆盖 file.path 属性
            file.path = `${dir}/${fileName}`;
            app.context.uploadpath = app.context.uploadpath ? app.context.uploadpath : {};
            app.context.uploadpath[name] = `${dirName}/${fileName}`;
        },
        patchKoa: true
    }
}));

// 注入router
app.use(router.routes()).use(router.allowedMethods());

app.listen(1111, () => {
    console.log('服务启动成功 port http://localhost:1111')
})




