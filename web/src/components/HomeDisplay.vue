<template>
    <div>
        <br>
        <br>

        <div class=" wordPicContainer">
            <div v-for="item in allMsg" :key="item.message" id="wordPicContainerSub">
                <img v-if='item.picData' :src="item.picData" id="wordPic">
                <div id="wordPicString">{{ item.msg }}</div>
                <a-icon type="like" id="likeit"/>
            </div>
        </div>

    </div>
</template>

<script>
import eventBus from '@/util/eventBus.js';
import {getPicList} from '@/api/api'

export default {
    data() {
        return {
            allMsg: null
        }
    },
    methods: {
        loadAllMsg() {
            getPicList()
                .then((response) => {
                    this.allMsg = response.data
                })
                .catch(error => this.$notification.open({message: error}));
        },
        enableScroll() {
            document.body.parentNode.style.overflow = "auto";
        }
    },
    created() {
        const self = this
        eventBus.on(eventBus.TYPES.EVENT1.ADD.CONFIRM, (data) => {
            self.loadAllMsg()
        })
    },
    mounted() {
        this.loadAllMsg()
        this.enableScroll()
    }
}
</script>

<style lang="less">
@value: 0.01;

.wordPicContainer {

    position: relative;
    left: calc(100vw * (@value / 2));
    width: calc(100vw * (1 - @value));

    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    #wordPicContainerSub {
        width: 360px;
        height: 300px;
        margin: 10px;

        #wordPic {
            width: 360px;
            height: 277px;
        }

        #wordPicString {
            display: inline;
        }

        #likeit {
            margin-left: 314px;
        }
    }
}
</style>
