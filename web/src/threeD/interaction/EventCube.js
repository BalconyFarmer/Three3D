import * as THREE from "three";

export class EventCube {
    constructor(app) {
        this.app = app
        this.cube = null
        this.material = null
        this._onChangeColor = this.onChangeColor.bind(this)
    }

    addCube() {
        var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        var cube = new THREE.Mesh(geometry, this.material);
        this.app.scene.add(cube);
        this.addChangeColorEvent()
    }

    addChangeColorEvent() {
        this.app.eventBus.addEventListener("changeColor", this._onChangeColor)
    }

    removeChangeColorEvent() {
        this.app.eventBus.removeEventListener("changeColor", this._onChangeColor)
    }

    onChangeColor(event) {
        console.log('我的颜色', this.material, event.message)
    }

    distroy() {
        this.cube = null
    }
}
