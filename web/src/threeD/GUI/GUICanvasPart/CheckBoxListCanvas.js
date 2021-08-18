import * as THREE from 'three'

export class CheckBoxListCanvas {
    constructor(width, height, content, fontSize, parentMesh) {
        this.parentMesh = parentMesh
        this.width = width
        this.height = height // 单个选框高度
        this.content = content
        this.contentObject = []
        this.updateContentObject()
        this.contentLength = this.content.length
        this.allHeight = this.height * this.contentLength
        this.fontSize = fontSize
        this.virtualCanvas = null
        this._fontColor = "#7AC7E1"
        this._backgroundColor = "#051016"

        this.initDom()
        this.draw()
        this.addEvent()

    }

    updateContentObject() {
        this.contentObject = []
        this.content.forEach((item, index) => {
            const foo = {
                name: item.name,
                flag: item.flag,
                min: new THREE.Vector2(0, this.height * index),
                max: new THREE.Vector2(this.height, this.height * (index + 1)),
                box: new THREE.Box2(new THREE.Vector2(0, this.height * index), new THREE.Vector2(this.height, this.height * (index + 1)))
            }
            this.contentObject.push(foo)
        })
    }

    initDom() {
        this.virtualCanvas = document.createElement('canvas')
        this.virtualCanvas.width = this.width
        this.virtualCanvas.height = this.allHeight
        this.ctx = this.virtualCanvas.getContext("2d")
    }

    draw() {
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.contentObject.forEach(item => {
            // 文字
            this.drawText(item.name, item.min.x, item.min.y)

            // 外框
            this.ctx.lineWidth = this.height / 5;
            this.ctx.strokeStyle = this._fontColor;
            this.ctx.strokeRect(item.min.x, item.min.y, this.height, this.height);

            // 中心框
            if (item.flag) {
                this.ctx.fillStyle = this._fontColor;
                const centerWidth = this.height / 2
                this.ctx.fillRect(item.min.x, item.min.y, centerWidth, centerWidth);
            }

        })

    }

    drawText(text, x, y) {
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(x, y, this.width, this.height);

        this.fontHeight = this.height
        const fontSize = "Bold" + ' ' + this.fontHeight.toString() + "px" + ' ' + "Arial"
        this.ctx.font = fontSize;
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = this._fontColor;
        this.ctx.fillText(text, 0 + this.height, y + this.fontHeight);
    }

    addEvent() {
        const self = this
        self.virtualCanvas.addEventListener('mousedown', function (e) {
            self.atMouseDown.bind(self)(e)
        })
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

        this.contentObject.forEach(item => {
            const potint = new THREE.Vector2(x, y)
            if (item.box.containsPoint(potint)) {
                item.flag = !item.flag
                this.clear()
                this.draw()
            }
        })
    }

    clear() {
        this.ctx.clearRect(0, 0, this.virtualCanvas.width, this.virtualCanvas.height)
    }


}
