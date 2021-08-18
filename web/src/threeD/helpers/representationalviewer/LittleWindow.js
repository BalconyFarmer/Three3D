import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export class LittleWindow {
    constructor(app) {
        this.app = app
        this.dom = null

        this.scene = null
        this.camera = null
        this.renderer = null
    }

    addCasterEvent(littleWindowDom) {
        const self = this
        this.dom = littleWindowDom
        this.init3D()
        this.app.raycasterHelper.startRaycast()
        this.app.raycasterHelper.atSelectMesh(function (mesh) {
            if (mesh) {
                self.show(mesh.clone())
            }
        })
    }

    show(mesh) {
        this.scene.add(mesh)
        if (this.boxHelper) {
            this.app.scene.remove(this.boxHelper)
        }
        this.boxHelper = new THREE.BoxHelper(mesh, 0xffff00);
        this.boxHelper.cname = '选择网格辅助'
        this.app.scene.add(this.boxHelper);
    }

    init3D() {
        this.initScene()
        this.initCamera()
        this.initLight(0.7)
        this.initRenderer()
        this.initControls()
        this.addAxes()
        this.addRenderEvent()
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.autoUpdate = true
        const backgroundColor = new THREE.Color(0x888888)// 浅灰
        this.scene.background = backgroundColor
    }

    initCamera() {
        const width = this.dom.width
        const height = this.dom.height;
        const k = width / height; //窗口宽高比
        const s = 20; //三维场景显示范围控制系数，系数越大，显示的范围越大

        //创建相机对象 PerspectiveCamera透视相机  OrthographicCamera 正交相机
        this.camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 10000);
        // this.camera = new THREE.PerspectiveCamera(45, k, 1, 10000);

        //设置相机位置
        this.camera.position.set(100, 100, 100);
        //设置相机方向(指向的场景对象)
        this.camera.lookAt(this.scene.position);
    }

    initLight(intensity) {

        //环境光 均匀 无方向 无阴影
        const ambient = new THREE.AmbientLight(0x444444, intensity);

        // 点光源位置
        const point0 = new THREE.PointLight(0xffffff, intensity);
        point0.position.set(500, 0, 0);

        const point1 = new THREE.PointLight(0xffffff, intensity);
        point1.position.set(-500, 0, 0);

        const point2 = new THREE.PointLight(0xffffff, intensity);
        point2.position.set(0, 500, 0);

        const point3 = new THREE.PointLight(0xffffff, intensity);
        point3.position.set(0, -500, 0);

        const point4 = new THREE.PointLight(0xffffff, intensity);
        point4.position.set(0, 0, 500);

        const point5 = new THREE.PointLight(0xffffff, intensity);
        point5.position.set(0, 0, -500);

        // 平行光 DirectionalLight
        // 半球光（HemisphereLight）
        // 平面光光源（RectAreaLight）

        //点光源添加到场景中
        this.scene.add(ambient, point0, point1, point2, point3, point4, point5);
    }

    initRenderer() {
        const width = this.dom.width
        const height = this.dom.height;
        this.renderer = new THREE.WebGLRenderer({canvas: this.dom});
        //设置渲染区域尺寸
        this.renderer.setSize(width, height);
        //设置背景颜色
        this.renderer.setClearColor(0xb9d3ff, 1);
        this.renderer.render(this.scene, this.camera); //执行渲染操作
    }

    initControls() {
        this.controller = new OrbitControls(this.camera, this.renderer.domElement);
    }

    addAxes() {
        this.axes = new THREE.AxesHelper(100);
        this.scene.add(this.axes)
        this.renderer.render(this.scene, this.camera); //执行渲染操作
    }

    addRenderEvent() {
        const self = this
        this.dom.onmousemove = function () {
            self.onRender()
        }
    }

    removeRenderEvent() {
        this.dom.onmousemove = null
    }

    onRender() {
        this.renderer.render(this.scene, this.camera); //执行渲染操作
    }

    destroy() {
        this.removeRenderEvent.bind(this)()
        if (this.boxHelper) {
            this.app.scene.remove(this.boxHelper)
        }
        this.app.transformMesh.removeEvent()
        this.scene = null
        this.camera = null
        this.renderer = null
        this.dom = null
    }
}
