/**
 * 整体拖拽
 */
export default class ViewMove {
    constructor(originObj, targetObj) {
        this.originObj = originObj
        this.targetObj = targetObj
        // this.init()
        this.downPositonX = null
        this.downPositonY = null
        this.downFlag = false
    }

    init() {
        let _this = this
        this.originObj.addEventListener('mousedown', (event) => {
            _this.downFlag = true
            _this.downPositonX = event.clientX
            _this.downPositonY = event.clientY
        })
        this.originObj.addEventListener('mousemove', () => {
            if (_this.downFlag) {
                let oldLeft = parseInt(window.getComputedStyle(_this.targetObj, null)["left"])
                let oldTop = parseInt(window.getComputedStyle(_this.targetObj, null)["top"])
                _this.targetObj.style.left = (event.clientX - _this.downPositonX + oldLeft).toString() + 'px'
                _this.targetObj.style.top = (event.clientY - _this.downPositonY + oldTop).toString() + 'px'
                _this.downPositonX = event.clientX
                _this.downPositonY = event.clientY
            }
        })
        this.originObj.addEventListener('mouseup', () => {
            _this.downFlag = false
            _this.downPositonX = 0
            _this.downPositonY = 0
        })
    }
}
