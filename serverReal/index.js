const Koa = require('koa')
const app = new Koa()
const KoaStatic = require('koa-static');
const path = require('path')
const cors = require('@koa/cors')

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

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './static'
app.use(KoaStatic(
    path.join(__dirname, staticPath)
))

app.listen(1111, ()=>{
    console.log('server is running at http://localhost:1111')
})
