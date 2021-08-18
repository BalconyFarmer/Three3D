import * as THREE from "three";
import {TextBlockCanvas} from '../GUICanvasPart/TextBlockCanvas'
import {InputCanvas} from "../GUICanvasPart/InputCanvas";

export class TextBlockMesh {
    constructor(app, GUIapp, type, width, height, positionDom, content, fontSize, leftPosition, topPosition) {
        this.app = app
        this.GUIapp = GUIapp
        this.type = type

        this.positionDom = positionDom || new THREE.Vector3(0, 0, 0)
        this.content = content || '默认'
        this.fontSize = fontSize || '30px'
        this.leftPosition = leftPosition || 10
        this.topPosition = topPosition || 30
        this.width = width || 50
        this.height = height || 50

        this.initBlockTextCanvas()
    }

    initBlockTextCanvas() {
        this._textBlockCanvas = new TextBlockCanvas(this.width, this.height, this.content, this.fontSize, this.leftPosition, this.topPosition)
        this._textBlockDom = this._textBlockCanvas.virtualCanvas
        this.texture = new THREE.CanvasTexture(this._textBlockDom);

        if (this.type === '3DFixed') {
            const geometry = new THREE.PlaneGeometry(this.width, this.height);
            let material = new THREE.MeshPhongMaterial({map: this.texture});
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
            document.body.appendChild(this._textBlockDom)
            this._textBlockDom.style.position = 'absolute'
            this._textBlockDom.style.left = this.positionDom.x.toString() + 'px'
            this._textBlockDom.style.top = this.positionDom.y.toString() + 'px'
            this.GUIapp.canvasDomsDestroy.push(this._textBlockDom)
        }

        if (this.mesh) {
            this.app.scene.add(this.mesh)
        }
    }

    atMouseDown() {

    }

    _onMouseMove() {

    }

    atMouseUp() {

    }

    onChangeValue(func) {
    }
}
