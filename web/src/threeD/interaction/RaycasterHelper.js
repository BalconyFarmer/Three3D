import * as THREE from "three";
import defined from "../defined";

/**
 * 射线辅助器
 **/
export class RaycasterHelper {

    constructor(app) {
        this.app = app
        this.raycaster = null
        this.mouse = null
        this._getMesh = this.getMesh.bind(this)
        this._hoverMesh = this.hoverMesh.bind(this)

        this.mesh = null;
        this.x = 0
        this.y = 0
        this.z = 0
        this.size = 10

        this.selectedObject = null
        this.point = null
        this.atSelectMeshFunc = null
    }

    /**
     * 开启鼠标拾取
     */
    startRaycast() {
        document.addEventListener('mouseup', this._getMesh, false);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    /**
     * 点击 获取对象
     * @param event
     */
    getMesh(event) {
        this.mouse.x = (event.offsetX / this.app.dom.width) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.app.dom.height) * 2 + 1;
        // 通过摄像机和鼠标位置更新射线
        this.raycaster.setFromCamera(this.mouse, this.app.camera);
        let target = []
        this.app.scene.children.forEach(item => {
            target.push(item)
            if (item.type === 'Group') {
                item.children.forEach(item => {
                    target.push(item)
                })
            }
        })
        const intersects = this.raycaster.intersectObjects(target);
        let point = null

        if (defined(intersects[0])) {
            point = intersects[0].point
            this.point = intersects[0].point
        }

        if (defined(intersects[0]) && defined(point)) {
            this.updatePosition(point)
            this.selectedObject = intersects[0].object
        }

        if (this.atSelectMeshFunc) {
            this.atSelectMeshFunc(this.selectedObject)
        }
    }

    /**
     * 关闭鼠标拾取
     */
    stopRaycast() {
        document.removeEventListener('mousedown', this._getMesh, false);
        this.raycaster = null
        this.mouse = null
        this.app.scene.remove(this.mesh)
        this.selectedObject = null
        this.point = null
        this.func = null
    }

    startHover() {
        document.addEventListener('mousemove', this._hoverMesh, false);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    /**
     * hover 获取对象
     * @param event
     */
    hoverMesh(event) {
        this.mouse.x = (event.offsetX / this.app.dom.width) * 2 - 1;
        this.mouse.y = -(event.offsetY / this.app.dom.height) * 2 + 1;

        // 通过摄像机和鼠标位置更新射线
        this.raycaster.setFromCamera(this.mouse, this.app.camera);
        let target = []
        this.app.scene.children.forEach(item => {
            target.push(item)
            if (item.type === 'Group') {
                item.children.forEach(item => {
                    target.push(item)
                })
            }
        })
        const intersects = this.raycaster.intersectObjects(target);
        let point = null

        if (defined(intersects[0])) {
            point = intersects[0].point
            this.point = intersects[0].point
        }

        if (defined(intersects[0]) && defined(point)) {
            this.updatePosition(point)
            this.selectedObject = intersects[0].object
        }

        if (this.atSelectMeshFunc) {
            this.atSelectMeshFunc(this.selectedObject)
        }
    }

    stopHover() {

    }

    atSelectMesh(atSelectMeshFunc) {
        this.atSelectMeshFunc = atSelectMeshFunc
    }

    updatePosition(point) {
        if (this.mesh) {
            this.mesh.position.x = point.x;
            this.mesh.position.y = point.y;
            this.mesh.position.z = point.z;
        } else {
            // this.creatIntersectionPointMesh(); // 校正拾取点
        }
    }

    creatIntersectionPointMesh() {
        const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.cname = 'raycasterMesh'
        this.mesh.position = this.point
        this.app.scene.add(this.mesh);
    }

}
