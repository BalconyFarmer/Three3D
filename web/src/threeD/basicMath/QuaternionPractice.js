import * as THREE from "three";

/**
 * 四元数对象Quaternion使用x、y、z和w四个分量表示。
 * 在三维空间中一个旋转由一个旋转轴、一个旋转角度和旋转方向来唯一确定。
 */
export class QuaternionPractice {
    constructor(app) {
        this.app = app
    }

    makeMesh() {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        const vector = new THREE.Vector3(1, 0, 0);
        vector.applyQuaternion(quaternion);
        console.log('vector', vector)
    }
}
