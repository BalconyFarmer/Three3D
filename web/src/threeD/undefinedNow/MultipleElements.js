import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export class MultipleElements {
    constructor(app) {
        this.app = app
        this.canvas = null
        this.content = null
        this.renderer = null
        this.scenes = []
        this.loopFlag = false
        this.meshs = []
        this.selectedObject = null
    }

    /**
     * 材质列表
     */
    makeMaterials() {
        this.meshs = []
        this.app.basicMaterials.nameList.forEach(item => {
            let geometry = new THREE.DodecahedronGeometry(0.5);
            const material = this.app.basicMaterials[item]()
            const mesh = new THREE.Mesh(geometry, material)
            mesh.specialType = '材质'
            this.meshs.push(mesh)
        })
    }

    /**
     * geometry 列表
     */
    makeGeometries() {
        this.meshs = []
        let geometries = [
            new THREE.BoxBufferGeometry(),
            new THREE.CircleBufferGeometry(),
            new THREE.CylinderBufferGeometry(),
            new THREE.ConeBufferGeometry(),
            new THREE.DodecahedronBufferGeometry(),
            new THREE.DodecahedronBufferGeometry(),
            new THREE.OctahedronBufferGeometry(),
            new THREE.RingBufferGeometry(),
            new THREE.SphereBufferGeometry(),
            new THREE.TorusBufferGeometry(),
            new THREE.TorusKnotBufferGeometry(),
            new THREE.PlaneBufferGeometry(),
            new THREE.TetrahedronBufferGeometry(),
            new THREE.IcosahedronBufferGeometry()
        ];

        geometries.forEach(item => {
            let material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
                roughness: 0.5,
                metalness: 0,
                flatShading: true
            });
            this.meshs.push(new THREE.Mesh(item, material))
        })
    }

    run(canvas, content) {
        this.canvas = canvas
        this.content = content
        this.init();
        this.loopFlag = true
        this.animate.bind(this)()
    }

    init() {
        this.addMouseUpEvent.bind(this)()
        let template = "<div class=\"scene\"></div>\n" +
            "<div class=\"description\"> $</div>"

        this.meshs.forEach((item, i) => {
            let scene = new THREE.Scene();

            // make a list item
            let element = document.createElement("div");
            element.className = "list-item";
            element.innerHTML = template.replace('$', item.geometry.type.slice(0, 6));
            const self = this
            element.onmousedown = function (event) {
                self.selectedObject = item
            }

            scene.userData.element = element.querySelector(".scene");
            this.content.appendChild(element);
            let camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
            camera.position.z = 2;
            scene.userData.camera = camera;
            let controls = new OrbitControls(scene.userData.camera, scene.userData.element);
            controls.minDistance = 2;
            controls.maxDistance = 5;
            controls.enablePan = false;
            controls.enableZoom = false;
            scene.userData.controls = controls;
            scene.add(item);
            scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444));
            let light = new THREE.DirectionalLight(0xffffff, 0.5);
            light.position.set(1, 1, 1);
            scene.add(light);
            this.scenes.push(scene);
        })
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    addMouseUpEvent() {
        const self = this
        document.onmouseup = function (event) {
            if (self.selectedObject) {

                self.raycaster = new THREE.Raycaster();
                self.mouse = new THREE.Vector2();

                self.mouse.x = (event.clientX / self.app.dom.width) * 2 - 1;
                self.mouse.y = -(event.clientY / self.app.dom.height) * 2 + 1;
                self.raycaster.setFromCamera(self.mouse, self.app.camera);

                let target = []
                self.app.scene.children.forEach(item => {
                    target.push(item)
                    if (item.type === 'Group') {
                        item.children.forEach(item => {
                            target.push(item)
                        })
                    }
                })
                const intersects = self.raycaster.intersectObjects(target);

                if (intersects[0]) {
                    if (intersects[0].point) {
                        if (self.selectedObject.specialType === '材质') {
                            const aimObj = intersects[0].object
                            const originMaterial = self.selectedObject.material
                            aimObj.material = originMaterial
                        } else {
                            const vec3 = intersects[0].point
                            const meshClone = self.selectedObject.clone()
                            self.app.scene.add(meshClone)
                            meshClone.position = vec3
                        }
                    }
                }

                self.selectedObject = null

            }
        }
    }

    updateSize() {
        let width = this.canvas.clientWidth;
        let height = this.canvas.clientHeight;
        if (this.canvas.width !== width || this.canvas.height != height) {
            this.renderer.setSize(width, height, false);
        }
    }

    render() {

        this.updateSize();

        this.renderer.setClearColor(0x252526);
        this.renderer.setScissorTest(false);
        this.renderer.clear();

        this.renderer.setClearColor(0xe0e0e0);
        this.renderer.setScissorTest(true);

        const self = this
        this.scenes.forEach(function (scene) {

            // so something moves
            scene.children[0].rotation.y = Date.now() * 0.001;

            // get the element that is a place holder for where we want to
            // draw the scene
            let element = scene.userData.element;

            // get its position relative to the page's viewport
            let rect = element.getBoundingClientRect();

            let left = rect.left - (document.body.clientWidth - 300); // 移动补偿
            let top = window.innerHeight - 50 - rect.top;

            let width = rect.right - rect.left;
            let height = rect.bottom - rect.top;

            self.renderer.setViewport(left, top, width, height);
            self.renderer.setScissor(left, top, width, height);

            let camera = scene.userData.camera;

            self.renderer.render(scene, camera);

        });

    }

    animate() {
        const self = this

        function run() {
            if (self.loopFlag) {
                self.render();
                requestAnimationFrame(run);
            }
        }

        run()
    }

    destroy() {
        this.canvas = null
        this.content = null
        this.renderer = null
        this.scenes = []
        this.loopFlag = false
        this.meshs = []
        document.onmouseup = null
    }
}
