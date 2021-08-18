import * as THREE from "three";

/**
 *    1. 高德地图
 *    const domId = "idForG";
 *    self.mapApp = new MapFromGaode(domId);
 *    self.mapApp.updateCity(cityName);
 *    self.mapApp.setZoom(9);
 *    self.mapApp.eventBus.addEventListener("cameraClick", function() {
 *       self.firstShow = true;
 *    });
 */
class MapFromGaode {
    constructor(domId) {
        this.mMap = null;
        this.domId = domId;
        this.mapOption = {
            amap: {
                zoom: 13,
                expandZoomRange: true,
                mapStyle: "amap://styles/0e33dafff393dfe89ee5d5a3bc2a280e",
                // mapStyle: "amap://styles/0a14dc424099e1dbe86de68f84ea7f60", // 省级
                center: null,
                rotation: 0,
                resizeEnable: true,
                disableSocket: true,
                viewMode: "3D",
                labelzIndex: 30,
                pitch: 20
            },
            animation: false,
            tooltip: {
                trigger: "item",
                backgroundColor: "transparent",
                position: function (point) {
                    return [point[0] - 418, point[1] - 167];
                },
                formatter: null
            },
            series: []
        };
        this.bounds = null;
        this.eventBus = new THREE.EventDispatcher(); // 3D事件中心
        this.markList = []; // 暂时存放marks
    }

    /**
     * 设置地图缩放比例
     * @param data (越大,地图越大)
     */
    setZoom(data) {
        this.mapOption.amap.zoom = data;
    }

    /**
     * 根据城市名更新地图
     * @param cityName '昆明市'
     */
    async updateCity(cityName) {
        const self = this;
        this.AMap = await this.MapLoader()

        let district = new window.AMap.DistrictSearch({
            subdistrict: 1,
            extensions: "all",
            level: "province" //  country国家 province 省/直辖市 district 区/县 biz_area 商圈
        });

        district.search(cityName, function (status, result) {
            const code = result.districtList[0].adcode;
            let bounds = result.districtList[0].boundaries;
            self.bounds = bounds;
            let mask = [];
            for (let i = 0; i < bounds.length; i += 1) {
                mask.push([bounds[i]]);
            }
            self.mapOption.amap.mask = mask;

            // 获取center
            let centerData = [result.districtList[0].center.lng, result.districtList[0].center.lat];
            self.mapOption.amap.center = centerData;

            // 初始化地图
            self.mMap = new AMap.Map(self.domId, self.mapOption.amap);

            self.addFaceCover(code);
            self.addHeight();
        });
    }

    /*
    * 添加3D高度地面
    * todo 暂时所有项目接口失效 -> 什么都没做,又好了
    * */
    addHeight(height = -20000) {
        // 添加高度面
        let object3Dlayer = new AMap.Object3DLayer({zIndex: 1});
        this.mMap.add(object3Dlayer);
        let color = "rgba(255,255,255,0.8)";// rgba
        let wall = new AMap.Object3D.Wall({
            path: this.bounds,
            height: height,
            color: color
        });
        wall.transparent = false;
        object3Dlayer.add(wall);
    }

    /*
    * 添加颜色面积覆盖
    * 县级及以下无法分割
    * */
    addFaceCover(code) {
        // 添加 县级 区域覆盖
        let disProvince = new AMap.DistrictLayer.Province({
            zIndex: 6,
            adcode: [code],
            depth: 3,
            styles: {
                "fill": "rgba(255, 255, 255, .1)",
                "province-stroke": "cornflowerblue",
                "city-stroke": "#55b7fe",
                "county-stroke": "#ffffff",
                "county-stroke-weight": 5
            }
        });
        disProvince.setMap(this.mMap);
    }

    /**
     * 根据点自适应可视区域
     */
    setFitView() {
        this.mMap.setFitView();
    }

