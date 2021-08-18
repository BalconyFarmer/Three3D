import {lincang} from "./mapDataForEcahrt/临沧市.js";
import {lijiang} from "./mapDataForEcahrt/丽江市.js";
import {yunnan} from "./mapDataForEcahrt/云南.js";
import {baoshan} from "./mapDataForEcahrt/保山市.js";
import {dali} from "./mapDataForEcahrt/大理白族自治州.js";
import {dehong} from "./mapDataForEcahrt/德宏傣族景颇族自治州.js";
import {nujiang} from "./mapDataForEcahrt/怒江傈僳族自治州.js";
import {wenshan} from "./mapDataForEcahrt/文山壮族苗族自治州.js";
import {kunming} from "./mapDataForEcahrt/昆明市.js";
import {zhaotong} from "./mapDataForEcahrt/昭通市.js";
import {puer} from "./mapDataForEcahrt/普洱市.js";
import {qujing} from "./mapDataForEcahrt/曲靖市.js";
import {chuxiong} from "./mapDataForEcahrt/楚雄彝族自治州.js";
import {yuxi} from "./mapDataForEcahrt/玉溪市.js";
import {honghe} from "./mapDataForEcahrt/红河哈尼族彝族自治州.js";
import {xishuangbanna} from "./mapDataForEcahrt/西双版纳傣族自治州.js";
import {diqing} from "./mapDataForEcahrt/迪庆藏族自治州.js";
import * as THREE from "three";
import {yunanMapData} from "./mapDataForEcahrt/manualYunnan";
import bgMapPopup from "@/assets/images/bg_map_popup.png";

export {yunanMapData};

let echarts = require("echarts/lib/echarts");

/**
 * tidForE为待填充的domid
 * const echartMapApp = new MapFormEchart("idForE");
 * echartMapApp.refreshEchartMap("临沧市");
 */
class MapFormEchart {
    constructor(domID) {
        this.oMap = null;
        this.name = null;
        this.alldom = document.getElementById(domID);
        this.eventBus = new THREE.EventDispatcher(); // 3D事件中心
        this.nowMapData = null;
        this.testData1 = [
            {name: "vv", "lng": 102.703767, "lat": 25.047855},
            {name: "vv", "lng": 102.703767, "lat": 26.047855}
        ];
        this.option = null;
        this.yunanMapData = yunanMapData;
        this.position = {
            left: 'center',
            top: 'middle',
            zoom: 1
        }
    }

    refreshEchartMap(name) {
        this.oMap = echarts.init(this.alldom);

        switch (name) {
            case "临沧市":
                this.name = "lincang";
                this.nowMapData = lincang;
                break;
            case "丽江市":
                this.name = "lijiang";
                this.nowMapData = lijiang;
                break;
            case "云南省":
                this.name = "yunnan";
                this.nowMapData = yunnan;
                break;
            case "保山市":
                this.name = "baoshan";
                this.nowMapData = baoshan;
                break;
            case "大理白族自治州":
                this.name = "dali";
                this.nowMapData = dali;
                break;
            case "德宏傣族景颇族自治州":
                this.name = "dehong";
                this.nowMapData = dehong;
                break;
            case "怒江傈僳族自治州":
                this.name = "nujiang";
                this.nowMapData = nujiang;
                break;
            case "文山壮族苗族自治州":
                this.name = "wenshan";
                this.nowMapData = wenshan;
                break;
            case "昆明市":
                this.name = "kunming";
                this.nowMapData = kunming;
                break;
            case "昭通市":
                this.name = "zhaotong";
                this.nowMapData = zhaotong;
                break;
            case "普洱市":
                this.name = "puer";
                this.nowMapData = puer;
                break;
            case "曲靖市":
                this.name = "qujing";
                this.nowMapData = qujing;
                break;
            case "楚雄彝族自治州":
                this.name = "chuxiong";
                this.nowMapData = chuxiong;
                break;
            case "玉溪市":
                this.name = "yuxi";
                this.nowMapData = yuxi;
                break;
            case "红河哈尼族彝族自治州":
                this.name = "honghe";
                this.nowMapData = honghe;
                break;
            case "西双版纳傣族自治州":
                this.name = "xishuangbanna";
                this.nowMapData = xishuangbanna;
                break;
            case "迪庆藏族自治州":
                this.name = "diqing";
                this.nowMapData = diqing;
                break;
        }

        echarts.registerMap(this.name, this.nowMapData);

        this.initOption();
        this.refreshData();

        this.addTooltip();
        this.addClickEvent();

    }

