<template>
    <div class="all_3DMenu">
        <canvas width="2000px" height="1000px" style="z-index: 99999;"
                id="D3Container"></canvas>
    </div>
</template>

<script>
import {Menu3D} from "./Menu3D";

export default {
    name: "Menu3d",
    methods: {
        init3D() {
            const self = this
            const dom = document.getElementById('D3Container')

            const menuData = [
                {assert: '党员教育0.png', routerAdress: "/PartyMemberPortrait"},
                {assert: '党员教育0.png', routerAdress: "/PartyMemberPortrait"},
                {assert: '党员教育0.png', routerAdress: "/PartyMemberPortrait"},
                {assert: '党员教育0.png', routerAdress: "/PartyMemberPortrait"},
            ]

            this.menu3D = new Menu3D(dom)
            this.menu3D.init3D(menuData)

            this.menu3D.eventBus.addEventListener('jumpRoute', function (data) {
                console.log(data.message, 'data.messagedata.messagedata.messagedata.message')
                self.$router.push(data.message)
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
    margin-top: 1%;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: #252526;
}
</style>
