import * as THREE from "three";
import {CSM} from 'three/examples/jsm/csm/CSM.js';

export class ShadowLight {
    constructor(app) {
        this.app = app
    }

    // 普通阴影
    init() {
        this.app.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        this.app.renderer.shadowMapEnabled = true;

        const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 32, 32);
        const planeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x111111})
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true; // 2需要接受阴影
        this.app.scene.add(plane);

        // 球0
        const geometry = new THREE.SphereBufferGeometry(5, 32, 32);
        const material = new THREE.MeshLambertMaterial({color: 0xffff00});
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(0, 0, 40);
        sphere.castShadow = true; // 需要投射阴影
        this.app.scene.add(sphere);

        // 球
        const sphere0 = new THREE.Mesh(new THREE.SphereBufferGeometry(5, 32, 32), new THREE.MeshLambertMaterial({color: 0xffff00}))
        sphere0.position.set(0, 10, 100);
        sphere0.castShadow = true; // 需要投射阴影
        this.app.scene.add(sphere0);

        const light = new THREE.PointLight(0xfffff);
        light.position.set(0, 0, 350);
        light.castShadow = true; // 需要投射阴影
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.radius = 20; //将此值设置为大于1的值将模糊阴影的边缘。较高的值会在阴影中产生不必要的条带效果
        this.app.scene.add(light);

        /*
                const lightDirectional = new THREE.DirectionalLight(0xdfebff, 100);
                lightDirectional.position.set(0, 0, 100);
                lightDirectional.castShadow = true;
                lightDirectional.radius = 8;
                // lightDirectional.shadow.mapSize.width = 1024;
                // lightDirectional.shadow.mapSize.height = 1024;
                lightDirectional.shadow.camera.near = 10;
                lightDirectional.shadow.camera.far = 100;
                // lightDirectional.shadow.camera.left = 100;
                // lightDirectional.shadow.camera.right = 100;
                // lightDirectional.shadow.camera.top = 100;
                // lightDirectional.shadow.camera.bottom = 100;
                this.app.scene.add(lightDirectional);
        */

    }

    // CSG 阴影
    /*    init() {
            const params = {
                orthographic: false,
                fade: false,
                far: 1000,
                mode: 'practical',
                lightX: -1,
                lightY: -1,
                lightZ: -1,
                margin: 100,
                lightFar: 5000,
                lightNear: 1,
                autoUpdateHelper: true,
            };

            const csm = new CSM({
                maxFar: params.far,
                cascades: 3,
                mode: params.mode,
                parent: this.app.scene,
                shadowMapSize: 1024,
                lightDirection: new THREE.Vector3(params.lightX, params.lightY, params.lightZ).normalize(),
                camera: this.app.camera
            });

            const floorMaterial = new THREE.MeshPhongMaterial({color: '#252a34'});
            csm.setupMaterial(floorMaterial);
            const floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000, 8, 8), floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.castShadow = true;
            floor.receiveShadow = true;
            this.app.scene.add(floor);

            const material1 = new THREE.MeshPhongMaterial({color: '#08d9d6'});
            csm.setupMaterial(material1);
            const material2 = new THREE.MeshPhongMaterial({color: '#ff2e63'});
            csm.setupMaterial(material2);
            const geometry = new THREE.BoxBufferGeometry(10, 10, 10);
            const cube1 = new THREE.Mesh(geometry, material2);
            cube1.castShadow = true;
            cube1.receiveShadow = true;
            this.app.scene.add(cube1);
            cube1.position.set(25, 20, 30);
            cube1.scale.y = Math.random() * 2 + 6;

            this.app.renderQueue.push(
                function updateFBX() {
                    // 更新混合器相关的时间
                    csm.update();
                }
            )
        }*/

}