    initOption() {
        this.option = {
            // 提示框组件(可以设置在多种地方)
            tooltip: {},

            // 底层图层
            // 地理坐标系组件。地理坐标系组件用于地图的绘制，支持在地理坐标系上绘制散点图，线集。
            geo: {
                show: true,
                map: this.name,
                roam: false,
                top: this.position.top, // 和下层保持一致
                left: this.position.left, // 和下层保持一致
                zoom: this.position.zoom, // 缩放
                aspectScale: 1, // scale地图的长宽比
                itemStyle: {
                    normal: {
                        borderWidth: 2,
                        borderColor: "#a2dbf6",
                        color: "#1b6bc2",
                        opacity: 1,
                        areaColor: "#1b6bc2",
                        shadowBlur: 5,
                        shadowColor: "#AFDEFA"
                        // shadowOffsetX: -6,
                        // shadowOffsetY: 8
                    },
                    emphasis: {opacity: 0.2, color: "#1e74c9"}
                },
                label: {
                    normal: {show: true, color: "#fff"},
                    emphasis: {show: false, color: "#fff"}
                },
                tooltip: {trigger: "none"},
                z: 2
            },

            // 顶层图层 显示各市名称
            // 系列列表。每个系列通过 type(map, scatter, bar, line, gauge, tree.....) 决定自己的图表类型
            series: [
                {
                    top: this.position.top,
                    left: this.position.left,
                    zoom: this.position.zoom, // 当前视角的缩放比例。

                    map: this.name,
                    type: "map",
                    aspectScale: 1, // 这个参数用于 scale 地图的长宽比。geoBoundingRect.width / geoBoundingRect.height * aspectScale
                    roam: false, // 是否开启鼠标缩放和平移漫游。默认不开启
                    label: {
                        show: false,
                        textStyle: {
                            color: "white",
                            fontSize: 12,
                            backgroundColor: "" // 文字背景色
                        }
                    },

                    itemStyle: {
                        normal: {
                            borderWidth: 2,
                            borderColor: "#a2dbf6",
                            color: "#1b6bc2",
                            opacity: 1,
                            areaColor: "#1b6bc2",
                            shadowBlur: 5,
                            shadowColor: "#AFDEFA"
                            // shadowOffsetX: -6,
                            // shadowOffsetY: 8
                        },
                        // 鼠标移入时
                        emphasis: {
                            borderColor: "#ffffff",
                            borderWidth: "1",
                            areaColor: "#99D2F2",
                            label: {
                                show: false,
                                textStyle: {
                                    color: "gray",
                                    fontSize: 14
                                }
                            }
                        },

                        effect: {
                            show: true,
                            shadowBlur: 10,
                            loop: true
                        }
                    }
                }

            ]
        };
    }

    /**
     * 添加鼠标hover悬浮窗
     * 区域hover
     */
    addTooltip() {
        this.option.tooltip = {
            show: true,
            backgroundColor: "rgba(255,255,255,0.0)", // 设置背景图片 rgba格式
            formatter: params => {
                return this._xzdxMapWindInfo(11, 11, 11, 11);
            }
        };
    }

