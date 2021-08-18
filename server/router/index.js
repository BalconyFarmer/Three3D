const {initSquelize} = require('./initSquelize')
const Router = require('koa-router')
const {sessionApp} = require('../app')
const router = new Router()
const fs = require('fs')

// 初始化数据库
let initSequelize = new initSquelize()

// 保存Scene
router.post('/saveScene', async (ctx, next) => {
    const userid = sessionApp.judgeSession(ctx)
    const sceneJsonAdress = `./static/2userStatic/${userid}/scenes/${ctx.request.body.name}.json`
    fs.writeFile(sceneJsonAdress, ctx.request.body.sceneData, (err) => {
        console.log(err)
    })
})

// 读取scene
router.post('/readScene', async (ctx, next) => {
    const userid = sessionApp.judgeSession(ctx)
    const sceneJsonAdress = `./static/2userStatic/${userid}/scenes/${ctx.request.body.name}.json`
    ctx.body = sceneJsonAdress
})

// 保存OBJ
router.post('/saveOBJ', async (ctx, next) => {

    const userid = sessionApp.judgeSession(ctx)

    const files = ctx.request.files['files[]']
    const reg = /.obj/ig;
    const folderName = getOBJName()

    const folderAddress = `./static/2userStatic/${userid}/objs/${folderName}`
    const folderAddressJPG = `./static/2userStatic/${userid}/objs/${folderName}/${folderName}`

    if (typeof folderName === 'undefined' || !files.length) {
        ctx.body = '上传失败,缺少<.obj>文件 或者 缺少<.mtl>';
    } else {
        makeFolder()
        files.forEach((item) => {
            if (item.type === 'image/jpeg' || item.type === 'image/png') {
                moveFileJPG(item)
            } else {
                moveOBJMtl(item)
            }
        })
        ctx.body = '上传成功';
    }

    function getOBJName() {
        const length = files.length
        for (let i = 0; i < length; i++) {
            if (files[i].name.search('.obj') > 0) {
                const _folderName = files[i].name.replace(reg, '')
                return _folderName
            }
        }
    }

    function makeFolder() {
        try {
            fs.accessSync(folderAddress);
        } catch (err) {
            fs.mkdirSync(folderAddress)
            fs.mkdirSync(folderAddressJPG)
        }
    }

    async function moveOBJMtl(file) {
        const videoName = file.name
        const reader = fs.createReadStream(file.path)
        const writer = fs.createWriteStream(`${folderAddress}/${videoName}`)
        reader.pipe(writer)

        fs.unlink(file.path, function (a) {
            // 删除
        })

        if (file.name.search('.obj') > 0) {
            const postData = {
                userid: sessionApp.judgeSession(ctx),
                objname: folderName,
                objpath: folderAddress + '/' + videoName
            }
            const result = await initSequelize.saveOBJ(postData)
        }

    }

    function moveFileJPG(item) {
        const videoName = item.name
        const reader = fs.createReadStream(item.path)
        const writer = fs.createWriteStream(`${folderAddressJPG}/${videoName}`)
        fs.unlink(item.path, function (a) {
            // 删除
        })
        reader.pipe(writer)
    }

})

router.post('/getOBJList', async (ctx, next) => {
    const result = await initSequelize.getMyOBJResource()
    ctx.body = result;
})

// 保存视频
router.post('/saveVideo', async (ctx, next) => {
    const userid = sessionApp.judgeSession(ctx)

    const files = ctx.request.files['files[]']

    async function moveFile(file) {
        const videoName = file.name
        const reader = fs.createReadStream(file.path)
        const writer = fs.createWriteStream(` ./static/2userStatic/${userid}/videos/${videoName}`)

        reader.pipe(writer)
        const postData = {
            userid: 100,
            videoname: ctx.request.body.videoIntroduce,
            videopath: `./static/2userStatic/${userid}/videos/${videoName}`
        }
        fs.unlink(file.path, function (a) {
            // 删除
        })
        const result = await initSequelize.saveVideo(postData)
    }

    if (files.length) {
        files.forEach(item => {
            moveFile(item)
        })
    } else if (typeof files === 'object') {
        await moveFile(files)
    }

    sessionApp.judgeSession(ctx)
    ctx.body = ctx.request.body;
})

