/**
 * button canvas 类
 */
export class ButtonCanvas {
    constructor(buttonMesh, leftPosition, topPosition, width, height, content, fontSize) {
        this.buttonMesh = buttonMesh
        this.virtualCanvas = null
        this.ctx = null
        this.pixelZoom = 1
        this.updatePixelZoom()
        this.eventList = []
        this._fontColor = "#7AC7E1"
        this._backgroundColor = "#051016"
        this._backgroundColorOlD = this._backgroundColor

        this.leftPosition = leftPosition * this.pixelZoom
        this.topPosition = topPosition * this.pixelZoom
        this._width = width * this.pixelZoom
        this._height = height * this.pixelZoom
        this.text = content
        this._fontSize = fontSize

        this.initDom()
        this.draw()
        this.addEvent()
    }

    updatePixelZoom() {
        if (this.buttonMesh) {
            this.buttonMesh.type === '2D' ? this.pixelZoom = 1 : this.pixelZoom = 10
        }
    }

    get fontSize() {
        return this.fontSize
    }

    set fontSize(fontSize) {
        this._fontSize = fontSize
        this.clear()
        this.draw()
    }

    get content() {
        return this.text
    }

    set content(content) {
        this.text = content
        this.clear()
        this.draw()
    }

    get width() {
        this.clear()
        this.draw()
        return this._width
    }

    set height(height) {
        this._height = height
        this.clear()
        this.draw()
    }

    get fontColor() {
        return this._fontColor
    }

    set fontColor(fontColor) {
        this._fontColor = fontColor
        this.clear()
        this.draw()
    }

    get backgroundColor() {
        return this._backgroundColor
    }

    set backgroundColor(backgroundColor) {
        this._backgroundColor = backgroundColor
        this._backgroundColorOlD = backgroundColor
        this.clear()
        this.draw()
    }

    initDom() {
        this.virtualCanvas = document.createElement('canvas')
        this.virtualCanvas.width = this._width
        this.virtualCanvas.height = this._height
        this.ctx = this.virtualCanvas.getContext("2d")
    }

    draw() {
        // background
        this.ctx.lineJoin = "round";
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(0, 0, this._width, this._height);

        // border
        this.ctx.strokeStyle = this._fontColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this._width, this._height);

        // text
        const fontSize = parseInt(this._fontSize.replace('px', '')) * this.pixelZoom
        this.ctx.font = "Bold " + fontSize + "px Arial";
        // this.ctx.textAlign = "center";
        this.ctx.fillStyle = this._fontColor;
        this.ctx.fillText(this.text, this.leftPosition, this.topPosition);
    }

    atMouseDown() {
        this._backgroundColor = '#162930'
        this.clear()
        this.draw()
        this.eventList.forEach(item => {
            if (item.name === 'click') {
                item.func()
            }
        })
    }

    atMouseUp() {
        this._backgroundColor = this._backgroundColorOlD
        this.clear()
        this.draw()
    }

    clear() {
        this.ctx.clearRect(0, 0, this.virtualCanvas.width, this.virtualCanvas.height)   //清除填充区
    }

    update() {
        this.clear()
        this.draw()
    }

    addEvent() {
        const self = this
        this.virtualCanvas.addEventListener('mousedown', function (e) {
            self.atMouseDown.bind(self)()
        })
        this.virtualCanvas.addEventListener('mouseup', function (e) {
            self.atMouseUp.bind(self)()
        })
    }

    addEventListener(name, func) {
        // name "mousedown" "mouseup"
        this.eventList.push({
            name: name,
            func: func
        })
    }

    removeEventListener(name) {
        let indexOut = null
        this.eventList.forEach((item, index) => {
            if (item.name === name) {
                indexOut = index
            }
        })
        this.eventList.splice(indexOut, 1)
    }
}
