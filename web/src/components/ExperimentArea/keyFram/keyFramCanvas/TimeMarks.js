/**
 * 时间刻度表 和 指针
 */
import * as createjs from "@createjs/easeljs"
import TWEEN from "@tweenjs/tween.js";
import TimeMarkSlider from './TimeMarksSlider'

export default class TimeMarks {
    constructor(stage, dom, app) {
        this.app = app
        this.dom = dom
        this.sliderSpace = 20 // slider所占高度
        this.slider = null

        this.marksCount = 200        // 显示总刻度数量 (大于可视数量即可)
        this._timesPerPixel = 0.01   // default->0.01 max->0.02 min->0.0002 ////////////
        this.markSpace = 10          // 最小刻度间距像素间距 5
        this._startTime = 0          // 左侧开始时间点                       /////////////

        this.tween = null
        this.pointerContainer = null
        this.stage = stage
        this.loopTimeS = 3           // 总时长 120
        this.loopDistance = this.loopTimeS / this._timesPerPixel
        this.pointerTime = null

        this.drawMark()
        this.makePointer()
        this.initTween()
        this.initSlider()
        this.initCenterWheel()
    }

    set startTime(pixel) {
        this._startTime = pixel * this._timesPerPixel
        this.app.throttle(16, this.drawMark())
        this.app.eventCenter.updateDiamonds.dispatch()
        this.app.throttle(16, this.updatePointer())
        this.loopDistance = this.loopTimeS / this._timesPerPixel
    }

    get startTime() {
        return this._startTime
    }

    set timesPerPixel(value) {
        this._timesPerPixel = value
        this.app.eventCenter.updateDiamonds.dispatch()
        this.app.throttle(16, this.updatePointer())
        this.loopDistance = this.loopTimeS / this._timesPerPixel
    }

    get timesPerPixel() {
        return this._timesPerPixel
    }

    initCenterWheel() {
        let _this = this
        this.dom.addEventListener('mousewheel', function (event) {
            _this.drawMark()
            if (event.wheelDelta > 0) {
                if (_this.timesPerPixel < 0.02) {
                    _this.timesPerPixel = _this.timesPerPixel + 0.001
                }
            } else {
                if (_this.timesPerPixel > 0.0003) {
                    _this.timesPerPixel = _this.timesPerPixel - 0.0002
                }
            }
        })
    }

    initSlider() {
        this.slider = new TimeMarkSlider(this)
        this.stage.addChild(this.slider.sp)
    }

    initTween() {
        function animate() {
            TWEEN.update();
            requestAnimationFrame(animate);
        }

        animate();
    }

    drawMark() {
        if (this.stage.getChildByName('marksContainer')) {
            this.stage.removeChild(this.stage.getChildByName('marksContainer'))
        }
        let marksContainer = new createjs.Container()
        marksContainer.name = 'marksContainer'
        for (let i = 0; i < this.marksCount; i++) {
            if (i % 5 === 0) {
                let shape = new createjs.Shape();
                shape.graphics.s("white").ss(1).mt(0, 0).lt(0, 10).es();
                shape.x = i * this.markSpace
                shape.y = this.sliderSpace
                marksContainer.addChild(shape)

                let markTime = shape.x * this._timesPerPixel + this._startTime
                let markTimeString = this.timeFormatMS(markTime)
                let markText = new createjs.Text(markTimeString, "9px Arial", "white");
                markText.x = shape.x - 13
                markText.y = shape.y + 12
                marksContainer.addChild(markText)
            } else {
                let shape = new createjs.Shape();
                shape.graphics.s("white").ss(1).mt(0, 0).lt(0, 5).es();
                shape.x = i * this.markSpace
                shape.y = this.sliderSpace
                marksContainer.addChild(shape)
            }
        }
        this.stage.addChild(marksContainer);
    }

    makePointer() {
        this.pointerContainer = new createjs.Container()
        let shape = new createjs.Shape();
        shape.graphics.s("yellow").ss(1.5).mt(0, 0).lt(0, 150).es() //指针
        let nowTime = new createjs.Text("", "9px Arial", "yellow"); //指针字
        nowTime.name = '指针坐标'
        nowTime.x = -12
        nowTime.y = 160
        this.pointerContainer.addChild(shape, nowTime)
        this.stage.addChild(this.pointerContainer);
        this.runPointer(0, this.loopTimeS)
    }

