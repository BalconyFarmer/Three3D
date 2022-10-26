import * as THREE from "three"   //ES6
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {FlowPipe} from "./parts/FlowPipe";

export class Menu3D1 {

    constructor(dom) {
        this.dom = dom
        this.menuData = null
        this.munus = []
        this.width = this.dom.width
        this.height = this.dom.height
        this.scale = 3 // icon大小系数
        this.animationStatus = true

        this.scene = null
        this.camera = null
        this.renderer = null
        this.currentIndex = 1
        this.eventBus = new THREE.EventDispatcher(); // 3D事件中心
        this.renderQueue = []
    }

    init3D(menuData) {
        this.menuData = menuData
        this.initThree();
        this.addPictures();
        this.addMouseEvent();
        this.startAnimation();
        // this.startControl();
        // this.axesHelper();
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 10000);
        this.camera.position.set(500, 254.22151866633237, 0)
        this.camera.lookAt(this.scene.position)
        this.renderer = new THREE.WebGLRenderer({canvas: this.dom, alpha: true});
        this.renderer.setSize(this.width, this.height);
        const light = new THREE.AmbientLight(0xffffff); // soft white light
        this.scene.add(light);
    }

    addBackground() {

    }

    addPictures() {
        const self = this;
        this.menuData.forEach((item, index) => {
            var loader = new THREE.TextureLoader();

            loader.load(require('./imgs/result/' + item.assert), function (tex) {

                const material1 = new THREE.SpriteMaterial({map: tex});
                const sprite = new THREE.Sprite(material1);

                sprite.scale.set(161 / self.scale, 188 / self.scale, 1)
                sprite.position.set(200, 0, 0);

                let gre = 2 * Math.PI / self.menuData.length
                let quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), gre * index);
                sprite.position.applyQuaternion(quaternion);

                self.scene.add(sprite);
                self.munus.push(sprite)
                sprite.routerAdress = item.routerAdress

                let direction = ((index % 2) == 0)
                console.log(direction, "___________")

                self.addFlowLine([[0, 0, 0], [sprite.position.x, sprite.position.y, sprite.position.z,]], direction)

            })


        })
    }

    addFlowLine(data, direction) {
        const point0 = new THREE.Vector3(0, 0, 0)
        const point1 = new THREE.Vector3(0, 0, 190)
        // const point2 = new THREE.Vector3(-35, 96, 106)
        // const point3 = new THREE.Vector3(17, 88, 79)
        const flowPipes = [point0, point1]
        const flowPipe = new FlowPipe(this, flowPipes)
        flowPipe.add(data, direction)
    }

    addMouseEvent() {
        const self = this
        // 鼠标拾取
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let intersects = []

        function onMouseclick(event) {

            // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
            mouse.x = (event.offsetX / self.width) * 2 - 1;
            mouse.y = -(event.offsetY / self.height) * 2 + 1;

            // 通过摄像机和鼠标位置更新射线
            raycaster.setFromCamera(mouse, self.camera);
            // 计算物体和射线的焦点
            intersects = raycaster.intersectObjects(self.scene.children);
            if (intersects.length > 0) {
                self.eventBus.dispatchEvent({type: "jumpRoute", message: intersects[0].object.routerAdress})
                intersects = []
            }
        }

        function onMouseMove(event) {
            mouse.x = (event.offsetX / self.width) * 2 - 1;
            mouse.y = -(event.offsetY / self.height) * 2 + 1;
            // 通过摄像机和鼠标位置更新射线
            raycaster.setFromCamera(mouse, self.camera);
            // 计算物体和射线的焦点
            intersects = raycaster.intersectObjects(self.scene.children);
            if (intersects.length > 0) {
                self.animationStatus = false
                const point = intersects[0].point
            } else {
                self.animationStatus = true
            }
        }

        this.dom.addEventListener("click", onMouseclick, false);
        this.dom.addEventListener("mousemove", onMouseMove, false);
    }

    startAnimation() {
        const self = this

        THREE.Object3D.prototype.rotateAroundWorldAxis = function () {
            var q = new THREE.Quaternion();
            return function rotateAroundWorldAxis(point, axis, angle) {
                q.setFromAxisAngle(axis, angle);
                this.applyQuaternion(q);
                this.position.sub(point);
                this.position.applyQuaternion(q);
                this.position.add(point);
                return this;
            }
        }();

        const a = new THREE.Vector3(0, 1, 0);
        const b = new THREE.Vector3();

        function animate() {
            requestAnimationFrame(animate);
            self.renderer.render(self.scene, self.camera);

            self.renderQueue.forEach(item => {
                item()
            })

            // self.camera.rotateAroundWorldAxis(b, a, 0.001)
            // self.camera.lookAt(self.scene.position);

            // if (self.animationStatus) {
            //     self.munus.forEach(item => {
            //         let quaternion = new THREE.Quaternion();
            //         quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), -0.005);
            //         item.position.applyQuaternion(quaternion);
            //     })
            // }
        }

        animate();
    }


    /**
     * 开启鼠标控制
     */
    startControl() {
        this.controller = new OrbitControls(this.camera, this.renderer.domElement);
        this.controller.autoRotate = true
    }

    /**
     * 添加坐标轴
     * @param position
     */
    axesHelper() {
        const axesHelper = new THREE.AxesHelper(150);
        this.scene.add(axesHelper);
    }

    addSprit() {

    }

    destroy() {

    }

    moveTo(index) {
        if (index) {
            let _data = index - this.currentIndex
            let data = Math.abs(index - this.currentIndex);
            if (data >= 4) {
                if (_data > 0) {
                    data = -(8 - data)
                } else {
                    data = 8 - data
                }
            } else {
                data = index - this.currentIndex
            }

            let aim = (2 * Math.PI / 8) * data
            const self = this
            let i = 0

            function animate() {
                requestAnimationFrame(animate);
                self.renderer.render(self.scene, self.camera);
                if (i < 50) {
                    const a = new THREE.Vector3(0, 1, 0);
                    const b = new THREE.Vector3();
                    self.camera.rotateAroundWorldAxis(b, a, aim / 50)
                    i++
                    self.renderer.render(self.scene, self.camera);
                }
            }

            animate();
            this.currentIndex = index
        }


    }

}
