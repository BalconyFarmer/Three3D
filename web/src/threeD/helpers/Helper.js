import * as THREE from "three";
// import Stats from 'Stats'
import {SpritCanvas} from './representationalviewer/SpritCanvas'
import {CubeMesh} from "./representationalviewer/CubeMesh";
// import {FaceNormalsHelper} from 'three/examples/jsm/helpers/FaceNormalsHelper.js' // 文档说移除了
import {VertexNormalsHelper} from 'three/examples/jsm/helpers/VertexNormalsHelper'

/**
 * 场景辅助器类
 * 页面添加标签  <div id="Stats-output"></div>
 */
export class Helper {
    constructor(app) {
        this.app = app
        // this.stats = new Stats();
        this.statsDom = null
        // this.stats.setMode(1); // 0: fps, 1: ms
        this.gridHelper = null
        this.axes = null
        this.axesMarksList = []
        this.arrowHelper = null
        this.boxHelper = null
        this.box3Helper = null
        this.cameraHelper = null
        this.marksGroup = new THREE.Group()
        this.lightHelperList = []
    }

    /**
     * 性能检测辅助器
     */
    addStats() {
        // document.body.appendChild(this.stats.domElement)
        // this.stats.domElement.style.position = 'absolute'
        // this.stats.domElement.style.left = '0px'
        // this.stats.domElement.style.top = document.body.clientHeight - 50 + 'px'
        //
        // const self = this
        // this.app.renderQueue.push(
        //     function updateStats() {
        //         if (self.stats) {
        //             self.stats.update();
        //         }
        //     }
        // )
    }

    removeStats() {
        // document.body.removeChild(this.stats.domElement)
        //
        // let indexDelete = NaN
        // this.app.renderQueue.forEach((item, index) => {
        //     if (item.name === 'updateStats') {
        //         indexDelete = index
        //     }
        // })
        // this.app.renderQueue.splice(indexDelete, 1)
    }

