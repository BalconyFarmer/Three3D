<template>
    <div id='rightToolClassSub'>
        <div id='models'>
            <div draggable="true" v-for="item in listData" v-on:dragstart="dragstart(item,$event)"
                 v-on:dragend="dragend(item,$event)">
                <img :src=item.imgSrc>
                <div class="titleContainer">{{ item.name }}</div>
                <a-divider type="horizontal" dashed/>
            </div>
        </div>

        <div id="videoUploadContainer">
            <div class="clearfix">
                <a-input placeholder="OBJ Name" v-model="videoIntroduce" size="small"/>

                <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
                    <a-button size="small" type="primary">
                        <a-icon type="upload"/>
                        Select File
                    </a-button>
                </a-upload>

                <a-button
                    type="primary"
                    :disabled="fileList.length === 0"
                    :loading="uploading"
                    style="margin-top: 16px"
                    size="small"
                    @click="handleUpload"
                >
                    {{ uploading ? 'Uploading' : 'Start Upload' }}
                </a-button>
            </div>
        </div>
    </div>
</template>

<script>
import * as THREE from "three";
import {save3DModelApi} from '@/api/api'
import {getOBJList} from '@/api/api'
import {serverAdress} from '@/config';

export default {
    props: {
        app3D: Object,
        required: true
    },
    data() {
        return {
            listData: [
                {
                    name: 'Plane-Engine.obj',
                    index: serverAdress + '/3Dstatic/model3D/飞机/飞机引擎/Plane-Engine.obj',
                    imgSrc: serverAdress + '/3Dstatic/model3D/飞机/飞机引擎/Screenshot.png'
                },
                {
                    name: 'F-35 ',
                    index: serverAdress + '/3Dstatic/model3D/飞机/f-35/F-35 A Lightning II Nete.obj',
                    imgSrc: serverAdress + '/3Dstatic/model3D/飞机/f-35/Screenshot.png'
                },
                {
                    name: '0ni_Tak1mlar1/0ni_Tak1mlar1.obj',
                    index: serverAdress + '/3Dstatic/model3D/飞机/0ni_Tak1mlar1/0ni_Tak1mlar1.obj',
                    imgSrc: serverAdress + '/3Dstatic/model3D/飞机/0ni_Tak1mlar1/Screenshot.png'
                },
                {
                    name: 'varytest',
                    index: serverAdress + '/3Dstatic/model3D/飞机/varytest/无标题.obj',
                    imgSrc: serverAdress + '/3Dstatic/model3D/飞机/varytest/Screenshot.png'
                },
                {
                    name: 'ENSCAPE+MATERIALS.obj',
                    index: serverAdress + '/3Dstatic/model3D/飞机/材质预览/ENSCAPE+MATERIALS.obj',
                    imgSrc: serverAdress + '/3Dstatic/model3D/飞机/材质预览/Screenshot.png'
                },
                {
                    name: '路灯',
                    index: serverAdress + '/3Dstatic/model3D/digitalCity/2路灯/总成.obj',
                    imgSrc: ''
                }
            ],


            name3D: null,
            fileList: [],
            uploading: false,
            videoIntroduce: null,
            objResource: []
        }
    },
    methods: {
        dragstart(item, event) {

        },
        dragend(item, event) {

            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();

            this.mouse.x = (event.clientX / this.app3D.dom.width) * 2 - 1;
            this.mouse.y = -(event.clientY / this.app3D.dom.height) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.app3D.camera);

            let target = []
            this.app3D.scene.children.forEach(item => {
                target.push(item)
                if (item.type === 'Group') {
                    item.children.forEach(item => {
                        target.push(item)
                    })
                }
            })
            const intersects = this.raycaster.intersectObjects(target);

            if (intersects[0]) {
                if (intersects[0].point) {
                    const vec3 = intersects[0].point
                    console.warn('intersects[0].point', intersects[0].point)
                    this.app3D.objLoaders.loadOBJ(item.index, item.name, vec3)
                }
            }

        },
        getMyOBJResource() {
            getOBJList().then(response => {
                this.objResource = response.data
                this.objResource.forEach(item => {
                    this.listData.push({
                        name: item.objname,
                        index: item.objpath.replace('./static', serverAdress + ''),
                        imgSrc: ''
                    })
                })
            })
        },
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

            const self = this
            save3DModelApi(formData).then(response => {
                if (response.status === 200) {
                    this.$message.success(response.data);
                    self.getMyOBJResource()
                } else {
                    this.$message.success('status', response.status);
                }
                this.uploading = false;
                this.fileList = []
            })
        }
    },
    mounted() {
        this.getMyOBJResource()
        console.log('清除3D内存!')
    }
}
</script>

<style lang="less">
#rightToolClassSub {
    display: inline;
    float: left;
    width: 275px;
    height: calc(100vh - 50px);
    border: solid #99A1A9 1px;
    color: #7DD3CA;

    #models {
        height: 500px;
        overflow: auto;

        img {
            width: 50px;
            height: 50px;
        }

        .titleContainer {
            display: inline-block;
            height: 50px;
        }

        .ant-divider-horizontal {
            display: block;
            clear: both;
            width: 100%;
            min-width: 100%;
            height: 1px;
            margin: 1px 0;
        }
    }

    #videoUploadContainer {
        background-color: #3C3F41;
        overflow: auto;
    }

}
</style>
