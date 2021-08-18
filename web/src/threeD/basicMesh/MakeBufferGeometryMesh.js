import * as THREE from "three";

/**
 * 属性
 * bufferGeometry.attributes.position
 * bufferGeometry.index
 */
export class MakeBufferGeometryMesh {
    constructor(app) {
        this.app = app
        this.bufferGeometry = null
        this.mesh = null
    }

    start() {
        this.makeBufferGeometry()
        this.makeBufferGeometryMesh()
        this.addToScene()
    }

    makeBufferGeometry() {
        const self = this
        this.bufferGeometry = new THREE.BufferGeometry();

        function addVertices() {
            const vertices = new Float32Array([
                0, 0, 0,
                20, 0, 0,
                0, 20, 0,

                20, 0, 0,
                0, 20, 0,
                20, 20, 0

                // 1, 1, 9,
                // 6, 5, 108,
                // 48, 1, 3,

                // 20, 20, 20,
                // 0, 0, 0,
                // 20, 20, 0,
            ]);
            // 创建属性缓冲区对象
            const attribue = new THREE.BufferAttribute(vertices, 3);
            self.bufferGeometry.attributes.position = attribue;
        }

        addVertices()

        // 顶点法向量数据
        function addNormals() {
            const normals = new Float32Array([
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
            ]);
            // 设置几何体attributes属性的位置normal属性
            this.bufferGeometry.attributes.normal = new THREE.BufferAttribute(normals, 3); //3个为一组,表示一个顶点的xyz坐标
        }

        // addNormals()

        function addIndex() {
            const indexes = new Uint16Array([
                0, 1, 2,
                1, 2, 3,
            ])
            // // 索引数据赋n值给几何体的idex属性
            self.bufferGeometry.index = new THREE.BufferAttribute(indexes, 1); //1个为一组
        }

        // addIndex()

        // 顶点纹理坐标UV数据
        function addUV() {

        }

        this.bufferGeometry.computeBoundingBox()
        const bondingBox = this.bufferGeometry.boundingBox
        const boundingSphere = this.bufferGeometry.boundingSphere
        return this.bufferGeometry
    }

    makeBufferGeometryMesh() {
        const self = this

        function makePoint() {
            const material = new THREE.PointsMaterial({
                color: 0xff0000,
                size: 20.0
            });
            self.mesh = new THREE.Points(self.bufferGeometry, material);
        }

        // makePoint()

        function makeLine() {
            const material = new THREE.LineBasicMaterial({color: 0xff0000});
            self.mesh = new THREE.Line(self.bufferGeometry, material);
        }

        // makeLine()

        function makeMesh() {
            const material = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
            self.mesh = new THREE.Mesh(self.bufferGeometry, material);
        }

        makeMesh()
    }

    addToScene() {
        this.app.scene.add(this.mesh)
    }
}
