import * as THREE from "three";

export class SpritCanvas {
    constructor(app) {
        this.app = app
    }

    /**
     * canvas显示
     * @param arrowDirection 文字位置
     * @param string 文本
     */
    makeSpritCanvas(arrowDirection, string) {
        const canvasDom = document.createElement('canvas');
        const context = canvasDom.getContext('2d');

        // 绘制文字
        context.font = "bold 100px Serif";
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillStyle = "#ffffff";
        context.fillText(string, 0, 0);

        // 矩形区域填充背景
        // context.fillStyle = "#ffffff";
        // context.fillRect(0, 0, 512, 128);
        // context.beginPath();

        const canvasTexture = new THREE.CanvasTexture(canvasDom);
        canvasTexture.needsUpdate = true;

        const spritMaterial = new THREE.SpriteMaterial({
            map: canvasTexture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spritMaterial);

        sprite.scale.set(10, 10, 10);
        sprite.position.x = arrowDirection.x
        sprite.position.y = arrowDirection.y
        sprite.position.z = arrowDirection.z
        return sprite
    }
}
