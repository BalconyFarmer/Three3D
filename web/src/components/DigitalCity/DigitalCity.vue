<!--https://www.youtube.com/watch?v=2JY8Fl5kkC0-->
<template>
    <div>
        <div id="loading" v-if="loadingFlag">
            <div id="fontContainer">
                <div>
                    <p class="pText0">Kun Ming</p>
                    <vue-loading type="bars" color="#d9544e" :size="{ width: '150px', height: '150px' }"></vue-loading>
                </div>
                <div>
                    <p class="pText">The Digital City</p>
                </div>
            </div>
        </div>
        <canvas id="digitalCityCanvasID"></canvas>

        <div id="blocker">

            <div id="instructions">
                <span style="font-size:40px">点击切换人称视角</span>
                <br/>
                <br/>
                (W, A, S, D = 移动, SPACE = 跳跃, MOUSE = 移动视角)
            </div>

        </div>
    </div>
</template>

<script>
import {DigitalCity3D} from './DigitalCity3D'
import {VueLoading} from 'vue-loading-template'

export default {
    name: 'DigitalCity',
    components: {
        VueLoading
    },
    data() {
        return {
            city3DApp: null,
            showLittleWindow: false,
            loadingFlag: false
        }
    },
    methods: {},
    mounted() {
        document.body.parentNode.style.overflow = "hidden"; // 禁用滚动条

        const dom = document.getElementById('digitalCityCanvasID')
        dom.width = window.innerWidth
        dom.height = window.innerHeight - 45

        this.city3DApp = new DigitalCity3D(dom)
        this.city3DApp.run()

        const self = this
        setTimeout(function () {
            self.loadingFlag = false
        }, 3000)
    },
    beforeDestroy() {
        this.city3DApp.destroy()
        this.city3DApp.app3D = null
        this.city3DApp = null
    }
}
</script>

<style lang="less">

@loadWidth: 100vw;
@loadHeight: 100vh;

#loading {
    z-index: 5000;
    background-color: white;
    position: absolute;
    left: calc(100vw / 2 - @loadWidth / 2);
    top: calc(100vh / 2 - @loadHeight / 2);
    width: @loadWidth;
    height: @loadHeight;
    opacity: 0.9;

    #fontContainer {
        margin-top: 300px;
        margin-left: 300px;
        top: 90px;
        font-size: 150px;

        .pText0 {
            display: inline-block;
            color: red;
            margin-bottom: 0;
            font-family: Helvetica, Arial, sans-serif;
            font-weight: 700;
            font-style: normal;
            line-height: 1.4em;
            letter-spacing: .05em;
        }

        .pText {
            color: red;
            margin-bottom: 0;
            font-family: Graphik, Helvetica, Arial, sans-serif;
            font-weight: 700;
            font-style: normal;
            line-height: 1.4em;
            letter-spacing: .05em;
        }

        .vue-loading {
            display: inline-block;
            margin-left: 100px;
        }
    }

}

#digitalCityCanvasID {
    overflow: visible !important;
    -webkit-appearance: none;
    border-radius: 0
}

#blocker {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;

    #instructions {
        width: 100%;
        height: 100%;
        display: -webkit-box;
        display: -moz-box;
        display: box;
        -webkit-box-orient: horizontal;
        -moz-box-orient: horizontal;
        box-orient: horizontal;
        -webkit-box-pack: center;
        -moz-box-pack: center;
        box-pack: center;
        -webkit-box-align: center;
        -moz-box-align: center;
        box-align: center;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
    }
}
</style>

