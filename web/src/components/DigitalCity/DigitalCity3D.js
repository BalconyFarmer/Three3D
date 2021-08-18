import App3D from "../../threeD/App3D";
import * as THREE from 'three'
import {serverAdress} from '@/config';

export class DigitalCity3D {
    constructor(dom) {
        this.dom = dom
        this.app3D = null
        this.url = "http://101.34.131.94:8081/0staticFixed/"
    }

    run() {
        const self = this

        this.app3D = new App3D(this.dom)
        this.app3D.init()

        this.resetInit.bind(this)()

        this.startTools()

        this.loadOBJ.bind(this)()

        this.addFlowPipe.bind(this)()

        this.addGUI.bind(this)()

        this.addCar.bind(this)()

        // this.addPeople.bind(this)()

        this.addFloorGround.bind(this)()

        // this.addWater.bind(this)()

        this.addShadow.bind(this)()

        window.addEventListener('resize', this.app3D.windowRelise.bind(this.app3D), false);
    }

    startTools() {
        // this.app3D.transformMesh.addEvent() // 开启移动物体
        // this.app3D.takePoint.start()
    }

    resetInit() {
        this.app3D.camera.position.set(219, 364, 677);
        const x = -80
        this.app3D.camera.translateY(x)
        const lookAtPosition = this.app3D.scene.position
        lookAtPosition.y += x
        this.app3D.camera.lookAt(lookAtPosition);

        this.app3D.scene.background = new THREE.Color(0xE7E9E4);
        this.app3D.controls.setLimit(-Math.PI / 2, Math.PI / 2, 0, Math.PI / 2, 10, 800)
        this.app3D.controls.startAutoRun(0.2)

        // this.app3D.outlineShineEffect.run() // 外轮廓高亮效果
    }

    loadOBJ() {
        this.app3D.objLoaders.loadOBJ(serverAdress + '/3Dstatic/model3D/digitalCity/0底座/总成.obj').loadOver(function (mesh) {
            mesh.children.forEach(item => {
                item.receiveShadow = true;
                item.material.shininess = 0.8
            })
        })

        this.app3D.objLoaders.loadOBJ(serverAdress + '/3Dstatic/model3D/digitalCity/1路面/总成.obj').loadOver(function (mesh) {
            mesh.children.forEach(item => {
                item.receiveShadow = true;
            })
        })

        this.app3D.objLoaders.loadOBJ(serverAdress + '/3Dstatic/model3D/digitalCity/2路灯/总成.obj').loadOver(function (mesh) {
            /*            const streetLightPosition = new THREE.Matrix4();
                        streetLightPosition.elements = [-0.014772258369173265, -0.003687575836363584, 3.8472824566451638, 0, 0.0215148945260349, 1.8116664012686554, 0.0018190712287074551, 0, -2.356635476593795, 0.02799586891983288, -0.009021846366519174, 0, 21.79138118348252, 89.57512988213387, 73.30702025566957, 1];

                        const changeResult = self.app3D.objLoader1.mesh.applyMatrix4(streetLightPosition)

                        self.app3D.objLoader1.mesh.updateMatrixWorld()*/
        })

        this.app3D.objLoaders.loadOBJ(serverAdress + '/3Dstatic/model3D/digitalCity/3楼房/总成.obj').loadOver(function (mesh) {
            mesh.children.forEach(item => {
                item.castShadow = true;
            })
        })

        this.app3D.objLoaders.loadOBJ(serverAdress + '/3Dstatic/model3D/digitalCity/4隧道/总成.obj')

        this.app3D.objLoaders.loadOBJ(serverAdress + '/3Dstatic/model3D/digitalCity/5山体/总成.obj').loadOver(function (mesh) {
            mesh.children.forEach(item => {
                item.receiveShadow = true;
                item.material.forEach(item => {
                    item.shininess = 0
                })
            })
        })
    }

    addFlowPipe() {
        const point0 = new THREE.Vector3(-109, 93, 28)
        const point1 = new THREE.Vector3(-48, 95, 42)
        const point2 = new THREE.Vector3(-35, 96, 106)
        const point3 = new THREE.Vector3(17, 88, 79)
        const flowPipes = [point0, point1, point2, point3]
        this.app3D.flowPipes.creatPipe(flowPipes)
    }

