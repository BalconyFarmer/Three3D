<template>
    <div>
        <canvas id="canvas" :width="width" :height="height" ref="canvas"></canvas>
    </div>
</template>

<script>
import {BarChartCanvas} from './barChartCanvas'

export default {
    name: "BarChart",
    props: {
        width: {
            type: Number,
            default: () => {
            }
        },
        height: {
            type: Number,
            default: () => {
            }
        },
        color: {
            type: String,
            default: () => {
            }
        },
        value: {
            type: Number,
            default: () => {
            }
        },
    },
    data() {
        return {
            canvasApp: null
        };
    },
    watch: {
        value: {
            handler(newValue) {
                this.canvasApp.update(newValue)
            },
            deep: true
        }
    },
    mounted() {
        this.canvasApp = new BarChartCanvas(this.$refs.canvas, this.width, this.height, this.value, this.color)
    },
    computed: {},
    methods: {}
};
</script>

<style lang="less">
#canvas {
    border: #4690DC solid 1px;
}
</style>
