import * as THREE from "three";

/**
 * 属性
 * geometry.vertices
 * geometry.faces
 */
export class MakeGeometryMesh {
    constructor(app) {
        this.app = app
        this.geometry = null
        this.mesh = null

    }

    start() {
        this.makeGeometryMesh()
        this.makeGeometryFace()
        this.makeGeometry()
        this.addToScene()
    }

    makeGeometry() {
/*        /!**
         * 创建网格模型
         *!/
        this.geometry = new THREE.Geometry(); //声明一个几何体对象Geometry
        const p1 = new THREE.Vector3(50, 0, 0); //顶点1坐标
        const p2 = new THREE.Vector3(0, 70, 0); //顶点2坐标
        const p3 = new THREE.Vector3(80, 70, 0); //顶点3坐标
        //顶点坐标添加到geometry对象
        this.geometry.vertices.push(p1, p2, p3);*/
    }

    makeGeometryMesh() {
        // 点材质 失效
        const material = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 5.0 //点对象像素尺寸
        });

        //材质对象//线条模型对象
        // const materials = new THREE.LineBasicMaterial({color: 0xffff00});

        // 面 失效
        // const materials = new THREE.MeshBasicMaterial({
        //     color: 0x0000ff, //三角面颜色
        //     side: THREE.DoubleSide //两面可见
        // });

        this.mesh = new THREE.Line(this.geometry, material);
    }

    makeGeometryFace() {
/*        const geometry = new THREE.Geometry(); //声明一个几何体对象Geometry

        const p1 = new THREE.Vector3(0, 0, 0); //顶点1坐标
        const p2 = new THREE.Vector3(0, 100, 0); //顶点2坐标
        const p3 = new THREE.Vector3(50, 0, 0); //顶点3坐标
        const p4 = new THREE.Vector3(0, 0, 100); //顶点4坐标
        //顶点坐标添加到geometry对象
        geometry.vertices.push(p1, p2, p3, p4);

        // Face3构造函数创建一个三角面
        const face1 = new THREE.Face3(0, 1, 2);
        // 三角面每个顶点的法向量
        const n1 = new THREE.Vector3(0, 0, -1); //三角面Face1顶点1的法向量
        const n2 = new THREE.Vector3(0, 0, -1); //三角面2Face2顶点2的法向量
        const n3 = new THREE.Vector3(0, 0, -1); //三角面3Face3顶点3的法向量
        // 设置三角面Face3三个顶点的法向量
        face1.vertexNormals.push(n1, n2, n3);

        // 三角面2
        const face2 = new THREE.Face3(0, 2, 3);
        // 设置三角面法向量
        face2.normal = new THREE.Vector3(0, -1, 0);

        //三角面face1、face2添加到几何体中
        geometry.faces.push(face1, face2);

        //材质对象
        const material = new THREE.MeshLambertMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide//两面可见
        });

        //网格模型对象
        const mesh = new THREE.Mesh(geometry, material);
        this.app.scene.add(mesh)*/
    }

    addToScene() {
        this.app.scene.add(this.mesh); //线条对象添加到场景中
    }

}
