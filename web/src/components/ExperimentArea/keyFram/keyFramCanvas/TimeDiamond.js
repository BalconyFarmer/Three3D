/**
 * 时间线上的关键帧 圆
 */
import * as createjs from "@createjs/easeljs"
import TimeDiamondTrack from "./TimeDiamondTrack";
import BaseGraphic from "./baseGphic";

export default class TimeDiamond extends BaseGraphic {
    constructor(x, y, timeLine) {
        super()
        this.helperLine = null
        this.time = 0
        this.app = timeLine.app
        this.timeLine = timeLine
        this.x = x
        this.y = y
        this.sp = null
        this.init()
        this.hoverAlpha()
        this.dragMyself()
    }

    init() {
        let _this = this
        this.sp = new createjs.Shape()
        this.sp.graphics.beginFill('yellow').drawCircle(0, 0, 9).endFill()
        this.sp.x = this.x
        this.sp.y = this.y
        this.sp.alpha = 0.5
        this.sp.father = this
        this.sp.name = 'timeDiamond'
        this.sp.addEventListener('dblclick', function () {
            console.log('我的时间', _this.time)
        })
        this.time = this.app.timeMarks.pixelToTime(this.sp.x)
        this.app.eventCenter.updateDiamonds.add(this.updateSelf, this)
    }

    initHelperLine() {
        this.helperLine = new createjs.Shape()
        // this.helperLine.graphics.s("white").setStrokeStyle(1).mt(this.sp.x,this.sp.y).lt(this.sp.x,0).es();
        this.helperLine.graphics.s("white").setStrokeStyle(1).mt(0, this.sp.y).lt(0, 0).es();
        this.helperLine.x = this.sp.x
        this.helperLine.alpha = 0.5
        this.sp.parent.addChild(this.helperLine)
        this.helperLine.visible = false
    }

    // 更新track
    updateTrack() {
        this.cleanTracks()
        let container = this.sp.parent
        let allDiamonds = []
        container.children.forEach(item => {
            if (item.name === 'timeDiamond') {
                allDiamonds.push(item)
            }
        })

        function compare(p) { //这是比较函数
            return function (m, n) {
                var a = m[p];
                var b = n[p];
                return a - b; //升序
            }
        }

        allDiamonds.sort(compare('x'))
        allDiamonds.forEach((item, index) => {
            if (index < allDiamonds.length - 1) {
                let timeDiamondTrack = new TimeDiamondTrack(this.app.stage, item.y, item.x, allDiamonds[index + 1].x)
                container.addChild(timeDiamondTrack.sp)
            }
        })

        // 更新层级
        let length = container.children.length
        container.children.forEach((item, index) => {
            if (item.name != 'timeDiamond') {
                item.parent.setChildIndex(item, length - index)
            }
        })
    }

    // 清除track
    cleanTracks() {
        let container = this.sp.parent
        container.children.forEach(item => {
            if (item.name === 'TimeDiamondTrack') {
                container.removeChild(item)
            }
        })
    }

    updateSelf() {
        let _this = this
        // this.time = this.app.timeMarks.pixelToTime(this.sp.x)
        this.helperLine.x = this.sp.x

        function update() {
            let x = _this.app.timeMarks.timeToPixel(_this.time)
            _this.sp.x = x
            _this.updateTrack()
        }

        this.app.throttle(16, update())
    }
}