    /**
     * 添加飞行线
     */
    addFlyLine() {
        this.option.series.push(
            // 自定义飞行线
            {
                "name": "北京",
                "type": "lines",
                "zlevel": 2,
                "symbol": ["none", "arrow"],
                "symbolSize": 10,
                "effect": {
                    "show": true,
                    "period": 6,
                    "trailLength": 0,
                    "symbol": "path://M4560,4996.6c-530.4-68.2-932.1-239.8-1201.2-514.8c-156-159.9-508.9-803.4-598.6-1092c-50.7-161.9-52.7-384.2-11.7-840.5c39-421.2,42.9-386.1-54.6-432.9c-117-56.5-208.7-138.4-241.8-216.4c-23.4-58.5-23.4-72.2,7.8-136.5c44.8-93.6,93.6-99.4,263.2-31.2l134.6,54.6l58.5-58.5l58.5-58.5l-48.8-536.3C2822.5-3.2,2808.9-360.1,2846-1095.2c9.7-218.4,5.8-386.1-19.5-663c-66.3-723.5-2-1550.3,159.9-2039.7c72.1-216.4,157.9-366.6,278.8-487.5c87.8-89.7,142.3-122.9,304.2-189.2c349.1-146.3,805.3-257.4,1232.4-302.3c173.6-17.5,269.1-17.5,438.8,0c659.1,74.1,1347.5,298.3,1544.4,505.1c140.4,146.3,255.4,399.7,329.6,733.2c101.4,440.7,134.6,1197.3,80,1758.9c-42.9,432.9-46.8,838.5-11.7,982.8c40.9,165.8,9.8,733.2-107.2,1959.8l-50.7,524.6l58.5,56.6l56.6,56.6l150.1-62.4c175.5-74.1,228.1-64.3,265.2,48.8c39,122.9-42.9,235.9-251.6,341.3l-85.8,44.8l13.6,157.9c7.8,87.8,21.4,261.3,31.2,384.2c25.4,300.3,23.4,503.1-1.9,627.9c-29.3,128.7-397.8,863.9-514.8,1019.9c-222.3,298.3-563.6,489.5-1066.6,596.7C5470.7,5004.4,4797.9,5025.8,4560,4996.6z M5517.5,3073.9c444.6-76.1,811.2-255.5,1051.1-516.8c195-208.7,189.1-152.1,85.8-906.7c-48.8-358.8-93.6-657.2-97.5-661.1c-5.9-5.8-117,11.7-247.7,39c-544,111.2-762.4,134.6-1269.4,134.6c-522.6,2-717.6-19.5-1271.4-128.7c-169.6-33.1-312-56.5-315.9-52.6c-3.9,3.9-48.8,304.2-99.4,664.9l-89.7,657.2l48.8,85.8c56.5,93.6,232,273,356.9,362.7c255.4,183.3,663,313.9,1127.1,360.8C4936.4,3126.5,5338.1,3105.1,5517.5,3073.9z M6443.7-2179.4v-702l-70.2-76.1c-187.2-210.6-573.3-321.8-1197.3-347.1c-717.6-29.2-1302.6,101.4-1519.1,335.4l-80,87.8v692.3c0,380.2,7.8,692.2,15.6,692.2c9.8,0,81.9-17.5,161.9-37c319.8-81.9,618.1-107.3,1236.3-107.3c631.8,0,920.4,25.4,1255.8,113.1c91.6,25.3,173.6,46.8,183.3,48.8C6437.9-1479.4,6443.7-1793.3,6443.7-2179.4z",
                    "symbolSize": [10, 15]
                },
                "lineStyle": {"normal": {"color": "#a6c84c", "width": 1, "opacity": 0.6, "curveness": 0.2}},
                "data": [
                    {
                        "fromName": "北京1",
                        "toName": "石家庄",
                        "coords": [[102.706698, 25.050186], [100.283537, 26.872341]],
                        "value": 2875
                    },
                    {
                        "fromName": "北京",
                        "toName": "天津",
                        "coords": [[102.706698, 25.050186], [103.832121, 25.462365]],
                        "value": 737
                    }
                ]
            }
        );

        this.refreshData();
    }

    /**
     * 首页地图在线率图标
     */
    addIconManual(placeName, data) {
        this.yunanMapData.forEach(item => {
            if (MapFormEchart.regexPlaceName(placeName, item.name)) {
                let img = require("./imgs/11-raunruo.png");

                this.option.series.push(
                    {
                        // type: "scatter",
                        type: "effectScatter",
                        coordinateSystem: "geo",
                        // 自定义图片的 位置（lng, lat）
                        data: [{name: item.name, value: [item.center[0], item.center[1]], rate: data}],
                        // 自定义图片的 大小
                        symbolSize: [50, 50],
                        // 自定义图片的 路径
                        // symbol: "image://" + img,
                        label: {
                            normal: {
                                show: true,
                                formatter: function (params) {
                                    return "总数:    " + JSON.stringify(params.data.rate.totalNum) + "\n在线数:    " + params.data.rate.onlineNum + "\n离线数:    " + params.data.rate.offlineNum;
                                }
                            },
                            textStyle: {
                                fontWeight: "normal",
                                fontSize: 100
                            }
                        }
                    }
                );
            }
        });
        this.refreshData();
    }