// 注册
router.post('/regist', async (ctx, next) => {
    let postData = ctx.request.body
    const result = await initSequelize.handleRegist(postData)
    if (result === null) {
        ctx.body = '该账户已注册'
    } else {
        const folderAddress = `./static/2userStatic/${result.id}`
        const folderAddressObj = `./static/2userStatic/${result.id}/objs`
        const folderAddressPic = `./static/2userStatic/${result.id}/pictures`
        const folderAddressvideo = `./static/2userStatic/${result.id}/videos`
        const folderAddressScene = `./static/2userStatic/${result.id}/scenes`
        fs.mkdirSync(folderAddress); // 创建用户文件夹
        fs.mkdirSync(folderAddressObj);
        fs.mkdirSync(folderAddressPic);
        fs.mkdirSync(folderAddressvideo);
        fs.mkdirSync(folderAddressScene);
        ctx.body = '注册成功'
    }
})

// 登陆
router.post('/login', async (ctx, next) => {
    let postData = ctx.request.body
    const result = await initSequelize.handleLogin(postData)
    if (result) {
        if (result.password === postData.password) {
            sessionApp.setSession(ctx, result)
            ctx.body = result
        } else {
            ctx.body = '密码错误'
        }
    } else {
        ctx.body = '请先注册'
    }
})

// 提取用户头像
router.post('/userIcon', async (ctx, next) => {
    // sessionApp.judgeSession(ctx)
    const iconPath = ctx.request.body.userInf.headIcon
    let bitmap = fs.readFileSync(iconPath);
    let base64str = Buffer.from(bitmap, 'binary').toString('base64'); // base64编码
    ctx.body = base64str
})

// 保存图片和文字
router.post('/savePicText', async (ctx, next) => {
    const userid = sessionApp.judgeSession(ctx)

    const postData = {
        msg: ctx.request.body.msg,
        picName: ctx.request.body.picName,
        userInf: ctx.request.body.userInf,
        projectStr: ctx.request.body.projectStr
    }
    console.log('===================================')
    console.log(postData)

    postData.picName.forEach(async (item, index) => {
        const _name = ctx.request.body.picName[index]
        const picPath = `./static/2userStatic/${userid}/pictures/` + _name + '.png'
        let imgData = ctx.request.body.userInf[index]

        var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64'); // 解码图片
        fs.writeFile(picPath, dataBuffer, function (err) {
            if (err) {
                console.log(err);
            } else {
                sessionApp.judgeSession(ctx)
                console.log("图片保存成功！");
            }
        });

        let sessionResult = sessionApp.judgeSession(ctx)
        if (sessionResult) {
            postData.id = sessionResult
            postData.picPath = picPath
            const result = await initSequelize.saveWeibo(postData)
            if (result === null) {
                console.log("文字保存成功！");
                ctx.body = '保存成功'
            } else {
                ctx.body = '保存失败'
            }
        } else {
            ctx.body = '未登录'
        }
    })
})

// 查询所有微博
router.post('/getAllWeibo', async (ctx, next) => {
    function readPic(path) {
        let bitmap = fs.readFileSync(path);
        let base64str = Buffer.from(bitmap, 'binary').toString('base64'); // base64编码
        return base64str
    }

    const result = await initSequelize.getAllWeibo()
    if (result) {
        let newResult = []

        result.forEach(item => {
            let picData = readPic(item.picPath)
            let newItem = {
                msgid: item.msgid,
                userid: item.userid,
                msg: item.msg,
                picPath: item.picPath,
                picData: 'data:image/png;base64,' + picData
            }
            newResult.push(newItem)
        })
        // ctx.body = result
        ctx.body = newResult
    } else {
        ctx.body = '获取失败'
    }
})

// 测试cookie
router.get('/setMyCookie', (ctx) => {
    ctx.cookies.set(
        'fromeServer',
        'hello world',
        {
            // domain: 'http://localhost',  // 写cookie所在的域名
            path: '/',       // 写cookie所在的路径
            maxAge: 10 * 60 * 1000, // cookie有效时长
            expires: new Date('2017-02-15'),  // cookie失效时间
            httpOnly: false,  // 是否只用于http请求中获取
            overwrite: false  // 是否允许重写
        }
    )
    ctx.body = 'cookie is ok'
})

router.get('/reciveCookie', (ctx) => {
    const cookie = ctx.cookies.get(
        'testName',
    )
    if (cookie) {
        ctx.body = 'your cookie is ' + cookie
    } else {
        ctx.body = '后端获取失败'
    }
})

router.post('/postManTest', (ctx) => {
    console.log(ctx)
    ctx.body = 'postManTest ok'
})

module.exports = {router};