    /**
     * const tootipMsg = {name: '俄罗斯',value: 16};
     * this.mapApp.addPoint(item.lng, item.lat, "为民服务站",tootipMsg);
     */
    addPoint(longitude, latitude, iconShape, tootipMsg) {
        let icon = null;
        if (iconShape == "为民服务站") {
            icon = new AMap.Icon({
                image: require("./imgs/mapIcon/为民服务站.png"),
                size: new AMap.Size(100, 100)
            });
        } else if (iconShape == "云岭先锋APP") {
            icon = new AMap.Icon({
                image: require("./imgs/mapIcon/云岭先锋APP.png"),
                size: new AMap.Size(100, 100)
            });
        } else if (iconShape == "党建TV") {
            icon = new AMap.Icon({
                image: require("./imgs/mapIcon/党建TV.png"),
                size: new AMap.Size(100, 100)
            });
        } else if (iconShape == "党建盒子") {
            icon = new AMap.Icon({
                image: require("./imgs/mapIcon/党建盒子.png"),
                size: new AMap.Size(100, 100)
            });
        } else {
            icon = new AMap.Icon({
                image: require("./imgs/11-raunruo.png"),
                // image: require("./imgs/摄像头.png"),
                size: new AMap.Size(40, 40)
            });
        }

        if (longitude && latitude) {
            const marker = new AMap.Marker({
                title: "组织名称:" + tootipMsg.name + "   " + "数量:" + tootipMsg.value,
                icon: icon, // 路径
                position: [longitude, latitude], // 位置
                // imageOffset: new AMap.Pixel(-9, -3), // 图标取图偏移量
                clickable: true,
                map: this.mMap
            });

            const self = this;
            marker.on("click", function (eee) {
                self.eventBus.dispatchEvent({type: "cameraClick", message: {id: tootipMsg.videoID}});
            });

            marker.on("mouseover", function (eee) {
                self.eventBus.dispatchEvent({
                    type: "cameraMouseover",
                    message: {name: tootipMsg.name, id: tootipMsg.videoID}
                });
            });

            this.markList.push(marker);
            this.mMap.add(marker); //  添加到地图
            // self.markerList.push(marker);
        }
    }

    /**
     * 清除所有点
     */
    removeAllPoint() {
        if (this.mMap) {
            this.mMap.remove(this.markList);
            this.markList = [];
        }
    }

    /*
    添加簇群
    */
    addClusterer() {
        // this.cluster = new AMap.MarkerClusterer(this.mMap, this.markerList, { gridSize: 20 });
    }

    /**
     * 销毁对象
     */
    destroy() {
        if (this.mMap) {
            this.mMap.destroy();
        }
    }

    static async findPlace(name) {
        const promise = new Promise(function (resolve, reject) {
            AMap.plugin("AMap.DistrictSearch", function () {
                var districtSearch = new AMap.DistrictSearch({
                    // 关键字对应的行政区级别，country表示国家
                    level: "district",
                    //  显示下级行政区级数，1表示返回下一级行政区
                    subdistrict: 1
                });

                // 搜索所有省/直辖市信息
                districtSearch.search(name, function (status, result) {
                    if (result.info == "OK") {
                        const center = {
                            lng: result.districtList[0].center.lng,
                            lat: result.districtList[0].center.lat
                        };
                        resolve(center);
                    }
                });
            });
        });

        return promise;
    }

    /**
     * 延时函数 等待引入地图
     * @returns {Promise<unknown>}
     * @constructor
     */
    async MapLoader() {
        return new Promise((resolve, reject) => {
            // 初始化引入文件
            if (window.AMap) {
                resolve(window.AMap)
            } else {
                setTimeout(function () {
                    if (window.AMap) {
                        resolve(window.AMap)
                    } else {
                        setTimeout(function () {
                            resolve(window.AMap)
                        }, 1000)
                    }
                }, 1000)
            }
        })
    }
}

export {MapFromGaode};