    addGUI() {
        this.app3D.GUI3D.makeFixedText(60, 15, '隧道区域', new THREE.Vector3(23, 147, -111), '14px', 1, 15)

        this.app3D.GUI3D.makeFixedText(40, 15, '住宅0', new THREE.Vector3(40, 101, -11), '13px', 1, 13)

        this.app3D.GUI3D.makeVerticalText(40, 15, '住宅1', new THREE.Vector3(70, 98, 77), '13px', 1, 13)

        const sliderMesh = this.app3D.GUI3D.makeFixedSlider()
        sliderMesh.position.set(-53, 120, -66)
        sliderMesh.scale.set(0.3, 0.3, 0.3)

        const checkBOxMesh = this.app3D.GUI3D.makeFixedCheckBOx('hello')
        checkBOxMesh.scale.set(0.05, 0.05, 0.05)
        checkBOxMesh.position.set(-41, 95, 76)
        checkBOxMesh.rotateY(-Math.PI / 2);
        checkBOxMesh.translateY(5)

        const inputBOxMesh = this.app3D.GUI3D.makeFixedInput('请输入')
        inputBOxMesh.scale.set(0.1, 0.1, 0.1)
        inputBOxMesh.position.set(-120, 130, 32)

        const btn = this.app3D.GUI3D.makeVerticalBTN(60, 15, 'First Person', new THREE.Vector3(-142, 97, 106), '10px', 0, 11)
        const self = this
        btn.addEvent(function () {
            const personalControlPosition = new THREE.Vector3(-102, 8, 81)
            const lookPosition = new THREE.Vector3(-42, 15, 73)
            self.app3D.controls.startFirstPersonControls(personalControlPosition, lookPosition)
        })

    }

    addCar() {
        const mesh = serverAdress + '/3Dstatic/model3D/警车/警车/obj/policeCar.obj'
        const times = [0, 5, 10]
        const positions = [-164, 87, -0.9, -71, 87, 6.9, -71, 87, 109]

        const rotationTime = [0, 0.1, 5, 5.5]

        const _quaternion0 = new THREE.Quaternion()
        _quaternion0.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);

        const _quaternion1 = new THREE.Quaternion()
        _quaternion1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

        const quaternion0 = new THREE.Quaternion()
        quaternion0.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

        const quaternion1 = new THREE.Quaternion()
        quaternion1.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);

        const rotationPosition = [_quaternion0.x, _quaternion0.y, _quaternion0.z, _quaternion0.w, _quaternion1.x, _quaternion1.y, _quaternion1.z, _quaternion1.w, quaternion0.x, quaternion0.y, quaternion0.z, quaternion0.w, quaternion1.x, quaternion1.y, quaternion1.z, quaternion1.w]
        this.app3D.animation.start(mesh, times, positions, rotationTime, rotationPosition)
    }

    addPeople() {
        const position = new THREE.Vector3(-95, 87, 35)
        const scale = new THREE.Vector3(0.05, 0.05, 0.05)
        this.app3D.FBXLoader.loadFBX("http://localhost:1111/3Dstatic/model3D/SambaDancing.fbx", position, scale)
    }

    addFloorGround() {

        const material = new THREE.MeshBasicMaterial({color: 0xE7E9E4, dithering: true}); // 0xE7E9E4
        const plane = new THREE.PlaneBufferGeometry(800, 800)
        const mesh = new THREE.Mesh(plane, material);
        mesh.position.set(0, 0, 0);
        mesh.rotation.x = -Math.PI * 0.5;

        this.app3D.scene.add(mesh);
    }

    addWater() {
        this.app3D.waterPlane.add()
        const position = new THREE.Matrix4();
        position.elements = [1, 0, 0, 0, 0, 2, -1, 0, 0, 1, 2, 0, -300, -30, 0, 1];
        const changeResult = this.app3D.waterPlane.refractor.applyMatrix4(position)
        this.app3D.waterPlane.refractor.updateMatrixWorld()
    }

    addShadow() {
        this.app3D.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        this.app3D.renderer.shadowMapEnabled = true;

        const light = new THREE.PointLight(0xE7E9E4, 0.5, 1000, Math.PI / 200);
        light.position.set(200, 300, 200);
        light.castShadow = true; // 需要投射阴影
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 2000;
        // light.shadow.camera.fov = 30;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.radius = 1; //将此值设置为大于1的值将模糊阴影的边缘。较高的值会在阴影中产生不必要的条带效果
        this.app3D.scene.add(light);
        var sphereSize = 1;
        var pointLightHelper = new THREE.PointLightHelper(light, sphereSize);
        this.app3D.scene.add(pointLightHelper);
    }

    destroy() {
        this.app3D.destroy()
        this.app3D = null
    }
}
