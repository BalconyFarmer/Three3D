import {Base} from "./Base";

/**
 * 雷达图
 */
class Pie extends Base {
    constructor() {
        super()
        this.option = null;
    }

    /**
     * const b = new Pie();
     * b.init();
     * this.minzufenbu = b.option;
     */
    init() {
        this.option = {
            color: ["#75DDFF", "#428EFE"],
            title: {
                text: '',
                subtext: '',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'right',
                textStyle: {// 图例文字的样式
                    color: "#ccc",
                    fontSize: 16
                }
            },
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        {value: 1048, name: '汉族'},
                        {value: 735, name: '哈尼族'},
                        {value: 580, name: '彝族'},
                        {value: 484, name: '白族'},
                        {value: 300, name: '摩梭族'}
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    }

    /**
     * 多环图
     * @param data
     const data = [
     {name: "农村党支部", value: 236, count: 4423, rate: 0},
     {name: "gaili", value: 236, count: 4423, rate: 0},
     ]
     const name = '默认'
     * @returns {{legend: {itemGap: number, data: (*|*[]), orient: string, x: number, y: string, textStyle: {color: string}}, series: [{data: *, clockwise: boolean, center: [string, string], avoidLabelOverlap: boolean, itemStyle: {normal: {borderColor: string, borderWidth: number}}, minAngle: number, label: {normal: {formatter: string, show: boolean, rich: {text: {verticalAlign: string, padding: number, color: string, fontSize: number, align: string}, value: {verticalAlign: string, color: string, fontSize: number, align: string}}, position: string}, emphasis: {show: boolean, textStyle: {fontSize: number}}}, type: string, radius: [string, string]}]}}
     */
    circlePie(data, name, newChart) {
        let color = ["#efb41b", "#26dcec", "#2fe5bc", "#06a2fe", "#c87ef3"];
        this.option = {
            tooltip: {
                trigger: "item",
                formatter: function (params) {
                    return `<div>名称:  ${params.name}</div>
                            <div>数量:  ${params.value}</div>
                            <div>占比:  ${params.percent}%</div>`
                }
            },
            legend: {
                data: data,
                orient: "vertical",
                textStyle: {
                    color: "#fff",
                    rich: {
                        a0: {fontSize: 13, color: color[0], width: 80},
                        a1: {fontSize: 13, color: color[1], width: 80},
                        a2: {fontSize: 13, color: color[2], width: 80},
                        a3: {fontSize: 13, color: color[3], width: 80},
                        a4: {fontSize: 13, color: color[4], width: 80},
                        a5: {fontSize: 13, color: color[5], width: 80},
                        b: {fontSize: 14, color: "#fff"}
                    }
                },
                itemGap: 20,
                left: 'right',
                y: "center",
                formatter: function (e) {
                    let value = 0
                    data.map(item => {
                        if (item.name == e) {
                            value = item.value
                        }
                    })
                    return e + ':  ' + value
                },
                type: 'scroll',
                clickable: true,
                selectedMode: true,
                show: true
            },
            series: [{

                name: name,
                type: "pie",
                avoidLabelOverlap: true,
                label: { //  饼图图形上的文本标签
                    normal: { // normal 是图形在默认状态下的样式
                        show: false,
                        position: 'center',
                        color: 'white',
                        fontSize: 17,
                        fontWeight: 'bold',
                        formatter: '{d}%\n{b}' // {b}:数据名； {c}：数据值； {d}：百分比，可以自定义显示内容，
                    }
                },
                emphasis: { // hover 中心显示
                    label: {
                        show: true,
                        fontSize: '17',
                        fontWeight: 'bold'
                    }
                },
                radius: ["60", "90"],
                center: ["50%", "50%"],
                color: color,
                itemStyle: {
                    normal: {
                        borderWidth: 4,
                        borderColor: "rgba(9, 44, 76, .8)"
                    }
                },
                data: data
            }]
        };

        setTimeout(function () {
            let index = 0
            newChart.dispatchAction({type: 'highlight', seriesIndex: 0, dataIndex: 0});
            // 当鼠标移入时，如果不是第一项，则把当前项置为选中，如果是第一项，则设置第一项为当前项
            newChart.on('mouseover', function (e) {
                newChart.dispatchAction({type: 'downplay', seriesIndex: 0, dataIndex: 0});
                if (e.dataIndex != index) {
                    newChart.dispatchAction({type: 'downplay', seriesIndex: 0, dataIndex: index});
                }
                if (e.dataIndex == 0) {
                    newChart.dispatchAction({type: 'highlight', seriesIndex: 0, dataIndex: e.dataIndex});
                }
            });

            //当鼠标离开时，把当前项置为选中
            newChart.on('mouseout', function (e) {
                index = e.dataIndex;
                newChart.dispatchAction({type: 'highlight', seriesIndex: 0, dataIndex: e.dataIndex});
            });
        }, 200)


    }

    /**
     * deformity
     data = [
         {name: "村（居）民小组党组织书记和主任",value: 24888},
         {name: "村（居）民小组党组织书记和主任",value: 24888},
         {name: "村（居）民小组党组织书记和主任",value: 24888},
     ]
     */
    deformityPie(data) {
        let colorArr = []
        const _data = data
        _data.reverse()
        let allCount = 0
        let legendData = []
        let seriesData = []
        let currentIndex = 0

        function calcuAllCount() {
            _data.forEach(item => {
                allCount += item.value
            })
        }

        calcuAllCount()

        function makeLegendData() {
            _data.forEach(item => {
                legendData.push(item.name)
            })
        }

        makeLegendData()

        function makeSeriesData() {
            while (colorArr.length < 20) {
                do {
                    var color = Math.floor((Math.random() * 1000000) + 1);
                } while (colorArr.indexOf(color) >= 0);
                colorArr.push("#" + ("000000" + color.toString(16)).slice(-6));
            }

            _data.forEach(item => {
                currentIndex += 1
                const series = {
                    name: item.name,
                    type: 'pie',
                    radius: [(0.1 * currentIndex * 100) + '%', ((0.1 + 0.01) * currentIndex * 100) + '%'], // 外圆内圆半径
                    center: ['40%', 'center'],
                    label: {
                        normal: {
                            position: 'inner'
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: item.value,
                            itemStyle: {
                                normal: {
                                    color: colorArr[currentIndex - 1]
                                }
                            }
                        },
                        {
                            value: allCount - item.value,
                            itemStyle: {
                                normal: {
                                    color: 'transparent'
                                }
                            }
                        }
                    ]
                }
                seriesData.push(series)
            })
        }

        makeSeriesData()

        const option = {
            tooltip: {
                show: false,//防止鼠标移到不需要的数据上弹出label
                trigger: 'item',
                formatter: "{a} : {c} ({d}%)"
            },
            color: colorArr,
            legend: {
                data: legendData,
                orient: 'vertical',
                x: '68%',
                top: '25%',
                itemHeight: 10, //图例的高度
                itemGap: 5,     //图例之间的间距
                textStyle: {//图例文字的样式
                    color: '#ccc',
                    fontSize: 16
                },
                formatter: function (e) {
                    let value = 0
                    data.map(item => {
                        if (item.name == e) {
                            value = item.value
                        }
                    })
                    return e + ':  ' + value
                },
            },
            series: seriesData
        };
        this.option = option

    }
}

export {Pie};
