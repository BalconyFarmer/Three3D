<template>
    <div id="keyFrame" ref="frame">
        <div id="header" ref="header">
            <div id="buttons">
                <a-icon type="pause-circle" @click="turnOffPointer" style="color: white"/>
                <a-icon type="play-circle" @click="turnOnPointer" style="color: white"/>
                <a-icon type="rollback" @click="resetPointer" style="color: white"/>
            </div>
        </div>

        <div id="animationTree">
            <KeyFrameLeft></KeyFrameLeft>
        </div>

        <div id="canvasDiv">
            <canvas id="canvas" ref="canvas"></canvas>
        </div>

        <div id="properEditor">
            <KeyFrameRight></KeyFrameRight>
        </div>
    </div>
</template>

<script>
import KeyframeApp from './keyFramCanvas/main'
import ViewMove from './keyFramCanvas/ViewMove'
import KeyFrameLeft from "./KeyFrameLeft";
import KeyFrameRight from './keyFrameRight'

export default {
    name: 'KeyFram',
    components: {
        KeyFrameLeft,
        KeyFrameRight
    },
    props: {
        message: String
    },
    data() {
        return {
            keyframeApp: null,
            domCanvas: null,
            domHeader: null,
            domFrame: null
        }
    },

    methods: {
        turnOnPointer() {
            this.keyframeApp.timeMarks.turnOnPointer()
        },
        turnOffPointer() {
            this.keyframeApp.timeMarks.turnOffPointer()
        },
        resetPointer() {
            this.keyframeApp.timeMarks.resetPointer()
        },
        updateCanvasSize() {
            const canvasDom = document.getElementById('canvas')
            const outLeftRight = 600
            const innerLeftRight = 300 + 3
            canvasDom.width = document.body.clientWidth - innerLeftRight - outLeftRight
            canvasDom.height = 200
        }
    },
    mounted() {
        this.$nextTick(function () {
            this.domCanvas = this.$refs['canvas']
            this.domHeader = this.$refs['header']
            this.domFrame = this.$refs['frame']
            this.keyframeApp = new KeyframeApp(this)
            this.keyframeApp.init()
            let a = new ViewMove(this.domHeader, this.domFrame)
            a.init()

            this.updateCanvasSize()
        })
    }
}
</script>

<style lang="less" scoped>
@import 'css/keyFrameStyle.less';
@import '../../0main.less';

@height: 220px;

#keyFrame {
    z-index: 1001;
    position: absolute;
    top: calc(100vh - 220px);
    left: 300px;
    background-color: #363062;;
    width: calc(100vw - 600px);
    height: @height;
    border: solid #99A1A9 1px;

    #header {
        background-color: @outer;
    }

    #animationTree {
        overflow: auto;
        position: relative;
        background-color: @center;
        float: left;
        width: 150px;
        height: @height;
    }


    #canvasDiv {
        float: left;
    }

    #properEditor {
        float: right;
        background-color: @center;
        width: 150px;
        height: @height;
    }

    #buttons {
        /*float: left;*/
        left: 0px;
        width: 150px;
    }
}


</style>
