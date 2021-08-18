import * as THREE from "three";
import {ButtonCanvas} from "../GUICanvasPart/ButtonCanvas";

export class ButtonMesh {
    constructor(app, GUIApp, type, leftPosition, topPosition, width, height, position, content, fontSize) {
        this.app = app
        this.GUIApp = GUIApp
        this.type = type
        this.value = false
        this.func = null
        this._buttonCanvas = null
        this.buttonCanvasDom = null
        this.texture = null
        this.mesh = null
        this.sprite = null
        this._onMouseMove = this.onMouseMove.bind(this)

        this.leftPosition = leftPosition
        this.topPosition = topPosition
        this.width = width
        this.height = height
        this.position = position
        this._content = content
        this._fontSize = fontSize
        this.initButtonCanvas()
    }

    get content() {
        return this._content
    }

    set content(content) {
        this._content = content
        this._buttonCanvas.content = this._content
        this.texture.needsUpdate = true
    }

    get fontSize() {
        return this._fontSize
    }

    set fontSize(fontSize) {
        this._fontSize = fontSize
        this._buttonCanvas.fontSize = this._fontSize
        this.texture.needsUpdate = true
    }

    initButtonCanvas() {
        this._buttonCanvas = new ButtonCanvas(this, this.leftPosition, this.topPosition, this.width, this.height, this.content, this._fontSize)
        this.buttonCanvasDom = this._buttonCanvas.virtualCanvas
        this.texture = new THREE.CanvasTexture(this.buttonCanvasDom);
        const maxAnisotropy = this.app.renderer.capabilities.getMaxAnisotropy();
        this.texture.anisotropy = maxAnisotropy

        if (this.type === '3DFixed') {
            const geometry = new THREE.PlaneGeometry(this.width, this.height);
            let material = new THREE.MeshBasicMaterial({map: this.texture});
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
            document.body.appendChild(this.buttonCanvasDom)
            this.buttonCanvasDom.style.position = 'absolute'
            this.buttonCanvasDom.style.left = this.position.x.toString() + 'px'
            this.buttonCanvasDom.style.top = this.position.y.toString() + 'px'
            this.GUIApp.canvasDomsDestroy.push(this.buttonCanvasDom)
        }

        if (this.mesh) {
            this.app.scene.add(this.mesh)
        }
    }

    atMouseDown() {
        this._buttonCanvas.atMouseDown()
        this.texture.needsUpdate = true
        this.value = !this.value
        if (this.func) {
            this.func()
        }
    }

    onMouseMove() {

    }

    atMouseUp() {
        this._buttonCanvas.atMouseUp()
        this.texture.needsUpdate = true
    }

    addEvent(fuc) {
        this.func = fuc
    }

    addEventListener(name, func) {
        this._buttonCanvas.addEventListener(name, func)
    }

    removeEventListener(name) {
        this._buttonCanvas.removeEventListener(name)
    }
}
