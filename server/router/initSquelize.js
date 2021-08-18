const {Sequelize, Model, DataTypes} = require('sequelize')

/**
 * 数据库操作类
 */
class initSquelize {
    constructor() {
        this.UserModel = null
        this.a = this.init()
    }

    async init() {
        // 链接数据库
        const sequelize = new Sequelize('db_behance', 'root', '1234', {
            host: 'localhost',
            dialect: 'mysql'
        });

        try {
            await sequelize.authenticate();
            console.log('数据库连接成功');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

        // 定义用户模型
        this.UserModel = sequelize.define('normalusers', {
            id: {
                type: DataTypes.INTEGER(),
                autoIncrement: true,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            password: DataTypes.STRING,
            headIcon: DataTypes.STRING
        }, {
            timestamps: false // 开启/关闭事件戳
        })

        // 定义微博模型
        this.UserMsgModel = sequelize.define('weibomsgs', {
            msgid: {
                type: DataTypes.INTEGER(),
                autoIncrement: true,
                primaryKey: true,
            },
            userid: DataTypes.STRING,
            msg: DataTypes.STRING,
            picPath: DataTypes.STRING
        }, {
            timestamps: false // 开启/关闭事件戳
        })

        // 视频
        this.VideoModel = sequelize.define('videos', {
            videoid: {
                type: DataTypes.INTEGER(),
                autoIncrement: true,
                primaryKey: true,
            },
            userid: DataTypes.INTEGER(),
            videoname: DataTypes.STRING,
            videopath: DataTypes.STRING
        }, {
            timestamps: false // 开启/关闭事件戳
        })

        // obj
        this.OBJModel = sequelize.define('objs', {
            objid: {
                type: DataTypes.INTEGER(),
                autoIncrement: true,
                primaryKey: true,
            },
            userid: DataTypes.INTEGER(),
            objname: DataTypes.STRING,
            objpath: DataTypes.STRING
        }, {
            timestamps: false // 开启/关闭事件戳
        })
    }

    async handleRegist(postData) {
        let result = await this.handleLogin(postData)
        if (result) {
            return null
        } else {
            const result = await this.UserModel.create({
                name: postData.name,
                password: postData.password,
                headIcon: './static/3Dstatic/defaultPortrait.png'
            })
            return result
        }
    }

    async handleLogin(postData) {
        const self = this
        const result = await this.UserModel.findAll({
            where: {
                name: postData.name
            }
        })
        if (result[0]) {
            return result[0].dataValues
        } else {
            return
        }
    }

    async saveWeibo(postData) {
        if (postData.picPath) {
            const result = await this.UserMsgModel.create({
                userid: postData.id,
                msg: postData.msg,
                picPath: postData.picPath
            })
        } else {
            const result = await this.UserMsgModel.create({
                userid: postData.id,
                msg: postData.msg,
            })
            return result

        }
    }

    async getAllWeibo() {
        const result = await this.UserMsgModel.findAll()
        return result
    }

    async saveVideo(postData) {
        const result = await this.VideoModel.create({
            userid: postData.userid,
            videoname: postData.videoname,
            videopath: postData.videopath
        })
        return result
    }

    async saveOBJ(postData) {
        const result = await this.OBJModel.create({
            userid: postData.userid,
            objname: postData.objname,
            objpath: postData.objpath
        })
        return result
    }

    async getMyOBJResource(postData) {
        const result = await this.OBJModel.findAll()
        return result
    }

}

module.exports = {initSquelize}

