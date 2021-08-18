import * as THREE from "three";

/**
 * 观察 坐标 + 向量
 */
export class ArrowLine {
    constructor(app) {
        this.app = app
        this.line = null
        this.arrow = null
    }

    showArrowLine(direction, position) {
        this.makeLine(direction, position)
    }

    /**
     * 制作线
     * @param direction 向量
     * @param position  向量起点位置
     */
    makeLine(direction, position) {
        // TODO radomColor
        const arrowDirection = direction
        arrowDirection.normalize();
        const arrowPoint = position
        const arrowLength = 10;
        const arrowColor = 0xFFFFFF * Math.random();
        this.arrowHelper = new THREE.ArrowHelper(arrowDirection, arrowPoint, arrowLength, arrowColor);
        this.app.scene.add(this.arrowHelper);

        this.makeSphere(position, arrowColor)
    }

    /**
     * 制作原点
     * @param position
     */
    makeSphere(position, color) {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({color: color});
        this.arrow = new THREE.Mesh(geometry, material);
        this.arrow.position.x = position.x
        this.arrow.position.y = position.y
        this.arrow.position.z = position.z
        this.app.scene.add(this.arrow); // TODO 重复添加
    }

    clearPrev() {
        if (this.line && this.arrow) {
            this.app.scene.remove(this.arrow)
            this.app.scene.remove(this.line)
            this.arrow.dispose()
            this.line.dispose()
        }
    }

}
