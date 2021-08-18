import {CheckBoxCanvas} from "../GUICanvasPart/CheckBoxCanvas";
import * as THREE from "three";

export class CheckBoxMesh {
    constructor(app, GUIapp, type, width, height, position, content) {
        this.app = app
        this.GUIapp = GUIapp

        this.type = type
        this.width = width
        this.height = height
        this.position = position
        this.content = content
        this._checkBoxCanvas = null
        this.checkBoxCanvasDom = null
        this.texture = null
        this.mesh = null

        this.initCheckBoxCanvas()
    }

    initCheckBoxCanvas() {
        this._checkBoxCanvas = new CheckBoxCanvas(this.width, this.height, this.content, this)
        this.checkBoxCanvasDom = this._checkBoxCanvas.virtualCanvas
        this.texture = new THREE.CanvasTexture(this.checkBoxCanvasDom);

        if (this.type === '3DFixed') {
            const geometry = new THREE.PlaneGeometry(this.width, this.height);
            const material = new THREE.MeshBasicMaterial({map: this.texture});
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
            document.body.appendChild(this.checkBoxCanvasDom)
            this.checkBoxCanvasDom.style.position = 'absolute'
            this.checkBoxCanvasDom.style.left = this.position.x.toString() + 'px'
            this.checkBoxCanvasDom.style.top = this.position.y.toString() + 'px'
            this.GUIapp.canvasDomsDestroy.push(this.checkBoxCanvasDom)
        }

        if (this.mesh) {
            this.app.scene.add(this.mesh)
        }

    }

    atMouseDown() {
        this._checkBoxCanvas.atMouseDown()
        this.texture.needsUpdate = true
    }

    _onMouseMove() {
    }


    atMouseUp() {
    }
}
