<template>
    <div>
        <div class="value-strip" v-for="item in value">
            <div class="name">{{ item.name }}</div>
            <div class="backgroud">
                <div class="value" :style="{width: item.rate * 922 + 'px'}"></div>
            </div>
            <div class="value1">{{ item.value }}</div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'naomalValueStrip',
    data() {
        return {
            value: [
                {name: '昭阳区', rate: 0.2, value: 123},
                {name: '鲁甸区', rate: 0.5, value: 111},
                {name: '巧家县', rate: 0.2, value: 111},
                {name: '延津县', rate: 0.3, value: 111},
                {name: '昭阳区', rate: 0.2, value: 111},
                {name: '鲁甸区', rate: 0.5, value: 111},
                {name: '巧家县', rate: 0.2, value: 111},
                {name: '延津县', rate: 0.3, value: 111},
            ]
        }
    },
    props: {
        data: {
            type: Array,
            default: () => []
        }
    },
    watch: {
        data: {
            handler(newV) {
                let arr = []
                this.data.map(item => {
                    arr.push(item.cnt_times)
                })
                let max = Math.max(...arr)
                if (newV) {
                    this.value = this.data.map(item => {
                        return {
                            name: item.region_name, rate: item.cnt_times / (max * 2), value: item.cnt_times
                        }
                    })
                }
            },
            deep: true
        }
    },
    mounted() {

    }
}

</script>

<style lang="less" scoped>
.value-strip {
    margin-top: 38px;
    overflow: hidden;
    width: 100%;

    .name {
        display: inline-block;
        color: white;
        font-size: 20px;
        margin-right: 25px;
        height: 28px;
        position: relative;
        top: -8px;
        left: 0px;
    }

    .value1 {
        display: inline-block;
        margin-left: 25px;
        color: white;
        font-size: 20px;
        height: 28px;
        position: relative;
        top: -8px;
        left: 0px;
    }

    .backgroud {
        background-color: rgba(49, 134, 162, 0.5);
        width: 922px;
        height: 28px;
        display: inline-block;
        border-radius: 14px;

        .value {
            //background-color: rgba(82, 242, 234, 0.9);
            background-image: linear-gradient(to right, rgba(71, 134, 247, 1), white);
            width: 50px;
            height: 28px;
            border-radius: 14px;
            display: inline-block;
        }
    }

}
</style>
