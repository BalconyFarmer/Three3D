import * as THREE from "three";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';

/**
 * 全局泛光
 */
export class BloomOnly {
    constructor(app) {
        this.app = app
    }

    bloom() {

        const self = this

        let scene = this.app.scene
        let camera = this.app.camera
        let renderer = this.app.renderer
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1;

        const params = {
            exposure: 1, // 曝光度
            bloomThreshold: 0.2, // 曝光阀值
            bloomStrength: 1.52, // 强度
            bloomRadius: 0.29 // 发散度
        };

        const renderScene = new RenderPass(scene, camera);

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;

        const bloomComposer = new EffectComposer(renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);

        const finalPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: {value: null},
                    bloomTexture: {value: bloomComposer.renderTarget2.texture}
                },
                vertexShader: document.getElementById('vertexshader').textContent,
                fragmentShader: document.getElementById('fragmentshader').textContent,
                defines: {}
            }), "baseTexture"
        );
        finalPass.needsSwap = true;

        const finalComposer = new EffectComposer(renderer);
        finalComposer.addPass(renderScene);
        finalComposer.addPass(finalPass);

        let light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.setScalar(1);
        scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

        const layers = 3;
        let dummy = new THREE.Object3D();
        let g = NestedBoxesGeometry(5, 7, layers, 0xff00ff, 0x00ffff);
        let m = new THREE.LineBasicMaterial({
            vertexColors: true
        });
        let l = new THREE.LineSegments(g, m);
        scene.add(l);

        let darkMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        let lightMaterial = new THREE.MeshLambertMaterial({color: 0xffff00});
        let box = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), lightMaterial);
        scene.add(box);

        window.addEventListener("resize", () => {
            camera.aspect = innerWidth / innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(innerWidth, innerHeight);
        })

//let clock = new THREE.Clock();

        renderer.setAnimationLoop(() => {
            //let t = clock.getElapsedTime() * 0.05;

            box.material = darkMaterial;
            bloomComposer.render();
            box.material = lightMaterial;
            finalComposer.render();

            //renderer.render(scene, camera);
        })

        function NestedBoxesGeometry(minSize, maxSize, layers = 2, innerColor = 0xffffff, outerColor = 0x7f7f7f) {

            layers = Math.max(2, layers);

            let cI = new THREE.Color(innerColor);
            let cO = new THREE.Color(outerColor);
            let cM = new THREE.Color();

            let basePts = [
                [0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1],
                [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]
            ].map(p => {
                return new THREE.Vector3(p[0], p[1], p[2]).subScalar(0.5)
            });
            let baseIndex = [
                0, 1, 1, 2, 2, 3, 3, 0,
                4, 5, 5, 6, 6, 7, 7, 4,
                0, 4, 1, 5, 2, 6, 3, 7
            ];
            let connect = [
                0, 8, 1, 9, 2, 10, 3, 11,
                4, 12, 5, 13, 6, 14, 7, 15
            ];

            let sizeStep = (maxSize - minSize) / (layers - 1);
            let pts = [];
            let idx = [];
            let col = [];
            let layer = [];
            for (let i = 0; i < layers; i++) {
                basePts.forEach(p => {
                    pts.push(p.clone().multiplyScalar(i * sizeStep + minSize));
                    layer.push(i);
                    cM.lerpColors(cI, cO, i / (layers - 1));
                    col.push(cM.r, cM.g, cM.b);
                });
                baseIndex.forEach(id => {
                    idx.push(id + i * 8)
                })

                if (i < (layers - 1)) {
                    connect.forEach(c => {
                        idx.push(c + i * 8);
                    })
                }
            }

            let g = new THREE.BufferGeometry().setFromPoints(pts);
            g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
            g.setAttribute("layer", new THREE.Float32BufferAttribute(layer, 1));
            g.setIndex(idx);

            return g;
        }

        const gui = new GUI();

        const folder = gui.addFolder('Bloom Parameters');

        folder.add(params, 'exposure', 0.1, 2).onChange(function (value) {
            self.app.renderer.toneMappingExposure = Math.pow(value, 4.0);
        });

        folder.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
            bloomPass.threshold = Number(value);
        });

        folder.add(params, 'bloomStrength', 0.0, 10.0).onChange(function (value) {
            bloomPass.strength = Number(value);
        });

        folder.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
            bloomPass.radius = Number(value);
        });
    }


}
