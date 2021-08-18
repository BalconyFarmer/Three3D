export class CheckBoxCanvas {
    constructor(width, height, content, parentMesh) {
        this.parentMesh = parentMesh
        this.virtualCanvas = null
        this.ctx = null
        this._width = width
        this.domWidth = this._width
        this._height = height
        this.text = content
        this.selectFlag = false
        this._fontColor = "#7AC7E1"
        this._backgroundColor = "#051016"

        this.initDom()
        this.draw()

        this.measureText()
        this.updataDom()
        this.draw()

        this.addEvent()
    }

    initDom() {
        this.virtualCanvas = document.createElement('canvas')
        this.virtualCanvas.width = this.domWidth
        this.virtualCanvas.height = this._height
        this.ctx = this.virtualCanvas.getContext("2d")
    }

    updataDom() {
        this.virtualCanvas.width = this.domWidth
        this.virtualCanvas.height = this._height
        if (this.parentMesh) {
            this.parentMesh.width = this.domWidth
        }
    }

    draw() {
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(0, 0, this._width, this._height);

        // 外框
        this.ctx.lineWidth = this._width / 5;
        this.ctx.strokeStyle = this._fontColor;
        this.ctx.strokeRect(this._width / 5 / 2, this._width / 5 / 2, this._width - this._width / 5, this._width - this._width / 5);

        // 中心框
        if (this.selectFlag) {
            this.ctx.fillStyle = this._fontColor;
            const centerWidth = this._width / 4
            const centerPosition = this._width / 2 - centerWidth / 2
            this.ctx.fillRect(centerPosition, centerPosition, centerWidth, centerWidth);
        }
        this.drawText()

    }

    drawText() {
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(this._width + this._width / 4, 0, this.domWidth - this._width, this._height);

        this.fontHeight = this._width * 0.8
        const fontSize = "Bold" + ' ' + this.fontHeight.toString() + "px" + ' ' + "Arial"
        this.ctx.font = fontSize;
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = this._fontColor;
        this.ctx.fillText(this.text, this._width + this._width / 4, this.fontHeight);
    }

    measureText() {
        const textArray = Array.from(this.text)
        let textLength = 0
        textArray.forEach(item => {
            const text = this.ctx.measureText(item); // TextMetrics object
            textLength += text.width
        })
        this.domWidth = this._width + textLength + this._width / 4
    }

    atMouseDown() {
        this.selectFlag = !this.selectFlag
        this.clear()
        this.draw()
    }

    atMouseUp() {
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

    clear() {
        this.ctx.clearRect(0, 0, this.virtualCanvas.width, this.virtualCanvas.height)
    }

}
