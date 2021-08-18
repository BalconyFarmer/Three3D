import * as THREE from "three";

export class CubeMesh {
    constructor() {
    }

    static makeCubeMesh(x, y, z, size) {
        const geometry = new THREE.BoxBufferGeometry(size, size, size);
        const material = new THREE.MeshLambertMaterial({color: 0x00ff00});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = x
        mesh.position.y = y
        mesh.position.z = z
        return mesh
    }
}
