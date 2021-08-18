import * as THREE from "three";
import {InputCanvas} from "../GUICanvasPart/InputCanvas";

export class InputMesh {
    constructor(app, GUIapp, type, width, height, position, content) {
        this.app = app
        this.GUIapp = GUIapp

        this.type = type
        this.width = width
        this.height = height
        this.position = position
        this.content = content
        this._inputCanvas = null
        this._inputCanvasDom = null
        this.texture = null
        this.mesh = null
        this.zoomRatioX = 1
        this.zoomRatioY = 1
        this.zoomRatioZ = 1

        this._myAxes = {
            "xNormal": new THREE.Vector3(1, 0, 0),
            "yNormal": new THREE.Vector3(0, 1, 0),
            "zNormal": new THREE.Vector3(0, 0, 1)
        }

        this._myAxesPlane = {
            "xNormalPlane": new THREE.Plane(this._myAxes.xNormal, -this.width / 2),
            "yNormalPlane": new THREE.Plane(this._myAxes.yNormal, -this.height / 2),
            "zNormalPlane": new THREE.Plane(this._myAxes.zNormal, 0)
        }

        this.initInputCanvas()
    }

    initInputCanvas() {
        this._inputCanvas = new InputCanvas(this.width, this.height, this.content, this)
        this._inputCanvasDom = this._inputCanvas.virtualCanvas
        this.texture = new THREE.CanvasTexture(this._inputCanvasDom);

        if (this.type === '3DFixed') {
            const geometry = new THREE.PlaneGeometry(this.width, this.height);
            const material = new THREE.MeshPhongMaterial({map: this.texture});
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.UIParent = this
        } else if (this.type === '3DVertical') {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: this.texture,
                transparent: true,
            });
            this.mesh = new THREE.Sprite(spriteMaterial);
            this.mesh.scale.set(this.width, this.height, 1);
            this.mesh.UIParent = this
        } else if (this.type === '2D') {
            document.body.appendChild(this._inputCanvasDom)
            this._inputCanvasDom.style.position = 'absolute'
            this._inputCanvasDom.style.left = this.position.x.toString() + 'px'
            this._inputCanvasDom.style.top = this.position.y.toString() + 'px'
            this.GUIapp.canvasDomsDestroy.push(this._inputCanvasDom)
        }

        if (this.mesh) {

            this.app.scene.add(this.mesh)

        }
    }

    updateMyAxes() {
        this.mesh.updateMatrixWorld()

        if (this.type === '3DFixed') {
            // const origin = new THREE.Vector3(0, 0, 0);
            // const arrowHelper = new THREE.ArrowHelper(this._myAxes.xNormal.clone().applyMatrix4(this.mesh.matrixWorld), origin, this.width, 0xfddb3a);
            // this.app.scene.add(arrowHelper);

            this._myAxesPlane = {
                "xNormalPlane": new THREE.Plane(this._myAxes.xNormal.clone(), this.width / 2).applyMatrix4(this.mesh.matrixWorld),
                "yNormalPlane": new THREE.Plane(this._myAxes.yNormal, -this.height / 2).applyMatrix4(this.mesh.matrixWorld),
                "zNormalPlane": new THREE.Plane(this._myAxes.zNormal, 0).applyMatrix4(this.mesh.matrixWorld)
            }
            this.zoomRatioX = this.mesh.scale.x
            this.zoomRatioY = this.mesh.scale.y
            this.zoomRatioZ = this.mesh.scale.z
            // const helper = new THREE.PlaneHelper(this._myAxesPlane.xNormalPlane, this.width, 0xfddb3a);
            // this.app.scene.add(helper);
        } else if (this.type === '3DVertical') {
            const camaraMatrix = new THREE.Matrix4()
            camaraMatrix.makeRotationFromEuler(this.app.camera.rotation)

            const translateMatrix = new THREE.Matrix4()
            translateMatrix.setPosition(this.mesh.position)

            this._myAxesPlane = {
                "xNormalPlane": new THREE.Plane(this._myAxes.xNormal.clone(), this.width / 2).applyMatrix4(camaraMatrix).applyMatrix4(translateMatrix),
                "yNormalPlane": new THREE.Plane(this._myAxes.yNormal.clone(), -this.height / 2).applyMatrix4(camaraMatrix),
                "zNormalPlane": new THREE.Plane(this._myAxes.zNormal.clone(), 0).applyMatrix4(camaraMatrix)
            }
            this.mesh.scale.set(this.width, this.height, 1);

            // const helper = new THREE.PlaneHelper(this._myAxesPlane.xNormalPlane, this.width, 0xfddb3a);
            // this.app.scene.add(helper);
        }

    }

    pointToHelperPlaneX(point) {
        const X2d = this._myAxesPlane.xNormalPlane.distanceToPoint(point)
        return X2d
    }

    pointToHelperPlaneY(point) {
        const X2d = this._myAxesPlane.yNormalPlane.distanceToPoint(point)
        return X2d
    }

    atMouseDown(casterPoint) {
        const d2Pointx = this.pointToHelperPlaneX(casterPoint)
        const d2Pointy = this.pointToHelperPlaneY(casterPoint)
        let virtualEvent = {}
        virtualEvent.clientX = Math.abs(d2Pointx) / this.zoomRatioX
        virtualEvent.clientY = Math.abs(d2Pointy) / this.zoomRatioY

        this._inputCanvas.atMouseDown(virtualEvent)
        this.texture.needsUpdate = true

        this.updateMyAxes()
    }

    _onMouseMove(casterPoint) {
    }

    atMouseUp(e) {
    }

}
