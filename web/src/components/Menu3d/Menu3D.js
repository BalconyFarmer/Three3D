import * as THREE from "three"   //ES6
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

class Menu3D {

    constructor(dom) {
        this.dom = dom
        this.menuData = null
        this.munus = []
        this.width = this.dom.width
        this.height = this.dom.height
        this.scale = 8 // icon大小系数
        this.animationStatus = true

        this.scene = null
        this.camera = null
        this.renderer = null

        this.eventBus = new THREE.EventDispatcher(); // 3D事件中心
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
        this.camera = new THREE.PerspectiveCamera(15, this.width / this.height, 0.1, 10000);
        this.camera.position.set(695.1800453615817, 254.22151866633237, 838.3403209458872)
        this.camera.lookAt(this.scene.position)
        this.renderer = new THREE.WebGLRenderer({canvas: this.dom, alpha: true});
        this.renderer.setSize(this.width, this.height);
    }

    addPictures() {
        const self = this;
        this.menuData.forEach((item, index) => {
            var loader = new THREE.TextureLoader();

            loader.load(require('./imgs/result/' + item.assert), function (tex) {

                const material1 = new THREE.SpriteMaterial({map: tex});
                const sprite = new THREE.Sprite(material1);

                sprite.scale.set(298 / self.scale, 467 / self.scale, 1)
                sprite.position.set(200, 0, 0);

                let gre = 2 * Math.PI / self.menuData.length
                let quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), gre * index);
                sprite.position.applyQuaternion(quaternion);

                self.scene.add(sprite);
                self.munus.push(sprite)
                sprite.routerAdress = item.routerAdress
            })

        })
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
                // self.addTestCube(point)
            } else {
                self.animationStatus = true
            }
        }

        this.dom.addEventListener("click", onMouseclick, false);
        this.dom.addEventListener("mousemove", onMouseMove, false);
    }

    startAnimation() {
        const self = this

        function animate() {
            requestAnimationFrame(animate);
            self.renderer.render(self.scene, self.camera);

            if (self.animationStatus) {
                self.munus.forEach(item => {
                    let quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), -0.005);
                    item.position.applyQuaternion(quaternion);
                })
            }
        }

        animate();
    }

    /**
     * 开启鼠标控制
     */
    startControl() {
        this.controller = new OrbitControls(this.camera, this.renderer.domElement);
    }

    /**
     * 添加坐标轴
     * @param position
     */
    axesHelper() {
        const axesHelper = new THREE.AxesHelper(150);
        this.scene.add(axesHelper);
    }

    addTestCube(position) {
        // const see = position
        // debugger
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({color: 0xffffff});
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(position.x, position.y, position.z)
        this.scene.add(cube);
    }

    addSprit() {

    }

    destroy() {

    }

}


export {Menu3D}
