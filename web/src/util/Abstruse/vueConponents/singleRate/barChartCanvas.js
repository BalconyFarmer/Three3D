export class BarChartCanvas {
    constructor(dom, width, height, value, color) {
        this.dom = dom
        this.width = width
        this.height = height
        this.value = value
        this.color = color
        this.ctx = null
        this.colorArry = []
        this.count = 30 * this.value
        this.initColor()
        this.init()
    }

    init() {
        const iwidth = this.width / 30
        this.count = 30 * this.value

        for (let i = 0; i < this.count; i++) {
            this.ctx = this.dom.getContext("2d");
            this.ctx.fillStyle = this.colorArry[i];
            this.ctx.fillRect(iwidth * i, 3, iwidth - 3, this.height - 6);
        }
    }

    update(data) {
        this.value = data
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.init()
    }

    initColor() {
        // rgb to hex
        function rgbToHex(r, g, b) {
            var hex = ((r << 16) | (g << 8) | b).toString(16);
            return "#" + new Array(Math.abs(hex.length - 7)).join("0") + hex;
        }

        // hex to rgb
        function hexToRgb(hex) {
            var rgb = [];
            for (var i = 1; i < 7; i += 2) {
                rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
            }
            return rgb;
        }

        // 计算渐变过渡色
        function gradient(startColor, endColor, step) {
            // 将 hex 转换为rgb
            var sColor = hexToRgb(startColor),
                eColor = hexToRgb(endColor);

            // 计算R\G\B每一步的差值
            var rStep = (eColor[0] - sColor[0]) / step;
            var gStep = (eColor[1] - sColor[1]) / step;
            var bStep = (eColor[2] - sColor[2]) / step;

            var gradientColorArr = [];
            for (var i = 0; i < step; i++) {
                // 计算每一步的hex值
                gradientColorArr.push(rgbToHex(parseInt(rStep * i + sColor[0]), parseInt(gStep * i + sColor[1]), parseInt(bStep * i + sColor[2])));
            }
            return gradientColorArr;
        }

        var startColor = '#ec9089';
        var endColor = '#c12927';
        var step = 100;
        var colorArr = gradient(this.color, '#ffffff', this.count);

        // ["#ec9089", "#eb8e88", "#eb8d87", "#ea8c86", ...]
        this.colorArry = colorArr
    }
}
