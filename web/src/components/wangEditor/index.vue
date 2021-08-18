<template>
    <div>
        <div id="div1">
            <p>欢迎使用 <b>wangEditor</b> 富文本编辑器</p>
        </div>
        <a-button @click="handleClick" type="primary">
            Primary
        </a-button>
        <div id="editorContent">
            {{ editorContent }}
        </div>
    </div>

</template>

<script>
import E from 'wangeditor'

export default {
    name: "index",
    data() {
      return {
          editorContent: null,
          editorApp: null
      }
    },
    methods: {
        init() {
            this.editorApp = new E('#div1')
            this.editorApp.create()
        },
        handleClick () {
            const html = this.editorApp.txt.html() // 获取html
            const dom = document.getElementById('editorContent')
            dom.innerHTML = html

            const jsonData = this.editorApp.txt.getJSON() // 获取json
            // debugger
            // console.log(jsonData,'+++++++++')

            // editor.txt.clear()
            // editor.txt.setJSON(jsonData) // 设置json
        }
    },
    mounted() {
        this.init()
    }
}
</script>

<style scoped>

</style>