    /**
     * 二级页面在线率图标
     * const center = [101.323602, 25.722348];
     * data = {
           nocheckNum: 0,
           offlineNum: 67,
           onlineNum: 71,
           totalNum: 138,
     }
     */
    addIconSecond(center, data) {
        let img = require("./imgs/11-raunruo.png");

        this.option.series.push(
            {
                type: "effectScatter",

                // 涟漪点样式
                rippleEffect: {
                    color: "#012690",
                    brushType: "stroke"
                },
                itemStyle: {
                    color: "#012690"
                },
                emphasis: {
                    itemStyle: {
                        color: "#012690"
                    }
                },

                coordinateSystem: "geo",
                // 自定义图片的 位置（lng, lat）
                data: [{name: 11, value: [center[0], center[1]], rate: data}],
                // symbol: 'pin', // 图钉图标
                symbolSize: [50, 50], // 自定义图片的 大小
                // symbol: "image://" + img, // 自定义图片的 路径
                label: {
                    normal: {
                        show: true,
                        formatter: function (params) {
                            return "总数:    " + JSON.stringify(params.data.rate.totalNum) + "\n在线数:    " + params.data.rate.onlineNum + "\n离线数:    " + params.data.rate.offlineNum;
                        }
                    },
                    textStyle: {
                        fontWeight: "normal",
                        fontSize: 100
                    }
                },
                tooltip: {
                    backgroundColor: "transparent",
                    padding: 0,
                    show: true,
                    formatter: params => {
                        return this._xzdxMapWindInfo(111, 111, 111, 111);
                    }
                }

            }
        );
        this.refreshData();
    }

    /**
     * 自动轮播tooltip
     */
    startAutoRun() {
        // 自动切换定时器， 自动切换项目
        let timer = null;
        let nows = -1;

        // 自动切换
        const autoShow = (length) => {
            nows = (nows + 1) % length;
            this.oMap.dispatchAction({
                type: "showTip",
                seriesIndex: 0,
                dataIndex: nows
            });
        };

        // 每隔5秒钟自动切换到下一个数据点
        autoShow(this.testData1.length);
        clearInterval(timer);

        const self = this;
        timer = window.setInterval(() => {
            autoShow(self.testData1.length);
        }, 1000);
    }

    /**
     * 添加点击事件
     * demo:
     * objectA.eventBus.addEventListener("mapClick", function(ev) {
     *      const see = ev.message; // "景德镇"
     *      console.log(see, "+++++++++");
     *      debugger;
     * });
     */
    addClickEvent() {
        const self = this;
        this.oMap.on("click", function (params) {
            self.eventBus.dispatchEvent({type: "mapClick", message: params.name});
        });
    }

    /**
     * 刷新ecahrt
     */
    refreshData() {
        this.oMap.setOption(
            this.option
        );
    }

    /**
     * tootip样式
     */
    _xzdxMapWindInfo(title, ratio, villageNum, schoolNum) {
        return `<div style="width: 380px; background: url('${bgMapPopup}') no-repeat; background-size: 100% 100%; padding: 35px 50px; color: rgb(123,235,255); font-size: 24px; line-height: 150%; overflow: hidden;">
                <h4 style="letter-spacing: 3px; text-align: center; padding-bottom: 8px;">${title}</h4><div style="overflow: hidden;">
                <div><small style="color: #e2e2e2;">乡镇党校覆盖率：</small>${ratio}%</div></div>
                <div style="float: left; width: 50%;" ><small style="color: #e2e2e2;">乡镇：</small>${villageNum}个</div>
                <div style="float: left; width: 50%;"><small style="color: #e2e2e2;">乡镇党校：</small>${schoolNum}个</div></div>`;
    }

    /**
     * 销毁对象
     */
    destroy() {
        if (this.oMap.dispose) {
            // this.oMap.clear();
            this.oMap.dispose();
        }
    }

    /**
     * 正则匹配地名
     */
    static regexPlaceName(shortName, loneName) {
        shortName = shortName.replace("市", "");
        shortName = shortName.replace("州", "");
        return loneName.search(shortName) != -1;
    }
}

export {MapFormEchart};
