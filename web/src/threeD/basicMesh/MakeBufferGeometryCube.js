import * as THREE from "three";

/**
 * 手动构建四面形
 */
export class MakeBufferGeometryCube {
    constructor(app) {
        this.app = app
        this.bufferGeometry = null

        this.makeBufGeo(20)
        this.addIndex()
        this.addNormals()
        this.adUV()
        this.addToScene()
    }

    makeBufGeo() {
        const self = this
        this.bufferGeometry = new THREE.BufferGeometry()
        let vertices = []

        function makePlane(point0, point1, point2, point3) {
            vertices.push(point0.x, point0.y, point0.z)
            vertices.push(point1.x, point1.y, point1.z)
            vertices.push(point2.x, point2.y, point2.z)

            vertices.push(point0.x, point0.y, point0.z)
            vertices.push(point2.x, point2.y, point2.z)
            vertices.push(point3.x, point3.y, point3.z)
        }

        const V0 = new THREE.Vector3(0, 0, 0)
        const V1 = new THREE.Vector3(10, 0, 0)
        const V2 = new THREE.Vector3(10, 10, 0)
        const V3 = new THREE.Vector3(0, 10, 0)
        makePlane(V0, V1, V2, V3)

        const w0 = new THREE.Vector3(0, 0, 0)
        const w1 = new THREE.Vector3(10, 0, 0)
        const w2 = new THREE.Vector3(10, 0, 10)
        const w3 = new THREE.Vector3(0, 0, 10)
        makePlane(w0, w1, w2, w3)

        const x0 = new THREE.Vector3(0, 0, 10)
        const x1 = new THREE.Vector3(10, 0, 10)
        const x2 = new THREE.Vector3(10, 10, 10)
        const x3 = new THREE.Vector3(0, 10, 10)
        makePlane(x0, x1, x2, x3)

        const y0 = new THREE.Vector3(0, 10, 0)
        const y1 = new THREE.Vector3(10, 10, 0)
        const y2 = new THREE.Vector3(10, 10, 10)
        const y3 = new THREE.Vector3(0, 10, 10)
        makePlane(y0, y1, y2, y3)

        const bufferVertices = new Float32Array(vertices);
        const attribue = new THREE.BufferAttribute(bufferVertices, 3);
        self.bufferGeometry.attributes.position = attribue;
    }

    /**
     * 添加索引,顶点复用
     */
    addIndex() {
        // for (i = 1; i <= segments; i++) {
        //     indices.push(i, i + 1, 0);
        // }
    }

    /**
     * 添加顶点向量,用于材质显示
     */
    addNormals() {
        const normals = new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ]);
        this.bufferGeometry.attributes.normal = new THREE.BufferAttribute(normals, 3); //3个为一组,表示一个顶点的xyz坐标
    }

    /**
     * 添加UV值,用于贴图
     */
    adUV() {
        // let uv = new Vector2();
        // uv.x = (vertices[i] / radius + 1) / 2;
        // uv.y = (vertices[i + 1] / radius + 1) / 2;
    }

    addToScene() {
        const material = new THREE.MeshLambertMaterial({color: 0x0000ff, side: THREE.DoubleSide});
        this.mesh = new THREE.Mesh(this.bufferGeometry, material);
        this.app.scene.add(this.mesh)
    }

}
