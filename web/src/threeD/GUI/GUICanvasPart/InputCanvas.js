import * as THREE from "three";

// 输入文字
export class InputCanvas {
    constructor(width, height, content, inputMesh) {
        this.inputMesh = inputMesh
        this.virtualCanvas = null
        this.ctx = null
        this._width = width
        this._height = height
        this.text = content
        this.mouseDownFlag = false
        this.mousePosition = new THREE.Vector2()
        this.textArray = Array.from(this.text)
        this.textArrayObjects = []
        this.selectedStrObject = null
        this.cursorPosition = null
        this._atKeyDown = this.atKeyDown.bind(this)
        this._fontColor = "#7AC7E1"
        this._backgroundColor = "#051016"

        this.initDom()
        this.draw()
        this.updateArrayObject()
        this.addEvent()

    }

    initDom() {
        this.virtualCanvas = document.createElement('canvas')
        this.virtualCanvas.width = this._width
        this.virtualCanvas.height = this._height
        this.ctx = this.virtualCanvas.getContext("2d")
    }

    draw() {
        // 背景
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(0, 0, this._width, this._height);

        // 绘制文字
        this.ctx.font = this._height.toString() + "px Arial";    // 设置字体
        this.ctx.textAlign = "left";                             // 设置对齐方式
        this.ctx.fillStyle = this._fontColor;                          // 设置填充颜色
        this.ctx.fillText(this.text, 0, this._height);        // 设置字体内容，以及在画布上的位置

        // 绘制光标
        if (this.cursorPosition) {
            this.ctx.strokeStyle = "#fddb3a";
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();                       // 开始路径绘制
            this.ctx.moveTo(this.cursorPosition, 0)     // 起点
            this.ctx.lineTo(this.cursorPosition, 50)    // 终点
            this.ctx.stroke()                           // 着色
        }

        // border
        this.ctx.strokeStyle = this._fontColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this._width, this._height);

    }

    clear() {
        this.ctx.clearRect(0, 0, this.virtualCanvas.width, this.virtualCanvas.height)
    }

    /**
     * 字符串数组对象化
     */
    updateArrayObject() {
        this.textArray = Array.from(this.text)
        this.textArrayObjects = []

        let lastMesure = 0
        this.textArray.forEach((item, index) => {
            const textArrayObject = {
                string: item,
                start: lastMesure,
                end: lastMesure + this.measureText(item),
                index: index
            }
            this.textArrayObjects.push(textArrayObject)
            lastMesure += this.measureText(item)
        })
        this.clear()
        this.draw()
    }

    /**
     * 测量某个字符的宽度
     * @param str
     * @return {number}
     */
    measureText(str) {
        const text = this.ctx.measureText(str); // TextMetrics object
        return text.width;
    }

    /**
     * 添加光标
     */
    addCursor() {
        if (this.selectedStrObject) {
            this.cursorPosition = this.selectedStrObject.end
        } else {
            this.cursorPosition = 0
        }
        this.updateArrayObject()

        const self = this
        if (!document.onkeydown) {
            document.onkeydown = function (event) {
                self._atKeyDown(event)
            }
        }

    }

    removeOneCharacter() {
        let index = 0
        if (this.selectedStrObject) {
            index = this.selectedStrObject.index
        } else {
            index = 0
        }
        this.textArray.splice(index, 1)
        this.text = ''
        this.textArray.forEach(item => {
            this.text += item
        })
        this.selectedStrObject = this.textArrayObjects[index - 1]
        this.addCursor()
    }

    addOneCharacter(str) {
        let index = 0
        if (this.selectedStrObject) {
            index = this.selectedStrObject.index + 1
        } else {
            index = 0
        }

        this.textArray.splice(index, 0, str)
        this.text = ''
        this.textArray.forEach(item => {
            this.text += item
        })
        this.updateArrayObject()
        this.selectedStrObject = this.textArrayObjects[index]
        this.addCursor()
    }

    addEvent() {
        const self = this
        self.virtualCanvas.addEventListener('mousedown', function (e) {
            self.atMouseDown.bind(self)(e)
        })
        /*        self.virtualCanvas.addEventListener('mousemove', function (e) {
                    self.onMouseMove.bind(self)(e)
                })
                self.virtualCanvas.addEventListener('mouseup', function (e) {
                    self.atMouseUp.bind(self)(e)
                })*/
        // self.virtualCanvas.addEventListener('keypress', this._atKeyDown) // 可输入框有效
    }

    atMouseDown(e) {
        const canvasInfo = this.virtualCanvas.getBoundingClientRect()
        const x = e.clientX - canvasInfo.left
        const y = e.clientY - canvasInfo.top

        for (let i = 0; i < this.textArrayObjects.length; i++) {
            const start = this.textArrayObjects[i].start
            const end = this.textArrayObjects[i].end
            if (x > start && x < end) {
                this.selectedStrObject = this.textArrayObjects[i]
                this.addCursor()
                console.log(this.selectedStrObject)
                console.log('----------')
            }
        }
    }

    onMouseMove(e) {
        if (this.mouseDownFlag) {
            const canvasInfo = this.virtualCanvas.getBoundingClientRect()
            this.clear()
            this.draw()
        }
    }

    atMouseUp() {
        this.mouseDownFlag = false
        this.mousePosition.x = 0
        this.mousePosition.y = 0
    }

    atKeyDown(event) {
        if (event.code === "Backspace") {
            this.removeOneCharacter()
        } else {
            this.addOneCharacter(event.key)
        }

        if (this.inputMesh) {
            if (this.inputMesh.texture) {
                if (this.inputMesh.texture) {
                    this.inputMesh.texture.needsUpdate = true
                }
            }
        }

    }

    dispose() {
        // this.virtualCanvas.removeEventListener('keypress', this._atKeyDown)
        document.onkeydown = null
    }

}
