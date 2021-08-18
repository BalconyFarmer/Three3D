export class ImgCanvas {
    constructor(width, height, imgUrl, imgMeshApp) {
        this.imgMeshApp = null
        if (imgMeshApp) {
            this.imgMeshApp = imgMeshApp
        }
        this.virtualCanvas = null
        this.ctx = null
        this._width = width
        this._height = height
        this.imgurl = imgUrl
        this._fontColor = "#7AC7E1"

        this.initDom()
        this.draw()
        this.addEvent()
    }

    initDom() {
        this.virtualCanvas = document.createElement('canvas')
        this.virtualCanvas.width = 100
        this.virtualCanvas.height = 90
        this.ctx = this.virtualCanvas.getContext("2d")

        const self = this
        this.imgurl.onload = function () {
            self.draw()
        }
    }

    draw() {
        this.ctx.drawImage(this.imgurl, 0, 0);
        // border
        this.ctx.strokeStyle = this._fontColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this._width, this._height);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.virtualCanvas.width, this.virtualCanvas.height)   //清除填充区
    }

    addEvent() {
    }

    onMouseMove(e) {

    }

    atMouseUp() {

    }

    testEvent() {

    }

}
