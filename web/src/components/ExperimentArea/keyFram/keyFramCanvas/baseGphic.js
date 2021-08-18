/**
 * 图形基类
 */
export default class BaseGraphic {
    constructor() {
    }

    hoverAlpha() {
        let _this = this
        if (this.sp) {
            // 进入触发
            this.sp.addEventListener('mouseover', function () {
                _this.sp.alpha = 1
                if (_this.sp.father) {
                    if (_this.sp.father.helperLine) {
                        _this.sp.father.helperLine.visible = true
                    }
                }
            })
            // 离开触发
            this.sp.addEventListener('mouseout', function () {
                _this.sp.alpha = 0.5
                if (_this.sp.father) {
                    if (_this.sp.father.helperLine) {
                        _this.sp.father.helperLine.visible = false
                    }
                }
            })
        }
    }

    dragMyself() {
        let _this = this
        if (this.sp) {
            this.sp.addEventListener('pressmove', function (event) {
                _this.sp.x = event.stageX
                if (_this.sp.name === 'timeDiamond') {
                    _this.sp.father.updateTrack()
                } else if (_this.sp.name === 'TimeMarkSlider') {
                    _this.sp.father.updateStartTime()
                }

            })
        }
    }
}