    /**
     * 坐标轴辅助器
     */
    addAxes() {
        this.marksGroup.cname = '世界坐标轴'
        const self = this
        this.axes = new THREE.AxesHelper(100);
        this.marksGroup.add(this.axes)

        function makeXAxesMarks(position, axes) {
            let material = null
            let points = [];
            if (axes === 'x') {
                material = new THREE.LineBasicMaterial({color: 0xff0000});
                points.push(new THREE.Vector3(position, 0, 0));
                points.push(new THREE.Vector3(position, 10, 0));
            } else if (axes === 'y') {
                material = new THREE.LineBasicMaterial({color: 0x00ff00});
                points = [];
                points.push(new THREE.Vector3(0, position, 0));
                points.push(new THREE.Vector3(10, position, 0));
            } else if (axes === 'z') {
                material = new THREE.LineBasicMaterial({color: 0x0000ff});
                points = [];
                points.push(new THREE.Vector3(0, 0, position));
                points.push(new THREE.Vector3(0, 10, position));
            }

            if (axes === 'x') {
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, material);
                self.marksGroup.add(line)
            } else if (axes === 'y') {
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, material);
                self.marksGroup.add(line)

            } else if (axes === 'z') {
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, material);
                self.marksGroup.add(line)

            }
        }

        for (let i = 0; i < 10; i++) {
            makeXAxesMarks(i * 10, "x")
            makeXAxesMarks(i * 10, "y")
            makeXAxesMarks(i * 10, "z")
        }

        function makeString() {
            const canvasTexture = new SpritCanvas(self.app)

            const XPosition = new THREE.Vector3(100, 0, 0)
            const sprit0 = canvasTexture.makeSpritCanvas(XPosition, 'x-100')
            self.marksGroup.add(sprit0)


            const YPosition = new THREE.Vector3(0, 100, 0)
            const sprit1 = canvasTexture.makeSpritCanvas(YPosition, 'y-100')
            self.marksGroup.add(sprit1)

            const ZPosition = new THREE.Vector3(0, 0, 100)
            const sprit2 = canvasTexture.makeSpritCanvas(ZPosition, 'z-100')
            self.marksGroup.add(sprit2)


        }

        makeString()

        this.app.scene.add(this.marksGroup)

    }

    removeAxes() {
        this.app.scene.remove(this.marksGroup)
    }

    /**
     * 地面网格辅助器
     */
    addGridhelper() {
        const size = 1000;
        const divisions = 10;
        this.gridHelper = new THREE.Group()
        this.gridHelper.cname = '地面网格 '
        const geometry = new THREE.PlaneBufferGeometry(1000, 1000, 32);
        const material = new THREE.MeshPhongMaterial({color: 0xffff00, side: THREE.DoubleSide});
        material.transparent = true
        material.opacity = 0.05
        const plane = new THREE.Mesh(geometry, material);
        plane.rotateX(Math.PI / 2);
        plane.translateY(-1)

        this.gridHelper.add(new THREE.GridHelper(size, divisions), plane);
        this.app.scene.add(this.gridHelper);
    }

    removeGridhelper() {
        this.app.scene.remove(this.gridHelper);
    }

    /**
     * 箭头辅助器
     */
    addArrowHelper() {
        const arrowDirection = new THREE.Vector3(1, 2, 3);
        arrowDirection.normalize();
        const arrowPoint = new THREE.Vector3(0, 0, 0);
        const arrowLength = 10;
        const arrowColor = 0xffff00;
        this.arrowHelper = new THREE.ArrowHelper(arrowDirection, arrowPoint, arrowLength, arrowColor);
        this.app.scene.add(this.arrowHelper);
    }

    destroyArrowHelper() {
        this.app.scene.remove(this.arrowHelper);
    }

    /**
     * 盒模型辅助器
     */
    addBox3Helper() {
        const box = new THREE.Box3();
        box.setFromCenterAndSize(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 1, 3));
        this.box3Helper = new THREE.Box3Helper(box, 0xffff00);
        this.app.scene.add(this.box3Helper);
    }

    destroyBox3Helper() {
        this.app.scene.remove(this.box3Helper);
    }

    /**
     * 相机辅助器
     */
    addCameraHelper() {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameraHelper = new THREE.CameraHelper(camera);
        this.app.scene.add(this.cameraHelper);
    }

    /**
     * 光源辅助器
     */
    destroyCameraHelper() {
        this.app.scene.remove(this.cameraHelper)
    }

    /**
     * 光源辅助器
     */
    addPolarGridHelper() {
        const radius = 10;
        const radials = 16;
        const circles = 8;
        const divisions = 64;

        const helper = new THREE.PolarGridHelper(radius, radials, circles, divisions);
        this.app.scene.add(helper);
    }

    /**
     * 光源辅助器
     */
    addLightHelper() {
        const sphereSize = 10
        this.app.scene.children.forEach(item => {

            if (item.type === 'PointLight') {
                const pointLightHelper = new THREE.PointLightHelper(item, sphereSize);
                this.app.scene.add(pointLightHelper);
                this.lightHelperList.push(pointLightHelper)
            } else if (item.type === 'DirectionalLight') {
                const helper = new THREE.DirectionalLightHelper(item, 5);
                this.app.scene.add(helper);
                this.lightHelperList.push(helper)
            }
        })
    }

    removeLightHelper() {
        this.lightHelperList.forEach(item => {
            this.app.scene.remove(item);
        })
    }

    /**
     * 光源辅助器
     */
    addSpotLightHelper() {
        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(10, 10, 10);
        this.app.scene.add(spotLight);
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        this.app.scene.add(spotLightHelper);
    }

    /**
     * 光源辅助器
     */
    addHemisphereLightHelper() {
        const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        const helper = new THREE.HemisphereLightHelper(light, 5);
        this.app.scene.add(helper);
    }

    /**
     * 动画骨骼辅助器
     */
    addSkeletonHelper() {
        // const helper = new THREE.SkeletonHelper( skinnedMesh );
        // this.app.scene.add( helper );
    }

    addVertexNormalsHelper() {
        const geometry = new THREE.BoxBufferGeometry(10, 10, 10, 2, 2, 2);
        const material = new THREE.MeshBasicMaterial({color: 0xff0000});
        const box = new THREE.Mesh(geometry, material);

        const helper = new VertexNormalsHelper(box, 2, 0x00ff00, 1);

        scene.add(box);
        scene.add(helper);
    }

    addFaceNormalsHelper() {
        const geometry = new THREE.BoxGeometry(10, 10, 10, 2, 2, 2);
        const material = new THREE.MeshLambertMaterial({color: 0xff0000});
        const box = new THREE.Mesh(geometry, material);
        // const helper = new FaceNormalsHelper(box, 2, 0x00ff00, 1);
        // this.app.scene.add(box);
        // this.app.scene.add(helper);
    }

    addVertexNormalsHelper() {
        const geometry = new THREE.BoxBufferGeometry(10, 10, 10, 2, 2, 2);
        const material = new THREE.MeshLambertMaterial({color: 0xff0000});
        const box = new THREE.Mesh(geometry, material);
        const helper = new VertexNormalsHelper(box, 2, 0x00ff00, 1);
        this.app.scene.add(box);
        this.app.scene.add(helper);
    }

    /**
     * 坐标辅助器
     * @param x
     * @param y
     * @param z
     * @param size
     * @param scene
     */
    static addVerticHelper(x, y, z, size, scene) {
        const cube = CubeMesh.makeCubeMesh(x, y, z, size)
        scene.add(cube)
        return cube
    }

    /**
     * 平面辅助器
     */
    static addPlaneHelper(plane, size, scene) {
        const helper = new THREE.PlaneHelper(plane, size, 0xffff00);
        scene.add(helper);
    }

    /**
     * 线框显示mesh
     */
    static addWireframeGeometry() {
        // https://threejs.org/docs/index.html#api/zh/geometries/WireframeGeometry
    }


}
