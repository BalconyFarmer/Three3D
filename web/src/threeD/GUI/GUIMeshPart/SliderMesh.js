import {SliderCanvas} from "../GUICanvasPart/SliderCanvas";
import * as THREE from "three";

export class SliderMesh {
    constructor(app, GUIapp, type, width, height, position, content) {
        this.app = app
        this.GUIapp = GUIapp

        this.type = type
        this.width = width
        this.height = height
        this.position = position
        this.content = content
        this._sliderCanvas = null
        this._sliderCanvasDom = null
        this.texture = null
        this.mesh = null
        this.mouseFlag = false
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

        this.initSliderCanvas()
    }

    initSliderCanvas() {
        this._sliderCanvas = new SliderCanvas(this.width, this.height, this.content)
        this._sliderCanvasDom = this._sliderCanvas.virtualCanvas
        this.texture = new THREE.CanvasTexture(this._sliderCanvasDom);
        this.texture.anisotropy = 6

        if (this.type === '3DFixed') {
            const geometry = new THREE.PlaneGeometry(this.width, this.height);
            const material = new THREE.MeshPhongMaterial({map: this.texture});
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.UIParent = this
        } else if (this.type === '3DVertical') {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: this.texture,
                transparent: true
            });
            this.mesh = new THREE.Sprite(spriteMaterial);
            this.mesh.scale.set(this.width, this.height, 1);
            this.mesh.UIParent = this
        } else if (this.type === '2D') {
            document.body.appendChild(this._sliderCanvasDom)
            this._sliderCanvasDom.style.position = 'absolute'
            this._sliderCanvasDom.style.left = this.position.x.toString() + 'px'
            this._sliderCanvasDom.style.top = this.position.y.toString() + 'px'
            this.GUIapp.canvasDomsDestroy.push(this._sliderCanvasDom)

        }

        if (this.mesh) {
            this.app.scene.add(this.mesh)
        }

    }

    updateMyAxes() {
        if (this.type === '3DFixed') {
            this.mesh.updateMatrixWorld()

            const translateMatrix = new THREE.Matrix4()
            translateMatrix.setPosition(this.mesh.position)

            const rotateMatrix = new THREE.Matrix4()
            rotateMatrix.makeRotationFromEuler(this.mesh.rotation)

            this._myAxesPlane = {
                "xNormalPlane": new THREE.Plane(this._myAxes.xNormal.clone(), this.width / 2).applyMatrix4(this.mesh.matrixWorld),
                "yNormalPlane": new THREE.Plane(this._myAxes.yNormal.clone(), -this.height / 2).applyMatrix4(this.mesh.matrixWorld),
                "zNormalPlane": new THREE.Plane(this._myAxes.zNormal.clone(), 0).applyMatrix4(this.mesh.matrixWorld)
            }
            if (this.mesh.scale.x != 0) {
                this.zoomRatioX = this.mesh.scale.x
            }
            if (this.mesh.scale.y != 0) {
                this.zoomRatioY = this.mesh.scale.y
            }
            if (this.mesh.scale.z != 0) {
                this.zoomRatioZ = this.mesh.scale.z
            }

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
        } else if (this.type === '2D') {
            document.body.appendChild(this._sliderCanvasDom)
            this._sliderCanvasDom.style.position = 'absolute'
            this._sliderCanvasDom.style.left = this.position.x.toString() + 'px'
            this._sliderCanvasDom.style.top = this.position.y.toString() + 'px'
            this.GUIapp.canvasDomsDestroy.push(this._sliderCanvasDom)
        }

    }

    pointToHelperPlaneX(point) {
        this.updateMyAxes()
        const X2d = this._myAxesPlane.xNormalPlane.distanceToPoint(point)
        return X2d
    }

    pointToHelperPlaneY(point) {
        this.updateMyAxes()
        const X2d = this._myAxesPlane.yNormalPlane.distanceToPoint(point)
        return X2d
    }

    atMouseDown(casterPoint) {
        const d2Pointx = this.pointToHelperPlaneX(casterPoint)
        const d2Pointy = this.pointToHelperPlaneY(casterPoint)
        let virtualEvent = {}
        virtualEvent.clientX = Math.abs(d2Pointx) / this.zoomRatioX
        virtualEvent.clientY = Math.abs(d2Pointy) / this.zoomRatioY

        this._sliderCanvas.atMouseDown(virtualEvent)
        this.texture.needsUpdate = true

        this.mouseFlag = true
        this._sliderCanvas.mouseDownFlag = true

    }

    _onMouseMove(casterPoint) {
        if (this.mouseFlag) {
            const d2Pointx = this.pointToHelperPlaneX(casterPoint)
            const d2Pointy = this.pointToHelperPlaneY(casterPoint)
            let virtualEvent = {}
            virtualEvent.clientX = Math.abs(d2Pointx) / this.zoomRatioX
            virtualEvent.clientY = Math.abs(d2Pointy) / this.zoomRatioY

            this._sliderCanvas.onMouseMove(virtualEvent)
            this.texture.needsUpdate = true

            this.value = d2Pointx
            if (this.func) {
                this.func(this.value)
            }
        }
    }

    atMouseUp(e) {
        this._sliderCanvas.atMouseUp(e)
        this.texture.needsUpdate = true
        this.mouseFlag = false
        this._sliderCanvas.mouseDownFlag = false
    }

    onChangeValue(func) {
        this.func = func
    }

}
