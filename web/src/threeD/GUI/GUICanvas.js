import {ButtonCanvas} from './GUICanvasPart/ButtonCanvas'
import {CheckBoxCanvas} from './GUICanvasPart/CheckBoxCanvas'
import {CheckBoxListCanvas} from './GUICanvasPart/CheckBoxListCanvas'
import {ImgCanvas} from './GUICanvasPart/ImgCanvas'
import {InputCanvas} from './GUICanvasPart/InputCanvas'
import {SliderCanvas} from './GUICanvasPart/SliderCanvas'
import {TextBlockCanvas} from './GUICanvasPart/TextBlockCanvas'
import {serverAdress} from '@/config';

/**
 * https://juejin.im/post/6844903587462512647
 * canvas example
 */
export class GUICanvas {
    constructor(dom) {
        this.dom = dom
        this.ctx = null
        this.init()

        // this.drawRect()
        // this.drawLine()
        // this.drawText()
        // this.drawArc(10, 10)
        // this.animation()
        // this.move()
        // this.clear()
        // this.saveRestore()
        // this.addEvent()
    }

    init() {
        const container = document.getElementById('canvasContainer')

        const buttonCanvas = new ButtonCanvas(null, 20, 40, 200, 60, "CLICK! any", '30px')
        container.appendChild(buttonCanvas.virtualCanvas)
        buttonCanvas.addEventListener('click', function () {
            console.log('btn被点击了')
        })
        // buttonCanvas.removeEventListener('click')
        let brDom0 = document.createElement('br')
        container.appendChild(brDom0)

        const checkBoxCanvas = new CheckBoxCanvas(50, 50, 'selected123')
        container.appendChild(checkBoxCanvas.virtualCanvas)
        let brDom1 = document.createElement('br')
        container.appendChild(brDom1)

        const checkList = [
            {
                name: '小明',
                flag: true
            },
            {
                name: '小红',
                flag: true
            },
            {
                name: '小粉',
                flag: true
            }
        ]
        const checkBoxListCanvas = new CheckBoxListCanvas(350, 50, checkList, '40px')
        container.appendChild(checkBoxListCanvas.virtualCanvas)
        let brDomA = document.createElement('br')
        container.appendChild(brDomA)

        const imgUrl = document.createElement('img')
        imgUrl.src = serverAdress + '/3Dstatic/model3D/headExample.png'
        const imgCanvas = new ImgCanvas(50, 50, imgUrl)
        container.appendChild(imgCanvas.virtualCanvas)
        let brDom2 = document.createElement('br')
        container.appendChild(brDom2)

        const inputeCanvas = new InputCanvas(300, 50, 'ABCdef')
        container.appendChild(inputeCanvas.virtualCanvas)
        let brDom3 = document.createElement('br')
        container.appendChild(brDom3)

        const sliderCanvas = new SliderCanvas(300, 50, '滑块')
        container.appendChild(sliderCanvas.virtualCanvas)
        let brDom4 = document.createElement('br')
        container.appendChild(brDom4)

        const textCanvas = new TextBlockCanvas(300, 50, 'ABCdef', '40px')
        container.appendChild(textCanvas.virtualCanvas)
        let brDom5 = document.createElement('br')
        container.appendChild(brDom5)


    }

    drawLine() {
        this.ctx.beginPath();      // 开始路径绘制
        this.ctx.moveTo(100, 200)  // 起点
        this.ctx.lineTo(200, 0)    // 终点
        this.ctx.lineTo(300, 200)
        this.ctx.lineTo(100, 80)
        this.ctx.lineTo(300, 80)
        this.ctx.lineTo(100, 200)
        this.ctx.stroke()         // 着色
    }

    drawRect() {
        this.ctx.fillStyle = "#FF0000";      //绘制颜色
        this.ctx.strokeRect(0, 0, 150, 75);    //绘制黑色填充区域
    }

    drawText() {
        this.ctx.font = "Bold 20px Arial";      // 设置字体
        this.ctx.textAlign = "left";            // 设置对齐方式
        this.ctx.fillStyle = "#008600";         // 设置填充颜色
        this.ctx.fillText("Hello!", 10, 50);    // 设置字体内容，以及在画布上的位置
        this.ctx.strokeText("Hello!", 10, 100); // 绘制空心字
    }

    drawArc(x, y) {
        // this.ctx.beginPath();
        // this.ctx.arc(60, 60, 50, 0, Math.PI * 2, true);
        // this.ctx.fillStyle = "#000000";
        // this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2, true); //x,y,r,起始弧度,终点弧度，是否逆时针
        this.ctx.lineWidth = 1.0;
        this.ctx.strokeStyle = "#000";
        this.ctx.stroke();
    }

    saveRestore() {

        this.ctx.shadowOffsetX = 10;
        this.ctx.shadowOffsetY = 10;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';

        this.ctx.fillStyle = '#CC0000';
        this.ctx.fillRect(10, 10, 150, 100);
        this.ctx.save();
        this.clear()

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(180, 10, 150, 100);
        this.ctx.restore();

    }

    move() {
        this.drawRect()
        this.ctx.rotate(Math.PI * 0.2) //旋转某个弧度，以左上角(0,0)作为基点，而不是以当前图形作为基点
        this.ctx.scale(10, 10)       //宽度缩放倍数，高度缩放倍数 缩放 配合ctx.save() ctx.restore(),以免造成全局缩放
    }

    animation() {
        let posX = 20,
            posY = 100;
        const self = this
        setInterval(function () {
            posX += 1
            posY += 1
            self.clear()
            self.drawArc(posX, posY)
        }, 30);
    }

    addEvent() {
        this.ctx.beginPath()
        this.ctx.moveTo(10, 10)
        this.ctx.lineTo(10, 50)
        this.ctx.lineTo(50, 50)
        this.ctx.lineTo(50, 10)
        this.ctx.fillStyle = 'black'
        this.ctx.fill()
        this.ctx.closePath()

        this.dom.addEventListener('click', function (e) {
            const canvasInfo = this.ctx.getBoundingClientRect()
            console.log(this.ctx.isPointInPath(e.clientX - canvasInfo.left, e.clientY - canvasInfo.top))
        })
    }

    clear() {
        this.ctx.clearRect(0, 0, this.dom.width, this.dom.height)   //清除填充区
    }
}


