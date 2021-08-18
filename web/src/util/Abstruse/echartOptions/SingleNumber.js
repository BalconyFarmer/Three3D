/**
 * 单一数字初始化类 如: 液体图 仪表盘 百分比图等
 */
class SingleNumber {
    constructor() {
        this.option = null;
        this.init();
    }

    init() {

    }

    /**
     * 汽车仪表盘
     * const see2 = new SingleNumber();
     * see2.initCarMeter();
     * this.JSJDoption = see2.option;
     */
    initCarMeter() {
        this.option = {
            series: [{
                type: "gauge",
                progress: {
                    show: true,
                    width: 18
                },
                axisLine: {
                    lineStyle: {
                        width: 18
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    length: 15,
                    lineStyle: {
                        width: 2,
                        color: "#999"
                    }
                },
                axisLabel: {
                    distance: 25,
                    color: "#999",
                    fontSize: 20
                },
                anchor: {
                    show: true,
                    showAbove: true,
                    size: 25,
                    itemStyle: {
                        borderWidth: 10
                    }
                },
                title: {
                    show: false
                },
                detail: {
                    valueAnimation: true,
                    fontSize: 80,
                    offsetCenter: [0, "70%"]
                },
                data: [{
                    value: 70
                }]
            }]
        };
    }

    /**
     * 比例圆环图
     * data  = 25
     */
    singlePie(data, color) {
        const e = data || 0;
        const option = {

            title: {
                show: true,
                text: e + '%',
                x: 'center',
                y: 'center',
                textStyle: {
                    fontSize: '35',
                    color: 'white',
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: "{d}%",
                show: false
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                show: false
            },
            series:
                {
                    name: '',
                    type: 'pie',
                    radius: ['65%', '85%'],
                    avoidLabelOverlap: true,
                    hoverAnimation: true,
                    label: {
                        normal: {
                            show: true,
                            position: 'center'
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {value: e, name: ''},
                        {value: 100 - e, name: ''}
                    ]
                },
            color: [color || 'yellow', '#10315E']

        };
        this.option = option
    }
}

export {SingleNumber};
