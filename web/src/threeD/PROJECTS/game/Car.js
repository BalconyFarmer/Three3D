import * as THREE from "three";
import {VerticesViewer} from '../../helpers/representationalviewer/verticesViewer'
import {ArrowLine} from '../../helpers/representationalviewer/ArrowLine'

export class Car {
    constructor(app) {
        this.app = app
        this.mesh = null
        this.staticMesh = null
        this.arrowLine = new ArrowLine(this.app)
    }

    init() {
        this.makeCar()
        this.makeStaticMesh()
        this.onKeyDown()
    }

    makeCar() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({color: 0x00ff00});
        material.transparent = true
        material.opacity = 0.5
        this.mesh = new THREE.Mesh(geometry, material);
        this.app.scene.add(this.mesh);
    }

    moveTop() {
        this.mesh.translateX(1)
        this.mesh.updateMatrixWorld()
    }

    moveDown() {
        this.mesh.translateX(-1)
        // this.mesh.updateMatrix ()
        this.mesh.updateMatrixWorld()
        // this.mesh.updateWorldMatrix()
    }

    moveLeft() {
        this.mesh.translateZ(-1)
        this.mesh.updateMatrixWorld()
    }

    moveRight() {
        this.mesh.translateZ(1)
        this.mesh.updateMatrixWorld()
    }

    makeStaticMesh() {
        const geometry = new THREE.BoxGeometry(50, 50, 50);
        const material = new THREE.MeshLambertMaterial({color: 0x00ffff});
        material.transparent = true
        material.opacity = 0.5
        this.staticMesh = new THREE.Mesh(geometry, material);
        this.staticMesh.translateX(20)
        this.app.scene.add(this.staticMesh);
    }

    onKeyDown() {
        const self = this
        window.addEventListener('keydown', function (e) {
            if (e.code === 'KeyW') {
                self.moveTop.bind(self)()
            } else if (e.code === 'KeyA') {
                self.moveLeft.bind(self)()
            } else if (e.code === 'KeyS') {
                self.moveDown.bind(self)()
            } else if (e.code === 'KeyD') {
                self.moveRight.bind(self)()
            }
            self.impactChecking()
        });
    }

    /**
     * 干涉检测 //TODO 进入内部后无法检测 逐点计算,速度缓慢
     * @param staticObject
     * @param moveObject
     * @returns {boolean}
     */
    impactChecking() {
        let impactFlag = false;
        let centerCoord = this.mesh.position.clone();
        let allVertices = this.mesh.geometry.vertices

        const allVerticesWorld = []
        this.mesh.geometry.vertices.forEach((item, index) => {
            const result = item.clone().applyMatrix4(this.mesh.matrixWorld)
            allVerticesWorld.push(result)
        })
        // VerticesViewer.showVertices(allVerticesWorld, this.app)
        for (let i = 0; i < allVertices.length; i++) {
            let vertexWorldCoord = allVertices[i].clone().applyMatrix4(this.mesh.matrixWorld); // 顶点的世界坐标
            let dir = new THREE.Vector3(); //创建一个向量
            dir.subVectors(vertexWorldCoord, centerCoord);
            let raycaster = new THREE.Raycaster(centerCoord, dir.clone().normalize());
            // this.arrowLine.clearPrev()
            // this.arrowLine.showArrowLine( dir.clone().normalize(), centerCoord)
            let intersects = raycaster.intersectObjects([this.staticMesh]);
            if (intersects.length > 0) {
                if (intersects[0].distance < dir.length()) {
                    impactFlag = true;
                }
            }
        }
        if (impactFlag) {
            console.log('碰撞');
        } else {
            console.log('未碰撞');
        }
        return impactFlag
    }
}
