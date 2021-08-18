/**
 * 刻度滑块
 */
import * as createjs from "@createjs/easeljs"
import BaseGraphic from "./baseGphic";

export default class TimeMarkSlider extends BaseGraphic {
    constructor(timeMarks) {
        super()
        this.sp = null
        this.init()
        this.hoverAlpha()
        this.dragMyself()
        this.timeMarks = timeMarks
    }

    init() {
        this.sp = new createjs.Shape();
        this.sp.graphics.beginFill("#1890FF").drawRect(0, 0, 38, 19)
        this.sp.alpha = 0.5
        this.sp.name = 'TimeMarkSlider'
        this.sp.father = this
    }

    updateStartTime() {
        this.timeMarks.startTime = this.sp.x
    }
}
