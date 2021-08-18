/**
 * 移动物体
 * 拖拽: https://threejs.org/examples/#misc_controls_drag
 * 移动: https://threejs.org/examples/#misc_controls_transform
 */
import * as THREE from 'three'
import {TransformControls} from 'three/examples/jsm/controls/TransformControls'

export class TransformMesh {
    constructor(app) {
        this.app = app
        this.cube = null
        this.control = null
        this._onKeyDown = this.onKeyDown.bind(this)
        this._onChangeMesh = this.onChangeMesh.bind(this)
        this.boxHelper = null
    }

    addEvent() {
        const self = this
        this.control = new TransformControls(this.app.camera, this.app.renderer.domElement);
        this.app.scene.add(this.control);
        window.addEventListener('keydown', this._onKeyDown);
        this.control.addEventListener('objectChange', this._onChangeMesh);
        this.control.addEventListener('mouseDown', function () {
            self.app.controls.controller.enabled = false
        });
        this.control.addEventListener('mouseUp', function () {
            self.app.controls.controller.enabled = true
        });
        this.app.raycasterHelper.startRaycast()
        this.app.raycasterHelper.atSelectMesh(function (mesh) {
            if (mesh) {
                if (mesh.parent.type === "Scene") {
                    self.control.attach(mesh)
                    self.addBoxHelper()
                } else if (mesh.parent.type === "Group") {
                    self.control.attach(mesh.parent)
                    self.addBoxHelper()
                }
            }
        })
    }

    /**
     * w        translate
     * e        route
     * r        scale
     * +/-      adjust size
     * q        toggle worl/local apace
     * shift    snap to grid
     * x        toggle x
     * y        toggle y
     * z        toggle z
     * spacebar goggle enabled
     * c        toggle camara
     * v        toggle radom zoom
     */
    onKeyDown(event) {
        const self = this
        switch (event.keyCode) {
            case 81: // Q
                self.control.setSpace(self.space === "local" ? "world" : "local");
                break;

            case 16: // Shift
                self.control.setTranslationSnap(100);
                self.control.setRotationSnap(THREE.MathUtils.degToRad(15));
                self.control.setScaleSnap(0.25);
                break;

            case 87: // W
                self.control.setMode("translate");
                break;

            case 69: // E
                self.control.setMode("rotate");
                break;

            case 82: // R
                self.control.setMode("scale");
                break;

            case 67: // C
                /*                    const position = self.app.camera.position.clone();

                                    self.app.camera = self.app.camera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                                    currentCamera.position.copy( position );

                                    orbit.object = currentCamera;
                                    control.camera = currentCamera;

                                    currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
                                    onWindowResize();*/
                break;

            case 86: // V
                const randomFoV = Math.random() + 0.1;
                const randomZoom = Math.random() + 0.1;

                self.app.camera.fov = randomFoV * 160;
                self.app.camera.bottom = -randomFoV * 500;
                self.app.camera.top = randomFoV * 500;

                self.app.camera.zoom = randomZoom * 5;
                self.app.camera.zoom = randomZoom * 5;
                // onWindowResize();
                break;

            case 187:
            case 107: // +, =, num+
                self.control.setSize(self.control.size + 0.1);
                break;

            case 189:
            case 109: // -, _, num-
                self.control.setSize(Math.max(self.control.size - 0.1, 0.1));
                break;

            case 88: // X
                self.control.showX = !self.control.showX;
                break;

            case 89: // Y
                self.control.showY = !self.control.showY;
                break;

            case 90: // Z
                self.control.showZ = !self.control.showZ;
                break;

            case 32: // Spacebar
                self.control.enabled = !self.control.enabled;
                break;
        }
    }

    /**
     * 打印mesh
     * @param event
     */
    onChangeMesh(event) {
        this.app.eventBus.dispatchEvent({type: 'changeMesh', message: this.control.object})
        this.control.object.updateMatrixWorld()
        console.warn('Mesh 更新后 matrixWorld', this.control.object.matrixWorld)
        this.addBoxHelper()
    }

    addBoxHelper() {
        if (this.boxHelper) {
            this.app.scene.remove(this.boxHelper)
            this.boxHelper = new THREE.BoxHelper(this.control.object, 0xffff00);
            this.app.scene.add(this.boxHelper);
        } else {
            this.boxHelper = new THREE.BoxHelper(this.control.object, 0xffff00);
            this.app.scene.add(this.boxHelper);
        }
    }

    removeEvent() {
        window.removeEventListener('keydown', this._onKeyDown);
        if (this.control) {
            this.app.scene.remove(this.control);
            this.app.scene.remove(this.boxHelper);
            this.control.removeEventListener('objectChange', this._onChangeMesh);
            this.control.dispose();
        }
        this.app.raycasterHelper.stopRaycast()
    }
}
