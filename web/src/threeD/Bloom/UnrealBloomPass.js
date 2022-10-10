import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';

/**
 * 全局泛光
 */
export class UnrealBloomPassMy {
    constructor(app) {
        this.app = app
    }

    addBloom() {
        let mixer = null

        const params = {
            exposure: 1,
            bloomStrength: 1.5,
            bloomThreshold: 0,
            bloomRadius: 0
        };

        const renderScene = new RenderPass(this.app.scene, this.app.camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        let composer = new EffectComposer(this.app.renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        const self = this
        new GLTFLoader().load('http://localhost:1111/3Dstatic/滇中饮水/PrimaryIonDrive.glb', function (gltf) {
            const model = gltf.scene;
            self.app.scene.add(model);
            mixer = new THREE.AnimationMixer(model);
            const clip = gltf.animations[0];
            mixer.clipAction(clip.optimize()).play();
            animate();
        });

        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            mixer.update(delta);
            composer.render();
        }

        const gui = new GUI();

        gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

            self.app.renderer.toneMappingExposure = Math.pow( value, 4.0 );

        } );

        gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

            bloomPass.threshold = Number( value );

        } );

        gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

            bloomPass.strength = Number( value );

        } );

        gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

            bloomPass.radius = Number( value );

        } );
    }


}
