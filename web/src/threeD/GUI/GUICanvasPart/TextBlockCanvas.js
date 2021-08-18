export class TextBlockCanvas {
    constructor(width, height, content, fontSize, leftPosition, topPosition) {
        this.pixelZoom = 10

        this.content = content
        this.fontSize = fontSize
        this._width = width * this.pixelZoom
        this._height = height * this.pixelZoom
        this.leftPosition = leftPosition * this.pixelZoom
        this.topPosition = topPosition * this.pixelZoom

        this._fontColor = "#7AC7E1"
        this._backgroundColor = "#051016"
        this.initDom()
        this.draw()
    }

    initDom() {
        this.virtualCanvas = document.createElement('canvas')
        this.virtualCanvas.width = this._width
        this.virtualCanvas.height = this._height
        this.ctx = this.virtualCanvas.getContext("2d")
    }

    draw() {

        const positionX = 0
        const positionY = 0
        const radius = 12
        this.strokeRoundRect.bind(this)(this.ctx, positionX, positionY, this._width, this._height, radius);

        const fontSize = parseInt(this.fontSize.replace('px', '')) * this.pixelZoom
        this.ctx.font = "Bold " + fontSize + "px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = this._fontColor;
        this.ctx.fillText(this.content, this.leftPosition, this.topPosition);

        // border
        this.ctx.strokeStyle = this._fontColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this._width, this._height);
    }

    strokeRoundRect(cxt, x, y, width, height, radius, /*optional*/ lineWidth, /*optional*/ strokeColor) {
        this.ctx.fillStyle = this._backgroundColor;      //绘制颜色
        this.ctx.fillRect(0, 0, this._width, this._height);

        /*        //圆的直径必然要小于矩形的宽高
                if (2 * radius > width || 2 * radius > height) {
                    return false;
                }

                this.ctx.save();
                this.ctx.translate(x, y);
                //绘制圆角矩形的各个边
                this.drawRoundRectPath(this.ctx, width, height, radius);
                this.ctx.lineWidth = lineWidth || 2; //若是给定了值就用给定的值否则给予默认值2
                this.ctx.strokeStyle = this._backgroundColor;
                this.ctx.stroke();
                this.ctx.restore();*/
    }

    drawRoundRectPath(cxt, width, height, radius) {
        this.ctx.beginPath(0);
        //从右下角顺时针绘制，弧度从0到1/2PI
        this.ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

        //矩形下边线
        this.ctx.lineTo(radius, height);

        //左下角圆弧，弧度从1/2PI到PI
        this.ctx.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

        //矩形左边线
        this.ctx.lineTo(0, radius);

        //左上角圆弧，弧度从PI到3/2PI
        this.ctx.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);

        //上边线
        this.ctx.lineTo(width - radius, 0);

        //右上角圆弧
        this.ctx.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);

        //右边线
        this.ctx.lineTo(width, height - radius);
        this.ctx.closePath();
    }

}
