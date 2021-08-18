import {CubeMesh} from "./CubeMesh";
import * as THREE from 'three'

/**
 * 观察geometry顶点
 */
export class VerticesViewer {
    constructor(app) {
        this.app = app
        this.cubeList = []
    }

    /**
     * 注意,设置其余物体为透明
     * @param vertices vertices[]
     * @param app
     */
    static showVertices(vertices, app) {
        const _vertices = []
        if (typeof vertices[0] === 'number') {
            for (let i = 0; i < vertices.length; i += 3) {
                let vertice = new THREE.Vector3()
                vertice.x = vertices[i]
                vertice.y = vertices[i + 1]
                vertice.z = vertices[i + 2]
                _vertices.push(vertice)
            }
            _vertices.forEach(item => {
                const cube = CubeMesh.makeCubeMesh(item.x, item.y, item.z, 1)
                app.scene.add(cube)
            })
        } else {
            vertices.forEach(item => {
                const cube = CubeMesh.makeCubeMesh(item.x, item.y, item.z, 1)
                app.scene.add(cube)
            })
        }
    }

    static dispose() {
        // TODO 清除
    }

}
