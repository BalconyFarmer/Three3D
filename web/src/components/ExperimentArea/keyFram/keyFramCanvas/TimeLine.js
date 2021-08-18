/**
 * 每个属性的灰色时间线
 */
import * as createjs from "@createjs/easeljs"
import BaseGraphic from "./baseGphic";
import TimeDiamond from "./TimeDiamond";

export default class TimeLine extends BaseGraphic {
    constructor(x, y, toX, toY, app) {
        super()
        this.app = app
        this.x = x
        this.y = y
        this.toX = toX
        this.toY = toY
        this.sp = null
        this.container = new createjs.Container()
        this.init()
        this.hoverAlpha()
    }

    init() {
        const _this = this
        this.sp = new createjs.Shape();
        this.sp.graphics.s("white").setStrokeStyle(5).mt(0, 0).lt(this.toX, 0).es();
        this.sp.y = this.toY
        this.sp.alpha = 0.5
        this.sp.name = '底层时间线'
        this.container.addChild(this.sp)
        this.sp.father = this

        this.sp.addEventListener('dblclick', function (event) {
            _this.makeTimeDiamond(event)
        })
    }

    makeTimeDiamond(event) {
        let diamond = new TimeDiamond(event.stageX, event.stageY, this, this.container)
        this.container.addChild(diamond.sp)
        diamond.initHelperLine()
        const timeLiner = this.container.getChildByName('底层时间线')
        diamond.sp.y = timeLiner.y
        diamond.updateTrack()
    }
}
