<!--
    <WaterBall :data="0.5">实名率</WaterBall> 蓝色
    <WaterBall :data="0.7" :special="true">达标率</WaterBall> 绿色
-->

<template>
    <div class="ballContainer">
        <charts style="width: 100%;height: 100%" :options="mockWaterBall" class="liquidBall" v-if="mockWaterBall.series" ref="mapChart"></charts>
        <img class="imgMy" :src="url">
    </div>
</template>

<script>
import Charts from "../charts";

export default {
    name: "water-ball",
    components: { Charts },
    props: ["data", "special"],
    data() {
        return {
            mockWaterBall: {
                series: [{
                    type: "liquidFill",
                    radius: '88%', // 水球大小
                    fontSize: 16,
                    data: [0.1, 0.11],
                    color: ["#7de5e9", "#57CEE1"],
                    outline: {
                        show: false
                    },
                    name: "Liquid Fill",
                    backgroundStyle: {
                        color: "rgba(0, 0, 0, 0.1)"
                    }
                }],
                tooltip: {
                    show: false
                }
            },
            url: require("./imgs/blueBall.png")
        };
    },
    methods: {
        init() {
            this.mockWaterBall.series[0].data = [this.data, this.data + 0.01];
        }
    },
    watch: {
        data: {
            handler(value, oldValue) {
                this.init();
            },
            deep: true
        }
    },
    mounted() {
        this.init();
        if(this.special) {
            this.url = require("./imgs/greenBall.png");
            this.mockWaterBall.series[0].color = ["#6FD09F", "#62C9C4"];
        }
    }
};
</script>

<style scoped lang="less">
.ballContainer {
    //border: #00FF00 1px solid;
    position: relative;
    width: 100%;
    height: 100%;
    .liquidBall {
        width: 100%;
        height: 100%;
    }

    .imgMy {
        position: absolute;
        left: 0px;
        top: 0px;
    }

    .name {
        position: absolute;
        top: 273px;
        left: 112px;
    }
}
</style>
