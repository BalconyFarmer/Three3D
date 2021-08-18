import { Base } from "./Base";

/**
 * 雷达图
 */
class Radio extends Base {
    constructor() {
        super();
        this.option = null;
        this.init();
    }

    /**
     * const see = new Radio();
     * this.WJBoption = see.option;
     */
    init() {
        this.option = {
            color: ["#75DDFF", "#428EFE"],

            title: {
                text: ""
            },
            tooltip: {},
            legend: {
                data: [],
                textStyle: { color: "#fcfcfc" }
            },
            grid: {
                right: 40, left: 30, top: 240, bottom: 20, containLabel: false
            },
            radar: {
                // shape: 'circle',

                name: {
                    textStyle: {
                        color: "#fff",
                        backgroundColor: "#999",
                        borderRadius: 3,
                        padding: [3, 5]
                    }
                },
                indicator: [
                    { name: "基本组织", max: 200 },
                    { name: "基本组织", max: 200 },
                    { name: "基本组织", max: 200 }
                ]
            },
            series: [{
                name: "",
                type: "radar",
                // areaStyle: {normal: {}},
                data: [
                    {
                        value: [111, 111, 111, 111, 111, 111],
                        name: "2020xixixi"
                    },
                    {
                        value: [],
                        name: "2021"
                    }
                ]
            }]
        };
    }

    /**
     *
     * 只传一个参数
     * @param data
     * [
     *      { "name": "基本组织", value: 150,legend: "forToolTip"},
     *      { "name": "基本组织", value: 100,legend: "forToolTip"},
     *      { "name": "基本组织", value: 112,legend: "forToolTip"}
     * ]
     *
     * 传两个参数
     * @param data2
     *[
     *      { "name": "基本组织", value: 150, legend: "2020年" },
     *      { "name": "基本组织", value: 100, legend: "2020年" },
     *      { "name": "基本组织", value: 112, legend: "2020年" }
     * ],
     * [
     *      { "name": "基本组织", value: 333, legend: "2021年" },
     *      { "name": "基本组织", value: 444, legend: "2021年" },
     *      { "name": "基本组织", value: 555, legend: "2021年" }
     * ]
     */
    addValue(data, data2) {
        if(data2) {
            this.option.legend.data = [];
            this.option.legend.data.push(data[0].legend);
            this.option.legend.data.push(data2[0].legend);

            this.option.radar.indicator = [];
            this.option.series[0].data[0].value = [];
            this.option.series[0].data[1].value = [];

            let maxArr = [];
            data.forEach(item => {
                maxArr.push(item.value);
            });
            data2.forEach(item => {
                maxArr.push(item.value);
            });
            const max = Math.max(...maxArr);

            data.forEach(item => {
                this.option.radar.indicator.push({ name: item.name, max: max });
                this.option.series[0].data[0].value.push(item.value);
                this.option.series[0].data[0].name = data[0].legend;
            });

            data2.forEach(item => {
                this.option.series[0].data[1].value.push(item.value);
                this.option.series[0].data[1].name = data2[1].legend;
            });

        } else if(data.length) {
            this.option.radar.indicator = [];
            this.option.series[0].data[0].value = [];

            let maxArr = [];
            data.forEach(item => {
                maxArr.push(item.value);
            });
            const max = Math.max(...maxArr);

            data.forEach(item => {
                this.option.radar.indicator.push({ name: item.name, max: max });
                this.option.series[0].data[0].value.push(item.value);
                this.option.series[0].data[0].name = data[0].legend;
            });
        }
    }
}

export { Radio };
