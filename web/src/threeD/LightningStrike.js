import * as THREE from "three";
import {LightningStorm} from 'three/examples/jsm/objects/LightningStorm.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';

export class LightningStrike {
    constructor(app) {
        this.app = app
        // this.add()
    }


    add() {
        const self = this

        function createStormScene() {
            const scene = self.app.scene;
            scene.userData.canGoBackwardsInTime = false;

            // Storm
            scene.userData.lightningColor = new THREE.Color(0xB0FFFF);
            scene.userData.outlineColor = new THREE.Color(0x00FFFF);
            scene.userData.lightningMaterial = new THREE.MeshBasicMaterial({color: scene.userData.lightningColor});

            const rayDirection = new THREE.Vector3(0, -1, 0);
            let rayLength = 0;
            const vec1 = new THREE.Vector3();
            const vec2 = new THREE.Vector3();

            scene.userData.rayParams = {
                radius0: 1,
                radius1: 0.5,
                minRadius: 0.3,
                maxIterations: 7,
                timeScale: 0.15,
                propagationTimeFactor: 0.2,
                vanishingTimeFactor: 0.9,
                subrayPeriod: 4,
                subrayDutyCycle: 0.6,
                maxSubrayRecursion: 3,
                ramification: 3,
                recursionProbability: 0.4,
                roughness: 0.85,
                straightness: 0.65,
                onSubrayCreation: function (segment, parentSubray, childSubray, lightningStrike) {

                    lightningStrike.subrayConePosition(segment, parentSubray, childSubray, 0.6, 0.6, 0.5);

                    // Plane projection

                    rayLength = lightningStrike.rayParameters.sourceOffset.y;
                    vec1.subVectors(childSubray.pos1, lightningStrike.rayParameters.sourceOffset);
                    const proj = rayDirection.dot(vec1);
                    vec2.copy(rayDirection).multiplyScalar(proj);
                    vec1.sub(vec2);
                    const scale = proj / rayLength > 0.5 ? rayLength / proj : 1;
                    vec2.multiplyScalar(scale);
                    vec1.add(vec2);
                    childSubray.pos1.addVectors(vec1, lightningStrike.rayParameters.sourceOffset);

                }
            };

            const GROUND_SIZE = 100;
            const storm = new LightningStorm({
                size: GROUND_SIZE,
                minHeight: 90,
                maxHeight: 200,
                maxSlope: 0.6,
                maxLightnings: 8,
                lightningParameters: scene.userData.rayParams,
                lightningMaterial: scene.userData.lightningMaterial,
                onLightningDown: function (lightning) {

                }
            });

            scene.add(storm);

            // Compose rendering
            let composer = new EffectComposer(self.app.renderer);

            composer.passes = [];

            let pass1 = new RenderPass(scene, self.app.camera)
            composer.addPass(pass1);

            createOutline(scene, storm.lightningsMeshes, scene.userData.outlineColor);

            function createOutline(scene, objectsArray, visibleColor) {

                const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, self.app.camera, objectsArray);
                outlinePass.edgeStrength = 2.5;
                outlinePass.edgeGlow = 0.7;
                outlinePass.edgeThickness = 2.8;
                outlinePass.visibleEdgeColor = visibleColor;
                outlinePass.hiddenEdgeColor.set(0);
                composer.addPass(outlinePass);

                scene.userData.outlineEnabled = true;

                return outlinePass;

            }

            scene.userData.render = function (time) {
                storm.update(time);
                composer.render();
            };

            return scene;

        }


        let currentTime = 0;
        self.app.scene.userData.timeRate = 1;

        function render() {
            currentTime += self.app.scene.userData.timeRate * self.app.clock.getDelta();
            if (currentTime < 0) {
                currentTime = 0;
            }
            self.app.scene.userData.render(currentTime);
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
        }

        createStormScene()
        animate()

    }
}
