/**
 * 关键帧轨道
 * @params
 * stage 舞台对象
 * height y轴坐标
 * start开始关键帧
 * end 结束关键帧
 */
import * as createjs from "@createjs/easeljs";
import BaseGraphic from "./baseGphic";

export default class TimeDiamondTrack extends BaseGraphic {
    constructor(stage, height, start, end, container) {
        super()
        this.container = container
        this.sp = null
        this.start = start
        this.end = end
        this.stage = stage
        this.height = height
        this.init()
        this.makeTrackPoint()
        this.hoverAlpha()
    }

    init() {
    }

    makeTrackPoint() {
        const _this = this
        this.sp = new createjs.Shape();
        this.sp.graphics.s("blue").setStrokeStyle(9).mt(this.start, this.height).lt(this.end, this.height).es();
        this.sp.alpha = 0.5
        this.sp.name = 'TimeDiamondTrack'
        this.sp.addEventListener('dblclick', function (event) {
            let timeLine = _this.sp.parent.getChildByName('底层时间线')
            timeLine.father.makeTimeDiamond(event)
        })
    }
}
