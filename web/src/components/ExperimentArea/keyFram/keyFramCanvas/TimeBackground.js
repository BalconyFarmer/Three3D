/**
 * 背景
 */
import * as createjs from "@createjs/easeljs";

export default class TimeBackground {
    constructor(app) {
        this.app = app
        this.stage = app.stage
        this.init()
    }

    init() {
        let _this = this
        let rect = new createjs.Shape();
        rect.graphics.beginFill(" #202123").drawRect(0, 0, 1900, 200);
        rect.x = 0;
        rect.y = 0;
        this.stage.addChild(rect);
        rect.addEventListener('click', function (event) {
            _this.app.timeMarks.moveToPointer(event)
        })

        rect.addEventListener('pressmove', function (event) {
            _this.app.timeMarks.moveToPointer(event)
        })
    }
}
