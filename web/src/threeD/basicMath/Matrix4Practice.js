import * as THREE from "three";

/**
 * 指定轴旋转
 * https://blog.csdn.net/weixin_42390878/article/details/82258216
 */
export class Matrix4Practice {
    constructor(app) {
        this.app = app
        this.mesh = null
    }

    start() {
        this.makeMesh()
        this.makeTranslation()
        this.makeScale()
        this.makeRotationX()
    }

    makeMesh() {
        const geometry = new THREE.BoxBufferGeometry(10, 10, 10);
        const material = new THREE.MeshLambertMaterial({color: 0x00ff00});
        this.mesh = new THREE.Mesh(geometry, material);
        this.app.scene.add(this.mesh);
        console.log('this.mesh.matrix', this.mesh.matrix) // 相对于父对象,没有就相对于世界
        console.log('this.mesh.matrixWorld', this.mesh.matrixWorld) // 相对于世界
        this.mesh.translateY(5)

        this.mesh.updateMatrix()
        this.mesh.updateMatrixWorld()
        // this.mesh.updateWorldMatrix()
    }

    /**
     * 平移矩阵
     */
    makeTranslation() {
        let translationY = new THREE.Matrix4();
        translationY.makeTranslation(0, 15, 0);
        this.mesh.matrix = translationY
        //使用矩阵更新模型的信息
        this.mesh.matrix.decompose(this.mesh.position, this.mesh.quaternion, this.mesh.scale);
    }

    /**
     * 缩放矩阵
     */
    makeScale() {
        let scaleY = new THREE.Matrix4();
        scaleY.makeScale(1, 5, 1)
        this.mesh.matrix = scaleY
        this.mesh.matrix.decompose(this.mesh.position, this.mesh.quaternion, this.mesh.scale);
    }

    /**
     * 旋转矩阵
     */
    makeRotationX() {
        let RotationX = new THREE.Matrix4();
        RotationX.makeRotationX(15);
        this.mesh.matrix = RotationX
        //使用矩阵更新模型的信息
        this.mesh.matrix.decompose(this.mesh.position, this.mesh.quaternion, this.mesh.scale);
    }

}
