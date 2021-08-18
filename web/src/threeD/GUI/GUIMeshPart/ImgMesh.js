import {ImgCanvas} from "../GUICanvasPart/ImgCanvas";
import * as THREE from "three";

export class ImgMesh {
    constructor(app, GUIapp, type, width, height, position, url) {
        this.app = app
        this.GUIapp = GUIapp
        this.type = type
        this.url = url
        this.imgSrc = this.url.src

        this.width = width
        this.height = height
        this.position = position
        this.initImgCanvas()
    }

    initImgCanvas() {
        this._imgCanvas = new ImgCanvas(this.width, this.height, this.url, this)
        this.buttonCanvasDom = this._imgCanvas.virtualCanvas

        const self = this
        if (this.type === '3DFixed') {
            this.updateTextureFixed()
        } else if (this.type === '3DVertical') {
            this.updateTextureVertical()
        } else if (this.type === '2D') {
            document.body.appendChild(this.buttonCanvasDom)
            this.buttonCanvasDom.style.position = 'absolute'
            this.buttonCanvasDom.style.left = this.position.x.toString() + 'px'
            this.buttonCanvasDom.style.top = this.position.y.toString() + 'px'
            this.GUIapp.canvasDomsDestroy.push(this.buttonCanvasDom)
        }

        if (this.mesh) {
            this.app.scene.add(this.mesh)
        }
    }

    updateTextureFixed() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const self = this
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.imgSrc, function (texture) {

            const material = new THREE.MeshLambertMaterial({
                map: texture,
            });
            self.mesh = new THREE.Mesh(geometry, material);

            self.mesh.UIParent = self
            self.mesh.translateX(self.position.x)
            self.mesh.translateY(self.position.y)
            self.mesh.translateZ(self.position.z)

            self.app.scene.add(self.mesh)
        })
    }

    updateTextureVertical() {
        const self = this
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.imgSrc, function (texture) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            });
            self.mesh = new THREE.Sprite(spriteMaterial);

            self.mesh.scale.set(self.width, self.height, 1);
            self.mesh.translateX(self.position.x)
            self.mesh.translateY(self.position.y)
            self.mesh.translateZ(self.position.z)

            self.mesh.UIParent = self

            self.app.scene.add(self.mesh)
        })
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
