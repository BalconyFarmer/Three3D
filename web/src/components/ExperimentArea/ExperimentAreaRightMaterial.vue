<template>
    <div id='rightToolClassSubMatrial'>
        <canvas id="c"></canvas>
        <div id="content"></div>
    </div>
</template>

<script>
export default {
    props: {
        app3D: Object,
        required: true
    },
    data() {
        return {}
    },
    mounted() {
        this.$nextTick(function () {
            const canvas = document.getElementById("c");
            const content = document.getElementById("content");
            this.app3D.multipleElements.makeMaterials()
            this.app3D.multipleElements.run(canvas, content)
        })
    },
    beforeDestroy() {
        this.app3D.multipleElements.destroy()
    }
}
</script>

<style lang="less">
@import '../0main.less';

#rightToolClassSubMatrial {
    float: left;
    display: inline;
    width: 275px;
    height: calc(100vh);
    background-color: @center;
    border: solid #99A1A9 1px;

    /*内容尺寸*/

    #content {
        position: fixed;
        left: calc(100vw - 300px);
        top: 50px;
        width: 270px;
        height: 100%;
        z-index: 1;
        padding: 3em 0 0 0;
    }

    /*canvas尺寸*/

    #c {
        position: fixed;
        left: calc(100vw - 300px);
        width: 270px;
        height: 100%;
        border: #1b1b1b solid 1px;
    }

    .list-item {
        display: inline-block;
        margin: 1px;
        margin-left: 22px;
        padding: 1px;
        box-shadow: 1px 2px 4px 0px rgba(0, 0, 0, 0.25);

        width: 100px;
        height: 100px;

    }

    .list-item .scene {
        width: 100px;
        height: 100px;
    }

    .list-item .description {
        color: #888;
        font-family: sans-serif;
        font-size: large;
        width: 100px;
        margin-top: 0.5em;
        border: #1b1b1b solid 1px;

    }
}
</style>
