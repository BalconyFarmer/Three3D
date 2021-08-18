const session = require('koa-session-minimal')
const MysqlStore = require('koa-mysql-session')

/**
 * 用户会话状态类
 */
class SessionApp {
    constructor(app) {
        this.app = app
        this.sessionConfig = {
            database: {
                USERNAME: 'root',
                PASSWORD: '1234',
                DATABASE: 'db_behance',
                HOST: 'localhost'
            }
        }
        this.init()
    }

    init() {
        // session存储配置
        const sessionMysqlConfig = {
            user: this.sessionConfig.database.USERNAME,
            password: this.sessionConfig.database.PASSWORD,
            database: this.sessionConfig.database.DATABASE,
            host: this.sessionConfig.database.HOST,
        }
        // 配置session中间件
        this.app.use(session({
            key: 'USER_SID',
            store: new MysqlStore(sessionMysqlConfig),
            cookie: {                        // 与 cookie 相关的配置
                // domain: 'http://localhost:1111',    // 写 cookie 所在的域名 ??????
                domain: 'localhost',    // 写 cookie 所在的域名 ??????
                path: '/',                   // 写 cookie 所在的路径
                maxAge: 1000 * 60 * 60,      // cookie/session 有效时长
                httpOnly: false,             // 是否只用于 http 请求中获取
                overwrite: true              // 是否允许重写
            }
        }))
    }

    // 登录成功后设置session到MySQL和设置sessionId到cookie
    setSession(ctx, result) {
        let session = ctx.session
        ctx.session.isLogin = true
        session.userName = result.name
        session.userId = result.id
        session.password = result.password
        session.headIcon = result.headIcon
    }

    // 判断session
    judgeSession(ctx) {
        // 判断是否有session
        if (ctx.session && ctx.session.isLogin && ctx.session.userName) {
            console.log('用户已登陆', ctx.session.userName, ctx.session.userId)
            // return ctx.session
            return ctx.session.userId
        } else {
            // 没有登录态则跳转到错误页面
            console.log('用户未登录', ctx.session.userId)
            return null
        }
    }
}

module.exports = {SessionApp}
