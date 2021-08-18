import * as THREE from "three";

import {Refractor} from 'three/examples/jsm/objects/Refractor.js';
import {WaterRefractionShader} from 'three/examples/jsm/shaders/WaterRefractionShader.js';
import {serverAdress} from '@/config';

export class WaterPlane {
    constructor(app) {
        this.app = app
        this.refractor = null
    }

    add() {
        var refractorGeometry = new THREE.PlaneBufferGeometry(10, 10);

        this.refractor = new Refractor(refractorGeometry, {
            color: 0x999999,
            textureWidth: 1024,
            textureHeight: 1024,
            shader: WaterRefractionShader
        });

        this.app.scene.add(this.refractor);

        // load dudv map for distortion effect
        const self = this

        var dudvMap = new THREE.TextureLoader().load(serverAdress + '/3Dstatic/texture/waterdudv.jpg', function () {

            self.app.renderQueue.push(
                function () {
                    const clock = new THREE.Clock()
                    self.refractor.material.uniforms["time"].value += self.app.clock.getDelta();
                }
            )
        });

        dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
        this.refractor.material.uniforms["tDudv"].value = dudvMap;
    }
}
