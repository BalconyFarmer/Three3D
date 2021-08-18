import {Base} from "@/util/Abstruse/echartOptions/Base";
import echarts from 'echarts'

class Bar extends Base {
    constructor() {
        super();
        this.option = null;
        this.funnelOption = null;
        this.baseBarOption = null;
        this.polarOption = null;
    }

        /**
     * 基础柱状图
     */
    initBasicBar() {
        this.baseBarOption = {
            color: ["#75DDFF", "#a5cede", "#428EFE", "#cadfe5"],

            xAxis: {
                type: "category",
                axisLine: {
                    lineStyle: {
                        color: "#ffffff"
                    }
                },
                data: ["农村", "国企", "学校", "高校", "农村", "国企", "学校", "高校"]
            },
            yAxis: {
                type: "value",
                axisLine: {
                    lineStyle: {
                        color: "#ffffff"
                    }
                }
            },
            series: [{
                data: [120, 200, 150, 80, 70, 110, 130, 130],
                type: "bar",
                barWidth: 30,
                itemStyle: {

                    normal: {
                        label: {
                            formatter: "{c}" + "小时",
                            show: true,
                            position: "top",
                            textStyle: {
                                fontWeight: "bolder",
                                fontSize: "12",
                                color: "#fff"
                            }
                        },
                        opacity: 1,
                        color: this.linearGradientColor("#DCFCAB", "#4FC4AA", "#1A4440", true),

                    }
                }
            }]
        };
    }

    /**
     * let xAxis = ['学习时长','视频学习时长']
     * let data1 = [100,200]
     * @param xAxis
     * @param data1
     */
    refreshBasicBar(xAxis, data1) {
        this.baseBarOption.xAxis.data = xAxis;
        this.baseBarOption.series[0].data = data1;
    }

