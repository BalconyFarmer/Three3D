import * as THREE from "three";

// 滑块
export class SliderCanvas {
    constructor(width, height, content) {
        this.virtualCanvas = null
        this.ctx = null
        this._width = width
        this._height = height
        this.text = content
        this.sliderTrackHeight = this._height / 2
        this.sliderPosition = 0
        this.mouseDownFlag = false
        this.mousePosition = new THREE.Vector2()
        this._fontColor = "#7AC7E1"
        this._backgroundColor = "#051016"

        this.initDom()
        this.draw()
        this.addEvent()
    }

    initDom() {
        this.virtualCanvas = document.createElement('canvas')
        this.virtualCanvas.width = this._width
        this.virtualCanvas.height = this._height
        this.ctx = this.virtualCanvas.getContext("2d")  // getWebglContext 3D
    }

    draw() {

        // 滑块轨道
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(0, this.sliderTrackHeight / 2, this._width, this.sliderTrackHeight);

        // 滑块
        this.ctx.beginPath()
        this.ctx.moveTo(this.sliderPosition, 0)
        this.ctx.lineTo(this._width / 10 + this.sliderPosition, 0)
        this.ctx.lineTo(this._width / 10 + this.sliderPosition, this._height)
        this.ctx.lineTo(this.sliderPosition, this._height)
        this.ctx.fillStyle = this._fontColor
        this.ctx.fill()
        this.ctx.closePath()

        // border
        this.ctx.strokeStyle = this._fontColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this._width, this._height);

    }

    atMouseDown(e) {
        const canvasInfo = this.virtualCanvas.getBoundingClientRect()
        const x = e.clientX - canvasInfo.left
        const y = e.clientY - canvasInfo.top
        const casterResult = this.ctx.isPointInPath(x, y)
        if (casterResult) {
            this.mouseDownFlag = true
            this.mousePosition.x = x
            this.mousePosition.y = x
        }
    }

    onMouseMove(e) {
        if (this.mouseDownFlag) {
            const canvasInfo = this.virtualCanvas.getBoundingClientRect()
            this.sliderPosition = (e.clientX - canvasInfo.left)
            this.clear()
            this.draw()
        }
    }

    atMouseUp() {
        this.mouseDownFlag = false
        this.mousePosition.x = 0
        this.mousePosition.y = 0
    }

    addEvent() {
        const self = this
        this.virtualCanvas.addEventListener('mousedown', function (e) {
            self.atMouseDown.bind(self)(e)
        })
        this.virtualCanvas.addEventListener('mousemove', function (e) {
            self.onMouseMove.bind(self)(e)
        })
        this.virtualCanvas.addEventListener('mouseup', function (e) {
            self.atMouseUp.bind(self)(e)
        })
    }

    clear() {
        this.ctx.clearRect(0, 0, this.virtualCanvas.width, this.virtualCanvas.height)
    }
}
