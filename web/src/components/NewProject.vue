<template>
    <div>
        <!--上传文件-->
        <div id="videoUploadContainer">
            <div>上传视频</div>
            <div class="clearfix">
                <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
                    <a-button>
                        <a-icon type="upload"/>
                        Select File
                    </a-button>
                </a-upload>

                <a-input placeholder="Say Something" v-model="videoIntroduce"/>

                <a-button
                    type="primary"
                    :disabled="fileList.length === 0"
                    :loading="uploading"
                    style="margin-top: 16px"
                    @click="handleUpload"
                >
                    {{ uploading ? 'Uploading' : 'Start Upload' }}
                </a-button>
            </div>
        </div>

        <!--        flex布局学习-->
        <div id="flexContainer">
            <div id="f1">

            </div>

            <div id="f2">

            </div>

            <div id="f3">

            </div>
        </div>

<!--        echart学习-->
        <div>

        </div>
    </div>
</template>

<script>
import {saveVideo} from '@/api/api'

export default {
    data() {
        return {
            name3D: null,
            fileList: [],
            uploading: false,
            videoIntroduce: null
        }
    },
    methods: {

        // 上传至页面
        beforeUpload(file) {
            this.fileList = [...this.fileList, file];
            return false;
        },

        // 页面删除
        handleRemove(file) {
            const index = this.fileList.indexOf(file);
            const newFileList = this.fileList.slice();
            newFileList.splice(index, 1);
            this.fileList = newFileList;
        },

        // 上传服务器
        handleUpload() {
            const {fileList} = this;
            const formData = new FormData();
            fileList.forEach(file => {
                formData.append('files[]', file);
            });
            formData.append('videoIntroduce', this.videoIntroduce);
            this.uploading = true;

            saveVideo(formData).then(response => {
                this.$message.success(response.statusText);
                this.uploading = false;
                this.fileList = []
            })
        },
    },
    mounted() {
    },
    beforeDestroy: function () {
        console.log('清除3D内存!')
    }
}
</script>

<style lang="less">
#3DContainer {

    background-color: #00B7FF;
    width: calc(50vw);

    .designePicture {
        width: 50%;
        height: 50%;
    }

    label {
        position: relative;
    }

    #fileinp {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
    }

    #fileinp0 {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
    }

    #btn {
        margin-right: 5px;
    }

    #text {
        color: red;
    }

}

#videoUploadContainer {
    background-color: #00B7FF;
    width: calc(50vw);
}

#flexContainer {
    // http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html

    width: 600px;
    height: 600px;
    border: solid 1px yellow;

    // 开启flex
    display: flex;
    //display: inline-flex; // 行内元素

    flex-direction: row;
    //flex-direction: row-reverse;
    //flex-direction: column ;
    //flex-direction: column-reverse;

    //一排放不下后的排列方式
    //flex-wrap: nowrap | wrap | wrap-reverse;
    flex-wrap: nowrap;

    //在主轴上的对齐方式
    //justify-content: flex-start | flex-end | center | space-between 平均分配 | space-around;
    justify-content: space-between;

    //交叉轴上如何对齐。
    //align-items: flex-start | flex-end | center | baseline | stretch;
    align-items: center;

    //多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用
    //align-content: flex-start | flex-end | center | space-between | space-around | stretch;

    #f1 {
        width: 100px;
        height: 100px;
        border: solid 1px yellow;
        display: inline-block;
        //order: 2; // 项目的排列顺序。数值越小，排列越靠前
        //flex-grow: 100; // 放大比例
        //flex-shrink: 50; // 缩小比例
        //flex: 1; // 缩写 grow  shrink flex-basis
    }

    #f2 {
        width: 150px;
        height: 150px;
        border: solid 1px yellow;
        //order: 0;
        //flex: 1; // 缩写 grow  shrink flex-basis
    }

    #f3 {
        width: 200px;
        height: 200px;
        border: solid 1px yellow;
        //order: 1;
        //flex: 1;
    }
}
</style>