    /**
     * 交错正负轴标签
     *   ---|-----
     *  ----|---
     *   ---|--
     *   ---|-----
     const data1 = [
     {name: "18-25", value: -1},
     {name: "25-35", value: -2},
     {name: "35-45", value: -0},
     {name: "45-55", value: -1},
     {name: "55-60", value: -2},
     {name: "60以上", value: -0}
     ]

     const data2 = [
     {name: "18-25", value: -1},
     {name: "25-35", value: -2},
     {name: "35-45", value: -0},
     {name: "45-55", value: -1},
     {name: "55-60", value: -2},
     {name: "60以上", value: -0},
     ]


     */
    initRightLeft(data1, data2) {
        let option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                    label: {
                        show: true,
                        backgroundColor: "#333"
                    }
                },
                formatter: function (params) {
                    if (params) {
                        let str = "";
                        params.forEach(item => {
                            str += item.marker + item.seriesName + "：" + Math.abs(item.value) + "<br/>";
                        });
                        return str;
                    } else {
                        return "";
                    }
                }
            },
            grid: {top: 40, right: 40, bottom: 10, left: 40, containLabel: true},
            legend: {
                data: ["男性", "女性"],
                textStyle: {
                    color: "#FFF"
                },
                x: "right",
                top: 0
            },
            xAxis: [{
                type: "value",
                splitLine: {
                    show: false,
                    lineStyle: {color: "rgba(255,255,255,0.2)"}
                },
                // name: "人数",
                // nameTextStyle: { color: "#fff" },
                axisLine: {show: false},
                axisTick: {show: false},
                axisLabel: {
                    show: true,
                    fontWeight: 10,
                    fontsize: 5,
                    color: "#fff",
                    formatter: function (params) {
                        return params < 0 ? -params : params;
                    }
                }
            }],
            yAxis: {
                type: "category",
                // name: "年龄",
                // nameTextStyle: { color: "#fff" },
                data: data1.map(item => item.name),
                axisTick: {alignWithLabel: true},
                splitLine: {show: false},
                axisLine: {
                    show: true,
                    lineStyle: {
                        type: "dashed",
                        color: "#FFF"
                    }
                },
                axisLabel: {fontsize: 2, align: "center", color: "#fff", margin: 35}
            },
            series: [{
                name: "男性",
                type: "bar",
                stack: "总量",
                barWidth: 15,
                itemStyle: {
                    normal: {
                        barBorderRadius: 2,
                        color: "#FFDF58"
                    }
                },
                data: data1.map(item => item.value)
            }, {
                name: "女性",
                type: "bar",
                stack: "总量",
                barWidth: 15,
                itemStyle: {
                    normal: {barBorderRadius: 2, color: "#a4fff6"}
                },
                data: data2.map(item => item.value)
            }]
        };
        this.option = option
    }

    /**
     * 漏斗图
     * -----------
     *  ---------
     *   -------
     *    ----
     *     --
     * const data = [
     *      { name: "博士及以上", value: 77 },
     *      { name: "硕士", value: 88 },
     *　     { name: "本科", value: 100 }
     ＊　 ];
     */
    initFunnel(data) {
        this.funnelOption = {
            title: {
                text: "",
                subtext: ""
            },
            tooltip: {
                trigger: "item",
                formatter: "{a} <br/>{b} : {c}%"
            },

            legend: {
                data: ["展现", "点击", "访问", "咨询", "订单"],
                textStyle: {color: "#fcfcfc"}

            },

            series: [
                {
                    name: "漏斗图",
                    type: "funnel",
                    left: "10%",
                    top: 60,
                    // x2: 80,
                    bottom: 60,
                    width: "80%",
                    // height: {totalHeight} - y - y2,
                    min: 0,
                    max: 100,
                    minSize: "0%",
                    maxSize: "100%",
                    sort: "descending",
                    gap: 2,
                    label: {
                        show: true,
                        position: "inside"
                    },
                    labelLine: {
                        length: 10,
                        lineStyle: {
                            width: 1,
                            type: "solid"
                        }
                    },
                    itemStyle: {
                        borderColor: "#fff",
                        borderWidth: 1
                    },
                    emphasis: {
                        label: {
                            fontSize: 20
                        }
                    },
                    data: [
                        {value: 60, name: "访问"},
                        {value: 40, name: "咨询"},
                        {value: 20, name: "订单"},
                        {value: 80, name: "点击"},
                        {value: 100, name: "展现"}
                    ]
                }
            ]
        };

        if (data) {
            this.refreshFunnel(data);
        }
    }

    refreshFunnel(data) {
        this.funnelOption.legend.data = [];
        this.funnelOption.series[0].data = [];

        data.forEach(item => {
            this.funnelOption.legend.data.push(data.name);
            this.funnelOption.series[0].data.push(item);
        });
    }

    /**
     * 极坐标柱状图
     *
     */
    initPolar() {
        this.polarOption = {
            color: ["#2AFFC7", "#D79F31", "#78F5FF", "#D79F31"],
            tooltip: {
                show: true,
                trigger: "axis",
                axisPointer: {
                    // 坐标轴指示器，坐标轴触发有效
                    type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
                },
                textStyle: {
                    fontSize: 18
                },
                formatter: function (params) {
                    let str = params[0].name + "<br/>";
                    params.forEach(item => {
                        str += item.seriesName + ":" + item.data + "<br/>";
                    });
                    let {name, value} = params[0];
                    return str;
                }
            },
            // 圆周轴
            angleAxis: {
                type: "category",
                splitLine: {
                    lineStyle: {color: "#ccc"}
                },
                axisLabel: {
                    color: "#FFF",
                    fontSize: 16
                },
                data: ["基本保障", "基本制度", "基本活动", "基本组织", "基本队伍"]

            },
            // 半径轴
            radiusAxis: {
                splitLine: {
                    lineStyle: {color: "#ccc"}
                },
                axisLabel: {
                    show: true,
                    color: "#FFF",
                    fontSize: 16
                },
                axisLine: {
                    show: false,
                    lineStyle: {color: "#ccc", width: 1, type: "solid"}
                }
            },
            polar: {},
            series: [{
                type: "bar",
                data: [0, 0, 0, 0, 0],
                coordinateSystem: "polar",
                name: "需达标数",
                stack: "a",
                emphasis: {
                    focus: "series"
                }
            }, {
                type: "bar",
                data: [0, 0, 0, 0, 0],
                coordinateSystem: "polar",
                name: "已达标数",
                stack: "a",
                emphasis: {
                    focus: "series"
                }
            }, {
                type: "bar",
                data: [0, 0, 0, 0, 0],
                coordinateSystem: "polar",
                name: "正在进行中",
                stack: "a",
                emphasis: {
                    focus: "series"
                }
            }, {
                type: "bar",
                data: [0, 0, 0, 0, 0],
                coordinateSystem: "polar",
                name: "未达标数",
                stack: "a",
                emphasis: {
                    focus: "series"
                }
            }],
            legend: {
                show: true,
                top: 0,
                x: "right",
                orient: "vertical",
                textStyle: {color: "#fcfcfc"},
                data: ["需达标数", "已达标数", "正在进行中", "未达标数"]
            }
        };
    }

    /**
     *
     * @param angleAxis ["基本保障","基本制度","基本活动","基本组织","基本队伍"]
     * @param legend ['需达标数','已达标数','正在进行中','未达标数']
     * @param data [
     [0,0,0,0,0],
     [0,0,0,0,0],
     [0,0,0,0,0],
     [0,0,0,0,0],
     ]
     */
    refreshPolar(angleAxis, legend, data) {
        this.polarOption.angleAxis.data = angleAxis;
        this.polarOption.legend.data = legend;
        this.polarOption.series = [];
        data.forEach((item, index) => {
            this.polarOption.series.push(
                {
                    type: "bar",
                    data: item,
                    coordinateSystem: "polar",
                    name: legend[index],
                    stack: "a",
                    emphasis: {
                        focus: "series"
                    }
                }
            );
        });
    }

    /**
     data1 = [
     {name: "05", value: 4255, year: "2020年"},
     {name: "06", value: 4264, year: "2020年"},
     {name: "07", value: 4292, year: "2020年"}
     ]
     data2 = [
     {name: "05", value: "96.20", year: "2020年"},
     {name: "06", value: "96.41", year: "2020年"},
     {name: "07", value: "97.04", year: "2020年"}
     ]
     data1Name  = "数量"
     data2Name = "比例"
     */
    initBarLine(data1, data2, data1Name, data2Name) {
        let tempData = [];
        let tempValue = 0;
        tempData = data1.map(item => {
            return {name: item.name, value: tempValue};
        });
        if (tempValue) {
            data2.forEach(item => {
                item.value = +item.value + 2;
            });
        }
        let option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {type: "shadow"},
                formatter: function (params) {
                    if (!params.length) return;
                    let str = params[0].name + "<br/>";
                    params.forEach(item => {
                        if (item.seriesType === "line" && tempValue) item.value = item.value - 2;
                        let unit = "人";
                        if (item.seriesName.indexOf("率") !== -1 || item.seriesName.indexOf("比例") !== -1 || item.seriesName.indexOf("占比") !== -1) unit = "%";
                        if (item.seriesName.indexOf("人数") !== -1) unit = "人";
                        if (item.seriesName.indexOf("指数") !== -1) unit = "";
                        if (item.seriesName.indexOf("排名") !== -1) unit = "名";
                        str += item.seriesName + "：" + item.value + unit + "<br/>";
                    });
                    return str;
                }
            },
            legend: {
                data: [data1Name, data2Name],
                textStyle: {
                    color: "#fff"
                },
                right: 100
            },
            grid: {right: 30, left: 30, top: 40, bottom: 10, containLabel: true},
            xAxis: {
                type: "category",
                data: data1.map(item => item.name),
                axisLabel: {
                    textStyle: {color: "#fff"},
                    interval: 0
                },
                axisLine: {show: true, lineStyle: {color: "#3f6fa0"}},
                axisTick: {show: false}
            },
            yAxis: [
                {
                    type: "value",
                    scale: true,
                    name: data1Name,
                    nameTextStyle: {color: "#FFF"},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLine: {show: true, lineStyle: {color: "#3f6fa0"}},
                    axisLabel: {textStyle: {color: "#fff"}},
                    min: 0,
                    boundaryGap: [0.2, 0.2]
                },
                {
                    type: "value",
                    scale: true,
                    name: data2Name || "",
                    nameTextStyle: {color: "#FFF"},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLine: {show: true, lineStyle: {color: "#3f6fa0"}},
                    axisLabel: {textStyle: {color: "#fff"}},
                    min: 0,
                    boundaryGap: [0.2, 0.2]
                }
            ],
            series: [
                {
                    name: "",
                    data: tempData,
                    type: "bar",
                    stack: "a",
                    barWidth: 30,
                    itemStyle: {color: "transparent"},
                    tooltip: {trigger: "none"}
                }, {
                    name: data1Name,
                    data: data1,
                    type: "bar",
                    stack: "a",
                    barWidth: 30,
                    itemStyle: {
                        color: this.linearGradientColor("#DCFCAB", "#4FC4AA", "#1A4440", true)
                    }
                }, {
                    name: data2Name,
                    type: "line",
                    yAxisIndex: 1,
                    // symbol: "rect",
                    symbolSize: 10,
                    lineStyle: {color: "#FFF", width: 3},
                    itemStyle: {
                        color: "#FFF",
                        borderWidth: 6,
                        borderColor: "rgba(131,217,171, .6)"
                    },
                    data: data2
                }
            ]
        };

        this.option = option
    }

    /**
     * 横向双bar
     */
    levelDoubleBar(legend1, legend2, data) {
        const maxArr = []
        data.forEach(item => {
            maxArr.push(item.num)
        })
        const option = {
            title: {
                text: '',
                subtext: ''
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: [legend1, legend2],
                left: 'right',
                textStyle: {//图例文字的样式
                    color: '#ccc',
                    fontSize: 10
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01],
                axisLine: {
                    lineStyle: {
                        color: '#466FAF'
                    }
                },
                // 控制网格线是否显示
                splitLine: {
                    show: false,
                    //  改变轴线颜色
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: ['red']
                    }
                },

                max: Math.max(...maxArr) + Math.max(...maxArr) / 10
            },
            yAxis: {
                type: 'category',
                // data: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(万)'],
                data: data.map(item => {
                    return item.age
                }),
                axisLine: {
                    lineStyle: {
                        color: '#466FAF'
                    }
                }
            },
            series: [
                {
                    name: legend1,
                    type: 'bar',
                    barWidth: '25%',  //  调节柱形图宽度的大小

                    data: data.map(item => {
                        if (item.sex == '女') {
                            return item.num
                        }
                    }),
                    // data: [18203, 23489, 29034, 104970, 131744, 630230],
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 1, 1, 1,
                                [
                                    {offset: 0, color: '#133767'},
                                    {offset: 1, color: '#62FDED'}
                                ]
                            ),
                            label: {
                                show: true, //开启显示
                                position: 'right', //在上方显示
                                textStyle: { //数值样式
                                    color: '#FFED75',
                                    fontSize: 16
                                },
                                formatter(params) {
                                    return `${params.value}人`
                                }
                            }
                        },
                    },
                },
                {
                    name: legend2,
                    type: 'bar',
                    barWidth: '25%',  //  调节柱形图宽度的大小

                    // data: [19325, 23438, 31000, 121594, 134141, 681807],
                    data: data.map(item => {
                        if (item.sex == '男') {
                            return item.num
                        }
                    }),
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 1, 1, 1,

                                [
                                    {offset: 0, color: '#25375B'},
                                    {offset: 1, color: '#FFF88D'}
                                ]
                            ),
                            label: {
                                show: true, //开启显示
                                position: 'right', //在上方显示
                                textStyle: { //数值样式
                                    color: '#FFED75',
                                    fontSize: 16
                                },
                                formatter(params) {
                                    return `${params.value}人`
                                }
                            }
                        },
                    },
                }
            ]
        }
        this.option = option
    }

    barWithLine(data, leftName, rightName) {
        let x_data = ["2019-07-02", "2019-07-03", "2019-07-04", "2019-07-05", "2019-07-06", "2019-07-07", "2019-07-08", "2019-07-09"]

        let y_data = [501, 210, 123, 333, 445, 157, 151, 369]

        let y2_data = [80, 40, 13, 36, 57, 77, 41, 39]

        if (data) {
            x_data = data.map(item => {
                return item.dateMonth
            })
            y_data = data.map(item => {
                return item.finishNum
            })
            y2_data = data.map(item => {
                return item.finishNum / item.totalNum
            })
        }

        const option = {
            title: {
                left: 'left',
                text: '概率',
                show: false
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{a}:{c}',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            grid: {
                show: false,
                top: '30',
                bottom: '60',
                right: '60',
                left: '60'
            },
            legend: {
                show: true,
                selectedMode: 'single', // 设置显示单一图例的图形，点击可切换
                bottom: 10,
                left: 50,
                textStyle: {
                    color: '#666',
                    fontSize: 12
                },
                itemGap: 20,
                inactiveColor: '#ccc'
            },
            xAxis: {
                splitLine: {show: false},
                type: 'category',
                data: x_data,
                axisPointer: {
                    type: 'shadow'
                },
                // 改变x轴颜色
                axisLine: {
                    lineStyle: {
                        color: '#00a2e2',
                        width: 1, // 这里是为了突出显示加上的
                    }
                },
                axisTick: {
                    show: true,
                    interval: 0
                },
            },
            // 设置两个y轴，左边显示数量，右边显示概率
            yAxis: [
                {
                    splitLine: {show: false},
                    type: 'value',
                    name: leftName || '缴纳人数',
                    max: Math.max(...y_data) + 100,
                    min: 1,
                    show: true,
                    interval: Math.max(...y_data) / 10,
                    // 改变y轴颜色
                    axisLine: {
                        lineStyle: {
                            color: '#00a2e2',
                            width: 1, // 这里是为了突出显示加上的
                        }
                    },
                },

                // 右边显示比例
                {
                    splitLine: {show: false},
                    type: 'value',
                    name: rightName || '缴纳比例',
                    min: 0,
                    max: 1,
                    interval: 0.1,
                    // 改变y轴颜色
                    axisLine: {
                        lineStyle: {
                            color: '#00FF7F',
                            width: 2, // 这里是为了突出显示加上的
                        }
                    },
                    axisLabel: {
                        // formatter: '{value} %'
                        formatter: function (value) {
                            return `${value * 100}%`
                        }
                    }
                }
            ],

            // 每个设备分数量、概率2个指标，只要让他们的name一致，即可通过，legeng进行统一的切换
            series: [{
                name: '',
                type: 'bar',
                symbol: 'circle', // 折线点设置为实心点
                symbolSize: 6, // 折线点的大小

                data: y_data,
                barWidth: '50%',

                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                {offset: 0, color: '#62FDED'},
                                {offset: 1, color: '#133767'}
                            ]
                        ),
                        label: {
                            show: false, //开启显示
                            position: 'right', //在上方显示
                            textStyle: { //数值样式
                                color: '#FFED75',
                                fontSize: 16
                            },
                            formatter(params) {
                                return `${params.value}人`
                            }
                        }
                    },
                },

            },
                {
                    //折线
                    name: '',
                    type: 'line',
                    symbol: 'circle', // 折线点设置为实心点

                    yAxisIndex: 1, // 这里要设置哪个y轴，默认是最左边的是0，然后1，2顺序来。
                    data: y2_data,
                    symbolSize: 10,
                    itemStyle: {
                        normal: {
                            color: "#00FF7F"
                        }

                    }

                },

            ]

        }
        this.option = option
    }

}

export {Bar};
