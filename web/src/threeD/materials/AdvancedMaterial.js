import * as THREE from 'three'
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {serverAdress} from '@/config';

export class AdvancedMaterial {
    constructor(app) {
        this.app = app
    }

    add() {
        const self = this
        const loader = new OBJLoader();
        let mesh = null;

        loader.load(serverAdress + '/3Dstatic/model3D/心脏/heart/model.obj', function (obj) {
            self.app.scene.add(obj);
            mesh = obj.children[0];
            mesh.scale.set(10, 10, 10);
            const textureLoader = new THREE.TextureLoader();

            const texture = textureLoader.load(serverAdress + '/3Dstatic/model3D/心脏/heart/color.png');
            mesh.material.map = texture;

            const textureNormal = textureLoader.load(serverAdress + '/3Dstatic/model3D/心脏/heart/normal.png');
            mesh.material.normalMap = textureNormal
            mesh.material.normalScale.set(1.5, 1.5)

            const textureSpecular = textureLoader.load(serverAdress + '/3Dstatic/model3D/心脏/heart/Specular.png');
            mesh.material.specularMap = textureSpecular;
            mesh.material.specular.set(0xffffff);
            mesh.material.shininess = 100;

            const textureCube = new THREE.CubeTextureLoader()
                .setPath(serverAdress + '/3Dstatic/model3D/心脏/heart/环境贴图/')
                .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
            mesh.material.envMap = textureCube;
            self.app.scene.add(mesh)
            self.app.scene.add(mesh)
        })

    }
}
