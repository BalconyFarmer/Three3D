<template>
    <div id="experimentAreaAll">
        <canvas id="3dCanvas" width="800px" height="800px"></canvas>
        <ExperimentAreaLeft :app3D='app3D'></ExperimentAreaLeft>
        <ExperimentAreaCenter :app3D='app3D'></ExperimentAreaCenter>
        <ExperimentAreaRight :app3D='app3D'></ExperimentAreaRight>
        <KeyFram v-if="animationEditor"></KeyFram>
        <DigitalCityLittleWindow :app3D='app3D' v-if="showLittleWindow"></DigitalCityLittleWindow>
    </div>
</template>

<script>
import App3D from "../../threeD/App3D";
import axesSvg from '@/assets/axes.svg';
import statsSvg from '@/assets/stats.svg';
import grideLineSvg from '@/assets/网格.svg';
import bottomSee from '@/assets/俯视图.svg';
import leftSee from '@/assets/左视图.svg';
import transformMesh from '@/assets/移动.svg';
import lightIcon from '@/assets/灯.svg';
import ExperimentAreaLeft from './ExperimentAreaLeft'
import ExperimentAreaRight from './ExperimentAreaRight'
import KeyFram from './keyFram/KeyFram.vue'
import ExperimentAreaCenter from './ExperimentAreaCenter'
import DigitalCityLittleWindow from './DigitalCityLittleWindow'

export default {
    components: {
        ExperimentAreaLeft,
        ExperimentAreaCenter,
        ExperimentAreaRight,
        KeyFram,
        DigitalCityLittleWindow
    },
    data() {
        return {
            axesSvg,
            statsSvg,
            grideLineSvg,
            bottomSee,
            leftSee,
            transformMesh,
            lightIcon,

            axesFlag: false,
            statsFlag: false,
            grideLineFlag: false,
            transformFlag: false,
            cameraLookBottomFlag: false,
            cameraLookRightFlag: false,
            startLightHelperFlag: false,

            meshData: {
                type: null,
                matrix: [],
                matrixWorld: [],
                euler: {
                    x: null,
                    y: null,
                    z: null,
                    order: null
                },
                Quaternion: {
                    x: null,
                    y: null,
                    z: null,
                    w: null
                },
                scale: {
                    x: null,
                    y: null,
                    z: null
                },
                position: {
                    x: null,
                    y: null,
                    z: null
                },
                rotation: null,
            },

            app3D: null,
            showLittleWindow: false,
            animationEditor: false

        }
    },
    methods: {
        onChangeMesh(event) {
            console.log("event.message", event.message)

            this.meshData.type = event.message.type
            this.meshData.matrix = []
            event.message.matrix.elements.forEach(item => {
                this.meshData.matrix.push(item.toFixed(2))
            })

            this.meshData.matrixWorld = []
            event.message.matrixWorld.elements.forEach(item => {
                this.meshData.matrixWorld.push(item.toFixed(2))
            })

            this.meshData.euler.x = event.message.rotation._x.toFixed(2)
            this.meshData.euler.y = event.message.rotation._y.toFixed(2)
            this.meshData.euler.z = event.message.rotation._z.toFixed(2)
            this.meshData.euler.order = event.message.rotation.order

            this.meshData.Quaternion.x = event.message.quaternion.x.toFixed(2)
            this.meshData.Quaternion.y = event.message.quaternion.y.toFixed(2)
            this.meshData.Quaternion.z = event.message.quaternion.z.toFixed(2)
            this.meshData.Quaternion.w = event.message.quaternion.w.toFixed(2)

            this.meshData.scale.x = event.message.scale.x.toFixed(2)
            this.meshData.scale.y = event.message.scale.y.toFixed(2)
            this.meshData.scale.z = event.message.scale.z.toFixed(2)

            this.meshData.position.x = event.message.position.x.toFixed(2)
            this.meshData.position.y = event.message.position.y.toFixed(2)
            this.meshData.position.z = event.message.position.z.toFixed(2)

        },

        startLittleWindow() {
            this.showLittleWindow = true
            this.$nextTick(function () {
                const littleWindowDom = document.getElementById('littleWindowCanvas0')
                const littleWindowContainer = document.getElementById('littleWindowContainer')
                const height = littleWindowContainer.clientHeight
                const width = littleWindowContainer.clientWidth
                littleWindowDom.height = height - 30
                littleWindowDom.width = width

                this.app3D.littleWindow.addCasterEvent(littleWindowDom)
            })
        },

        stopLittleWindow() {
            this.app3D.littleWindow.destroy()
            this.showLittleWindow = false
        },

        startAnimatioinEditor() {
            this.animationEditor = true
        },

        stopAnimationEditor() {
            this.animationEditor = false
        },

        promiseTest() {
            const myFirstPromise = new Promise(function (resolve, reject) {
                //当异步代码执行成功时，我们才会调用resolve(...), 当异步代码失败时就会调用reject(...)
                //在本例中，我们使用setTimeout(...)来模拟异步代码，实际编码时可能是XHR请求或是HTML5的一些API方法.
                setTimeout(function () {
                    resolve("成功!"); //代码正常执行！
                }, 1250);
            });

            myFirstPromise.then(function (successMessage) {
                //successMessage的值是上面调用resolve(...)方法传入的值.
                //successMessage参数不一定非要是字符串类型，这里只是举个例子
                console.log("Yay! " + successMessage);
            });
        },

        asyncAwaitTest() {
            function sleep(second) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(' enough sleep~');
                    }, second);
                })
            }

            function normalFunc() {
                console.log('normalFunc');
            }

            async function awaitDemo() {
                await normalFunc();
                console.log('something, ~~');
                let result = await sleep(2000);
                console.log(result);// 两秒之后会被打印出来
            }

            awaitDemo();
        }
    },
    mounted() {
        document.body.parentNode.style.overflow = "hidden"; // 禁用滚动条

        const dom = document.getElementById('3dCanvas')
        dom.width = window.innerWidth
        dom.height = window.innerHeight - 45
        this.app3D = new App3D(dom)
        this.app3D.init()
        this.app3D.eventBus.addEventListener('changeMesh', this.onChangeMesh.bind(this))

        window.addEventListener('resize', this.app3D.windowRelise.bind(this.app3D), false);

        this.promiseTest()
        this.asyncAwaitTest()
    },
    beforeDestroy() {
        this.app3D.destroy()
        this.app3D = null
    }
}
</script>

<style lang="less">

#experimentAreaAll {
    #3dCanvas {
    }

    #rightContainer {
        position: absolute;
        top: 46px;
        left: calc(100vw - 300px);

        width: 300px;
        height: auto;

        #mathViewer0 {
            display: inline-block;
        }
    }
}


</style>
