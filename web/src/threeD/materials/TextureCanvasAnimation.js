import * as THREE from "three";
import {App2D} from '../../components/ExperimentArea/Canvas/App2D'

export class TextureCanvasAnimation {
    constructor(app) {
        this.app = app
        this.canvas = null
        this.makeCanvas()
        this.app2D = new App2D()
        this.canvasDom = document.getElementById('easelCanvasId')
    }

    makeCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 512;
        this.canvas.height = 128;
        const c = this.canvas.getContext('2d');
        // 矩形区域填充背景
        c.fillStyle = "#ff00ff";
        c.fillRect(0, 0, 512, 128);
        c.beginPath();
        // 文字
        c.beginPath();
        c.translate(256, 64);
        c.fillStyle = "#000000"; //文本填充颜色
        c.font = "bold 48px 宋体"; //字体样式设置
        c.textBaseline = "middle"; //文本与fillText定义的纵坐标
        c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
        c.fillText("博客博客博客", 0, 0);
        // document.body.appendChild(this.canvas)
    }

    addMesh() {
        const texture = new THREE.CanvasTexture(this.canvas);
        const geometry = new THREE.PlaneGeometry(128, 32);
        const material = new THREE.MeshPhongMaterial({map: texture});
        const mesh = new THREE.Mesh(geometry, material);
        this.app.scene.add(mesh)
    }

}