    /**
     * 动画指针位置
     * @param nowTime
     * @param targetTime
     */
    transitionPointer(object, nowTime, targetTime) {
        let _this = this
        if (this.tween) {
            // TWEEN.get(object, null, true); // this will remove any existing tweens on the target.
            TWEEN.removeAll()
            // this.tween.stop()
        }

        this.tween = new TWEEN.Tween(object);
        // const nowPosition = pointerTime / 1000 * 10
        const nowPosition = this.timeToPixel(nowTime)
        object.x = nowPosition
        const targetPosition = this.timeToPixel(targetTime)
        const interval = (targetTime - nowTime) * 1000

        this.tween.to({x: targetPosition}, interval);
        // this.tween.easing(TWEEN.Easing.Quadratic.In); // 缓动
        // this.tween.easing(TWEEN.Easing.Quadratic.Out); // 缓动
        // this.tween.repeat(Infinity); // 无限循环
        this.tween.onUpdate(function (obj) {
            const nowTime = _this.pixelToTime(obj.x)
            const displayTime = _this.timeFormatMS(nowTime)
            obj.getChildByName('指针坐标').text = displayTime
            _this.pointerTime = nowTime
        });

        // 归零
        let tweenNext = new TWEEN.Tween(object)
        tweenNext.to({x: 0}, 10) // this.allWidth / 10 * 1000
        tweenNext.onUpdate(() => {
            // const pointerTime = _this.pixelToTime(object.x)
            // const displayTime = _this.timeFormatMS(pointerTime)
            // object.getChildByName('指针坐标').text = displayTime
        })

        // 从零开始 无限循环
        let tweenNextNext = new TWEEN.Tween(object)
        // let loopTime = targetPosition /
        tweenNextNext.to({x: this.loopDistance}, this.loopTimeS * 1000)
        tweenNextNext.onUpdate((object) => {
            const pointerTime = _this.pixelToTime(object.x)
            const displayTime = _this.timeFormatMS(pointerTime)
            object.getChildByName('指针坐标').text = displayTime
            _this.pointerTime = pointerTime
        })
        tweenNextNext.repeat(Infinity)

        this.tween.chain(tweenNext)
        tweenNext.chain(tweenNextNext)

        this.tween.start();

    }

    runPointer(nowTime, targetTime) {
        if (typeof nowTime === 'undefined') {
            nowTime = this.pointerTime
        }
        if (typeof targetTime === 'undefined') {
            targetTime = this.loopTimeS
        }
        this.transitionPointer(this.pointerContainer, nowTime, targetTime)
    }

    // 停止指针
    turnOffPointer() {
        this.tween.stop();
        this.pointerTime = this.pixelToTime(this.pointerContainer.x)
    }

    // 指定指针
    turnOnPointer() {
        this.runPointer(this.pointerTime)
    }

    // 重置指针
    resetPointer() {
        this.runPointer(0)
    }


    updatePointer() {
        TWEEN.removeAll()
        this.pointerContainer.x = this.timeToPixel(this.pointerTime)
    }

    // 移动指针到XX
    moveToPointer(event) {
        let timeS = this.pixelToTime(event.stageX)
        this.pointerTime = timeS
        this.updatePointer()
        const displayTime = this.timeFormatMS(timeS)
        this.pointerContainer.getChildByName('指针坐标').text = displayTime
        // this.runPointer(timeS)
    }

    /**
     * 格式化当前时间 最小单位S
     * @param origin S
     * @returns {string}
     */
    timeFormatS(origin) {
        const second = parseInt(origin % 60)
        const minute = parseInt(origin / 60)
        if (parseInt(second / 10) === 0) {
            return minute.toString() + ':' + '0' + second.toString()
        }
        return minute.toString() + ':' + second.toString()
    }

    /**
     * 最小单位MS
     * @param origin S
     * @returns {string}
     */
    timeFormatMS(origin) {
        if (origin) {
            let result0
            let str = this.timeFormatS(origin)
            const dotIndex = origin.toString().indexOf('.')
            if (dotIndex >= 0) {
                const firstNumber = origin.toString().slice(dotIndex + 1, dotIndex + 2)
                const secondNum = origin.toString().slice(dotIndex + 2, dotIndex + 3)
                result0 = origin.toString().slice(dotIndex + 1, dotIndex + 3)
                if (firstNumber === '') {
                    result0 += '0'
                }
                if (secondNum === '') {
                    result0 += '0'
                }
                return str + ':' + result0
            } else {
                return str + ':00'
            }

        }
    }

    /**
     * 计算当前时间
     * @param pixel x坐标
     */
    pixelToTime(pixel) {
        let nowTime = this._startTime + pixel * this._timesPerPixel
        if (nowTime) {
            return nowTime
        }
    }

    /**
     * 计算当前位置
     * @param time
     * @returns {number}
     */
    timeToPixel(time) {
        let positionTime = time - this._startTime
        const position = positionTime / this.timesPerPixel
        return position
    }
}
