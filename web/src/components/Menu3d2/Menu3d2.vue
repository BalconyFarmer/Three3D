<template>
    <div class="all_3DMenu">
        <canvas width="2000" height="1000" style="z-index: 99999; border: 1px solid yellow"
                id="D3Container"></canvas>

        <div class="top"></div>
    </div>
</template>

<script>
import {Menu3D1} from "./Menu3D1";

export default {
    name: "Menu3DV1.vue",
    data() {
        return {}
    },
    methods: {
        init3D() {
            const self = this
            const dom = document.getElementById('D3Container')

            const menuData = [
                {assert: '绿底.png', routerAdress: 1},
                {assert: '蓝底.png', routerAdress: 2},
                {assert: '黄底.png', routerAdress: 3},
                {assert: '绿底.png', routerAdress: 4},
                {assert: '蓝底.png', routerAdress: 5},
                {assert: '黄底.png', routerAdress: 6},
                {assert: '绿底.png', routerAdress: 7},
                {assert: '蓝底.png', routerAdress: 8},
            ]

            this.menu3D = new Menu3D1(dom)
            this.menu3D.init3D(menuData)

            this.menu3D.eventBus.addEventListener('jumpRoute', function (data) {
                self.menu3D.moveTo(data.message)
            })
        },
    },
    mounted() {
        this.init3D()
    }
}
</script>

<style scoped>

.all_3DMenu {
    margin: 0;
    overflow: hidden;
    background: url("./imgs/baseMap.png") center no-repeat;
    background-size: 40% 40%;
    background-position: center 55%;
    background-color: #252526;
}

.top {
    position: absolute;
    left: calc(50vw - 110px);
    top: 370px;
    width: calc(342px / 1.5);
    height: calc(318px / 1.5);
    background-image: url("./imgs/baseLogo.png");
    background-size: 100% 100%;
    z-index: 99999;
}

.all_3DMenu {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>
