import * as createjs from '@createjs/easeljs'
import TimeMarks from "./TimeMarks";
import TimeBackground from './TimeBackground'
import TimeLine from "./TimeLine";
import animationData from './data/animation'

let Signal = require('signals')

export default class KeyframeApp {
    constructor(vue) {
        this.vue = vue
        this.stage = null
        this.timeMarks = null
        this.eventCenter = null
    }

    init() {
        let _this = this
        window.document.oncontextmenu = function () {
            return false
        } // 禁止右键菜单

        createjs.Ticker.timingMode = createjs.Ticker.RAF;         // RAF / RAF_SYNCHED / TIMEOUT
        createjs.Ticker.addEventListener("tick", tick);

        // createjs.Ticker.setFPS(60);
        function tick() {
            _this.stage.update()
        }

        let canvasDom = document.getElementById('canvas')
        this.stage = new createjs.Stage(canvasDom)
        createjs.Touch.enable(this.stage);
        this.stage.enableMouseOver()
        this.stage.addEventListener('click', function () {
        })

        new TimeBackground(this)
        this.timeMarks = new TimeMarks(this.stage, canvasDom, this)

        // 添加属性时间线
        let timeLines = animationData[1].children[0].children
        let count = 0
        timeLines.forEach(() => {
            let fakeTimeLong = 20 //s
            let linePosition = count * 30 + 50 // 间距 顶部距离
            let timeLine0 = new TimeLine(0, linePosition, fakeTimeLong * 100, linePosition, this)
            count += 1
            this.stage.addChild(timeLine0.container)
        })

        this.eventCenter = {
            updateDiamonds: new Signal()
        }
    }

    // 节流
    throttle(delay, action) {
        let last = 0;
        return function () {
            let curr = +new Date()
            if (curr - last > delay) {
                action.apply(this, arguments);
                last = curr;
            }
        }
    }

    // 防抖
    debounce(wait, action) {
        var timer = null;
        return function () {
            var context = this
            var args = arguments
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            timer = setTimeout(function () {
                action.apply(context, args)
            }, wait)
        }
    }
}





