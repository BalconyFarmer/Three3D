<template>
    <div id="upLoadMsg">
        <div id="container">
            <!--            <div>{{ newProject }}</div>-->
        </div>

        <div id="leftPlace">
            <NewMsgEditor :newProject='newProject'/>
        </div>

        <div id="rightTool">
            <div id="rightToolTop">
                <p>添加内容</p>
                <div class="rightToolButtons">
                    <div id="upLoadPic">
                        <a-upload
                            name="avatar"
                            list-type="picture-card"
                            class="avatar-uploader"
                            :show-upload-list="false"
                            :before-upload="beforeUpload"
                            @change="handleChange"
                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        >
                            <div>
                                <a-icon :type="loading ? 'loading' : 'plus'"/>
                            </div>
                        </a-upload>
                    </div>

                    <div>图像</div>
                </div>
                <div class="rightToolButtons" @click="addText">
                    <img :src="text">
                    <div>文字</div>
                </div>
                <div class="rightToolButtons">
                    <img :src="grid">
                    <div>照片网格</div>
                </div>
                <div class="rightToolButtons">
                    <img :src="video">
                    <div>视频和音频</div>
                </div>
                <div class="rightToolButtons">
                    <img :src="flush">
                    <div>嵌入</div>
                </div>
                <div class="rightToolButtons">
                    <img :src="lr">
                    <div>Lightroom</div>
                </div>

                <p>编辑项目</p>
                <div class="rightToolButtons">
                    <img :src="style">
                    <div>样式</div>
                </div>
                <div class="rightToolButtons">
                    <img :src="setting">
                    <div>设置</div>
                </div>
            </div>

            <div id="rightToolBottom">
                <div class="rightToolBottomInner">
                    <a-button type="primary" block shape="round" @click="savePicList">
                        继续
                    </a-button>
                </div>

                <div class="rightToolBottomInner">
                    <a-button type="primary" block shape="round">
                        保存为草稿
                    </a-button>
                </div>

                <div class="rightToolBottomInner">
                    <a-button type="primary" block shape="round">
                        预览
                    </a-button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>

import eventBus from '@/util/eventBus.js';
import {savePicListApi} from '@/api/api'
import img from '@/assets/newMsg/图片.svg';
import text from '@/assets/newMsg/文本框.svg';
import grid from '@/assets/newMsg/网格.svg';
import video from '@/assets/newMsg/video.svg';
import flush from '@/assets/newMsg/嵌入网页.svg';
import lr from '@/assets/newMsg/图片.svg';
import style from '@/assets/newMsg/样式.svg';
import setting from '@/assets/newMsg/设置.svg';
import NewMsgEditor from './NewMsgEditor';

function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

export default {
    components: {
        NewMsgEditor
    },
    data() {
        return {
            newProject: [],
            pictureBS64: [],
            pictureBS64Name: [],
            title: null,

            loading: false,
            img,
            text,
            grid,
            video,
            flush,
            lr,
            style,
            setting,

        }
    },
    methods: {
        addText() {
            const _data = {
                type: 'text',
                data: null
            }

            this.newProject.push(_data)
            if (!this.title) {
                this.title = this.newProject[this.newProject.length - 1]
            }
        },

        beforeUpload(file) {
            const self = this
            self.pictureBS64Name.push(file.name)

            let fr = new FileReader()
            // 读取成功回调函数
            fr.onload = e => {
                self.pictureBS64.push(e.target.result)
                const _data = {
                    type: 'img',
                    data: e.target.result
                }
                this.newProject.push(_data)

            }
            // 失败回调函数
            fr.onerror = e => {
                console.warn('读取图片错误!')
            }

            // 读取图片
            fr.readAsDataURL(file)

            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                this.$message.error('You can only upload JPG file!');
            }
            const isLt1M = file.size / 1024 / 1024 < 1;
            if (!isLt1M) {
                this.$message.error('Image must smaller than 1MB!');
            }
            return isJpgOrPng && isLt1M;
        },

        savePicList() {
            const newProjectStr = JSON.stringify(this.newProject)
            const obj = JSON.parse(newProjectStr);
            eventBus.emit(eventBus.TYPES.EVENT1.ADD.CONFIRM, '父组件A事件被触发了');
            if (this.title.data != '点击输入文本' && this.pictureBS64) {
                const params = {
                    msg: this.title.data,
                    picName: this.pictureBS64Name,
                    userInf: this.pictureBS64,
                    projectStr: newProjectStr
                }

                savePicListApi(params).then(response => {
                    this.$message.success(response);
                })
            } else {
                this.$message.success('未选择文件或未输入文件描述文字');
            }
        },

        handleChange(info) {
        },

        enableScroll() {
            document.body.parentNode.style.overflow = "auto";
        },

        disableScroll() {
            document.body.parentNode.style.overflow = "hidden";
        }
    },

    mounted() {
        this.enableScroll()

    },

    beforeDestroy() {
        this.disableScroll()
    }
}
</script>

<style lang="less">

body {
    background-color: #F9F9F9;
}

#upLoadMsg {

    width: calc(70vw);
    height: calc(90vh);
    position: absolute;
    left: calc((100vw - 70vw) / 2);
    margin-top: 30px;

    #leftPlace {
        width: calc(100vw / 1.8);
        height: calc(90vh);
        background-color: #ffffff;
        box-shadow: 1px 1px 1px #E5E5E5;
        display: inline-block;
        text-align: center;

        img {
            display: inline-block;
        }

        #container {
            width: 300px;
        }

        #designPicture {
            display: inline;
            height: calc(100vh / 4);
        }

    }

    #rightTool {
        display: inline-block;
        float: right;
        width: 250px;

        #rightToolTop {
            border: solid 1px #EEEEEE;
            background-color: white;

            #upLoadPic {
                display: inline-block;
                position: relative;
                width: 20px;
                height: 20px;
                background-color: #2f54eb;

                .avatar-uploader ant-upload-picture-card-wrapper {
                    width: 20px;
                    height: 20px;
                }

                .ant-upload {
                    padding: 0px;

                    ant-upload-select ant-upload-select-picture-card {
                        margin: 0px;
                    }
                }

                .avatar-uploader .ant-upload {
                    width: 5px;
                    height: 5px;
                }

                .ant-upload-select-picture-card i {
                    font-size: 20px;
                    color: #999;
                }
            }

            img {
                width: 20px;
                margin-top: 20px;
            }

            .rightToolButtons {
                display: inline-block;
                width: calc(250px / 2 - 3px);
                height: 80px;
                border: solid 1px #EEEEEE;
                text-align: center;
            }

            .rightToolButtons:hover {
                background-color: #F1F1F1;
            }

        }

        #rightToolBottom {
            margin-top: 40px;
            border: solid 1px #EEEEEE;
            box-shadow: 1px 1px 1px #E5E5E5;
            background-color: white;
            text-align: center;

            .rightToolBottomInner {
                margin-top: 20px;
                width: 170px;
                display: inline-block;
            }
        }

    }

}

</style>
