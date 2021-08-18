import echarts from 'echarts'

class Base {
    constructor() {
        this.a = null;
        this.option = null
    }

    changeColor() {
        this.option.color = ["#4ef304"];
    }

    /**
     * position
     * left top right bottom
     */
    changeLegendPosition(position) {
        switch (position){
            case 'left':
                this.option.legend.left = 'left'
                this.option.legend.y = "center"
                break;
            case 'right':
                this.option.legend.left = 'right'
                this.option.legend.y = "center"
                break;
            case 'top':
                this.option.legend.left = 'center'
                this.option.legend.y = "top"
                break;
            case 'bottom':
                this.option.legend.left = 'center'
                this.option.legend.y = "bottom"
                break;
        }
    }

    /**
     * 渐变颜色
     * @param zero 开始的颜色
     * @param half 中间的颜色
     * @param one 结束的颜色
     * @returns {LinearGradient}
     */
    linearGradientColor(zero, half, one, type) {
        if(type) {
            return new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                    { offset: 0, color: zero },
                    { offset: 0.5, color: half },
                    { offset: 1, color: one }
                ]
            );
        } else {
            return new echarts.graphic.LinearGradient(
                1, 0, 0, 0,
                [
                    { offset: 0, color: zero },
                    { offset: 0.5, color: half },
                    { offset: 1, color: one }
                ]
            );
        }
    }
}

export { Base };
