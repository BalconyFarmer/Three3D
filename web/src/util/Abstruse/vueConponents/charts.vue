<template>
    <div class="height-full pos-rel">
        <div style="width: 100%;height: 100%" ref="x_chart" class="height-full chart-box"></div>
        <div class="no-data abs-center" v-if="noData">
            <div class="abs-center">
                <p class="align-center">暂无数据</p>
            </div>
        </div>
        <!--无数据-->
    </div>
</template>

<script>

    import "echarts-gl";

    let echarts = require("echarts/lib/echarts");
    require("echarts/lib/component/tooltip");
    require("echarts/lib/component/legend");
    require("echarts/lib/component/title");
    require("echarts/lib/component/markLine");
    require("echarts/lib/component/markArea");
    require("echarts/lib/component/axisPointer");
    export default {
        name: "charts",
        data() {
            return {
                noData: false,
                chart: {}
            };
        },
        props: ["options", "ifShowAnimate"],
        watch: {
            options: {
                handler(newV) {
                    let booo = this.options.series && this.options.series[0] && this.options.series[0].data && this.options.series[0].data.length;
                    if (this.options.series && (this.options.series.length === 1 && !booo)) {
                        this.noData = true;
                        this.chart.setOption({});
                        this.chart.clear();
                    } else {
                        this.noData = false;
                        if (!this.ifShowAnimate) this.chart.clear();
                        this.chart.setOption(newV);
                    }
                    this.$emit("init", this.chart);

                },
                deep: true
            }
        },
        methods: {
            clickMethods() {
                let mChart = echarts.init(this.$refs.x_chart);
                let _this = this;
                mChart.on("click", function (params) {
                    _this.$emit("chart-click", params);
                });
                mChart.on("click", "series.tree.label", function (params) {
                    _this.$emit("chart-label-click", params);
                });
            }
        },
        mounted() {
            this.chart = echarts.init(this.$refs.x_chart);
            this.chart.setOption(this.options);
            this.clickMethods();
            this.$emit("init", this.chart);
        },
        beforeDestroy() {
            this.chart.clear();
        }
    };
</script>

<style scoped>
    .no-data {
        width: 100%;
        height: 100%;
    }

    .no-data p {
        margin-top: 15px;
        font-size: 20px;
        color: #ccc;
    }
</style>
