<template>
    <div id='rightToolClassSub'>
        <strong>
            环境相关
        </strong>
        <a @click="addBackgroundImg">背景图片</a>
        <a @click="addBackgroundBox">背景包围盒</a>
        <a @click="startPersonalControl">开启第一人称</a>
        <a @click="stopPersonalControl">关闭第一人称</a>
        <a @click="addShadows">开启阴影</a>
        <a @click="makePhysiSimulate">物理模拟</a>
        <a @click="addOutlineShineEffect">外轮廓高亮效果</a>

        <br>
        <br>
        <strong>
            事件
        </strong>
        <a @click="addEventCube">addEventCube</a>

        <br>
        <br>
        <strong>
            动态物质
        </strong>
        <a @click="addAnimationTest">动画小车</a>
        <a @click="startAnimatioinEditor">开启动画编辑器</a>
        <a @click="stopAnimationEditor">关闭动画编辑器</a>
        <a @click="addFlowPipe">流动管道flowPipe</a>
        <a @click="addFBX">addFBX</a>
        <a @click="startAutoRunCamera">相机自动旋转</a>
        <a @click="addSound">声音</a>
        <a @click="addWater">水纹效果</a>
        <a @click="addAdvancedMaterial">心脏 AdvancedMaterial</a>
        <a @click="addGUITest">GUI</a>
        <a @click="makeMeshPoint">点集显示</a>
        <a @click="makeMeshLine">线集显示</a>
        <a @click="makePlayVideo">makePlayVideo</a>
        <a @click="addCanvasAnimation">addCanvasAnimation</a>

        <br>
        <br>
        <strong>计算相关</strong>
        <a @click="makeCar">碰撞检测</a>
        <a @click="startTestBSP">BSP计算</a>
        <a @click="JudgeFace3">JudgeFace3</a>
        <a @click="addMatrix4Practice">addMatrix4Practice</a>
        <a @click="addEulerPractice">addEulerPractice</a>
        <a @click="addQuaternionPractice">addQuaternionPractice</a>
        <a @click="makeGeometryMesh">makeGeometryMesh</a>
        <a @click="makeBufferGeometryMesh">makeBufferGeometryMesh</a>
        <a @click="addCustomCube">Box</a>

        <br>
        <br>
        <strong>辅助查看器helper</strong>
        <a @click="makeOfflineRender">makeOfflineRender</a>
        <a @click="addCameraHelper">addCameraHelper</a>
        <a @click="addPolarGridHelper">addPolarGridHelper</a>
        <a @click="addHemisphereLightHelper">addHemisphereLightHelper</a>
        <a @click="addFaceNormalsHelper">addFaceNormalsHelper</a>
        <a @click="addVertexNormalsHelper">addVertexNormalsHelper</a>

        <strong>其他</strong>
        <a @click="dialogVisible = true">canvas</a>
        <el-dialog title="canvas绘图" :visible.sync="dialogVisible" width="90%" height="80%" >
            <Canvas class="canvasComponents"></Canvas>
        </el-dialog>

    </div>
</template>

<script>
import * as THREE from "three";
import {serverAdress} from '@/config';
import Canvas from "./Canvas/Canvas";

export default {
    components: {
        Canvas
    },
    props: {
        app3D: Object,
        required: true
    },
    data() {
        return {
            dialogVisible: false
        }
    },

    methods: {

        addAdvancedMaterial() {
            this.app3D.advancedMaterial.add()
        },

        addFlowPipe() {
            this.app3D.flowPipes.creatPipe()

        },
        addAnimationTest() {
            const mesh = serverAdress + '/3Dstatic/model3D/警车/警车/obj/policeCar.obj'
            const times = [0, 5, 10]
            const positions = [-164, 87, -0.9, -71, 87, 6.9, -71, 87, 109]
            this.app3D.animation.start(mesh, times, positions)
        },
        addGUITest() {
            this.app3D.GUI3D.start()

        },
        addCameraHelper() {
            this.app3D.helper.addCameraHelper()
        },
        startTestBSP() {
            // this.app3D.bSPCalculate.startTestBSP()

        },
        addPolarGridHelper() {
            this.app3D.helper.addPolarGridHelper()

        },
        addHemisphereLightHelper() {
            this.app3D.helper.addHemisphereLightHelper()

        },
        addFaceNormalsHelper() {
            this.app3D.helper.addFaceNormalsHelper()

        },
        addVertexNormalsHelper() {
            this.app3D.helper.addVertexNormalsHelper()

        },
        addEventCube() {
            this.app3D.eventCube.addCube()

        },
        addFBX() {
            this.app3D.FBXLoader.loadFBX("http://localhost:1111/3Dstatic/model3D/SambaDancing.fbx")
        },
        makeMeshPoint() {
            this.app3D.makeMeshPoint.start()

        },
        makeMeshLine() {
            this.app3D.makeMeshLine.start()

        },
        makePlayVideo() {
            this.app3D.playVideo.mamkeMesh()

        },
        addShadows() {
            this.app3D.shadowLight.init()

        },
        addCanvasAnimation() {
            this.app3D.canvasTexture.addMesh()

        },
        addMatrix4Practice() {
            this.app3D.matrix4Practice.start()

        },
        addEulerPractice() {
            this.app3D.eulerPractice.start()

        },
        addQuaternionPractice() {
            this.app3D.quaternionPractice.makeMesh()

        },
        addOutlineShineEffect() {
            this.app3D.outlineShineEffect.run()

        },
        makeBufferGeometryMesh() {
            this.app3D.makeBufferGeometryMesh.start()

        },
        makeGeometryMesh() {
            this.app3D.makeGeometryMesh.start()

        },
        makeOfflineRender() {
            this.app3D.offLineRender.start()

        },

        makePhysiSimulate() {
            this.app3D.physiSimulate.init()

        },
        makeCar() {
            this.app3D.car.init()

        },
        JudgeFace3() {
            this.app3D.JudgeFace3.init()

        },
        addSound() {
            this.app3D.sound.start()

        },
        addCustomCube() {
            this.app3D.addCustomCube()
        },
        startAutoRunCamera() {
            this.app3D.controls.startAutoRun()
        },

        startPersonalControl() {
            const position = new THREE.Vector3(0, 0, 0)
            const lookPosition = new THREE.Vector3(100, 100, 100)
            this.app3D.controls.startFirstPersonControls(position, lookPosition)
        },

        stopPersonalControl() {
            this.app3D.controls.stopFirstPersonControls()

        },
        addBackgroundImg() {
            this.app3D.skyBox.addJpgBackground()
        },
        addBackgroundBox() {
            this.app3D.skyBox.addSkyBox()

        },
        addWater() {
            this.app3D.waterPlane.add()
        },
        startAnimatioinEditor() {
            this.$parent.$parent.startAnimatioinEditor()
        },
        stopAnimationEditor() {
            this.$parent.$parent.stopAnimationEditor()
        }
    },
    mounted() {
        const self = this
        this.$nextTick(function () {
        })
    }
}
</script>

<style lang="less">
.canvasComponents {
    width: 100%;
    height: 100%;
}
.el-dialog__body {
    height: 500px !important;
}
#rightToolClassSub {
    display: inline;
    float: left;
    width: 275px;
    height: calc(100vh - 50px);
    border: solid #99A1A9 1px;
    overflow: auto;

    div {
        color: #7DD3CA;
    }

    a {
        color: #1890FF;
        display: block;
    }
}
</style>
