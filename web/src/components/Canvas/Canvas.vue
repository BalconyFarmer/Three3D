<template>
    <div id="canvasContainer">
        <button @click="drawLine" class="save">绘制线段</button>
        <button @click="addCircle" class="save">绘制圆</button>
        <button @click="addRect" class="save">绘制矩形</button>
        <button @click="addText" class="save">addText</button>
        <button @click="saveHandler" class="save">保存</button>
    </div>
</template>

<script>
import {App2D} from './App2D'

const FileSaver = require('file-saver');

export default {
    methods: {
        drawLine() {
            this.app2D.addLine()
        },
        addCircle() {
            this.app2D.addCircle()
        },
        addRect() {
            this.app2D.addRect()
        },
        addText() {
            this.app2D.addText()
        },
        saveHandler() {
            let data = {
                name: "hanmeimei",
                age: 88,
                say: function () {
                    console.log(this.name)
                }
            }
            const content = JSON.stringify(data);

            // const content0 = {...this.easelApp};
            // const content = JSON.stringify(content0) //Converting circular

            const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, "hello world.txt");
        }
    },
    mounted() {
        this.app2D = new App2D("canvasContainer")
    }
}

</script>

<style>
.save {
    /*position: absolute;*/
    /*left: 800px;*/
    /*top: 800px;*/
}

#canvasContainer {
    width: 100%;
    height: 100%;
}
</style>
