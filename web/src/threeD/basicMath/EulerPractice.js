import * as THREE from "three";
import {Helper} from "../helpers/Helper";

/**
 * 欧拉角描述一个旋转变换，
 * 通过指定轴顺序和其各个轴向上的指定旋转角度来旋转一个物体。
 * 下面我们开看看它的方法
 */
export class EulerPractice {
    constructor(app) {
        this.app = app
        this.mesh = null

    }

    start() {
        this.makeMesh()
        this.applyEuler()
    }

    makeMesh() {
        const vetic = new THREE.Vector3(10, 0, 0)
        this.mesh = Helper.addVerticHelper(vetic.x, vetic.y, vetic.z, 2, this.app.scene)
    }

    applyEuler() {
        const a = new THREE.Euler(0, 1, 1.57, 'XYZ');
        const b = new THREE.Vector3(1, 0, 1);
        b.applyEuler(a);
    }

}
