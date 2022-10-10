import * as THREE from "three";

import {SceneCamera} from './sceneBasic/SceneCamera'
import {RaycasterHelper} from "@/threeD/interaction/RaycasterHelper";
import {ImportObjs} from "@/threeD/loaders/ImportObjs";
import {ImportFBX} from '@/threeD/animation/ImportFBX'
import {EventCube} from '@/threeD/interaction/EventCube'
import {JudgeFace3} from '@/threeD/basicMath/JudgeFace3'
import {FlowPipes} from '@/threeD/animation/FlowPipe/FlowPipes'
import {Helper} from '@/threeD/helpers/Helper'
import {Controls} from '@/threeD/sceneBasic/Controls'
import {ExportImport} from '@/threeD/loaders/ExportImport'
import {Car} from '@/threeD/PROJECTS/game/Car'
import {PhysiSimulate} from '@/threeD/PROJECTS/game/PhysiSimulate'
import {MakeBufferGeometryMesh} from './basicMesh/MakeBufferGeometryMesh'
import {MakeBufferGeometryCube} from './basicMesh/MakeBufferGeometryCube'
import {MakeGeometryMesh} from './basicMesh/MakeGeometryMesh'
import {MakeMeshPoint} from './basicMesh/MakeMeshPoint'
import {MakeMeshLine} from './basicMesh/MakeMeshLine'
import {TransformMesh} from './interaction/TransformMesh'
import {TakePoint} from './interaction/TakePoint'
import {Animation} from './animation/Animation'
import {Sound} from './interaction/Sound'
import {ArrowLine} from './helpers/representationalviewer/ArrowLine'
import {Matrix4Practice} from './basicMath/Matrix4Practice'
import {EulerPractice} from './basicMath/EulerPractice'
import {QuaternionPractice} from './basicMath/QuaternionPractice'
import {OutlineShineEffect} from './interaction/OutlineShineEffect'
import {PlayVideo} from './materials/PlayVideo'
import {TextureCanvasAnimation} from './materials/TextureCanvasAnimation'
import {BasicMaterials} from '@/threeD/materials/BasicMaterials'
import {OfflineRender} from './undefinedNow/OfflineRender'
import {GUIApp} from './GUI/GUIApp'
import {ShadowLight} from './undefinedNow/ShadowLight'
import {LittleWindow} from './helpers/representationalviewer/LittleWindow'
import {MultipleElements} from './undefinedNow/MultipleElements'
import {AdvancedMaterial} from './materials/AdvancedMaterial'
import {SkyBox} from './sceneBasic/SkyBox'
import {WaterPlane} from './materials/WaterPlane'
import {LightningStrike} from './LightningStrike'
import {BloomOnly} from "./Bloom/BloomOnly";
import {UnrealBloomPassMy} from "./Bloom/UnrealBloomPass";
import {Grass} from "./Grass";
import {Cloud} from "./Cloud";

export default class App3D {

    constructor(dom) {
        this.renderQueue = []  // 动画队列
        this.eventBus = new THREE.EventDispatcher() // 3D事件中心
        this.clock = new THREE.Clock();
        this.dom = dom
        this.scene = null
        this.camera = null
        this.sceneCamera = null
        this.renderer = null
        this.controls = null

        this._testMeshExport = null
        this.raycasterHelper = null
        this.bspObject = null

        this.FBXLoader = null
        this.objLoaders = null

        this.JudgeFace3 = null
        this.flowPipes = null
        this.eventCube = null
        this.helper = null
        this.exportImport = null
        this.bSPCalculate = null
        this.car = null
        this.physiSimulate = null
        this.makeBufferGeometryMesh = null
        this.makeGeometryMesh = null
        this.makeMeshPoint = null
        this.makeMeshLine = null
        this.transformMesh = null
        this.takePoint = null
        this.animation = null
        this.sound = null
        this.arrowLine = new ArrowLine(this)
        this.matrix4Practice = null
        this.eulerPractice = null
        this.quaternionPractice = null
        this.makeBufferGeometryCube = null
        this.outlineShineEffect = null
        this.playVideo = null
        this.canvasTexture = null
        this.basicMaterials = null
        this.GUI3D = null

        this.poitnLight = null
        this.littleWindow = null
        this.multipleElements = null
        this.advancedMaterial = null
        this.skyBox = null
        this.waterPlane = null

        this.loopFlag = true
    }

    /**
     * 初始化3D基础场景
     */
    init() {
        this.initScene()
        this.sceneCamera = new SceneCamera(this)
        this.camera = this.sceneCamera.camera
        this.initLight(0.5)
        this.initRenderer()

        this.controls = new Controls(this)
        this.helper = new Helper(this)
        this.raycasterHelper = new RaycasterHelper(this)
        this.exportImport = new ExportImport(this)

        this.objLoaders = new ImportObjs(this)

        this.FBXLoader = new ImportFBX(this)
        this.JudgeFace3 = new JudgeFace3(this)
        this.flowPipes = new FlowPipes(this)
        this.eventCube = new EventCube(this)
        this.car = new Car(this)
        this.physiSimulate = new PhysiSimulate(this)
        this.makeMeshPoint = new MakeMeshPoint(this)
        this.makeMeshLine = new MakeMeshLine(this)
        this.transformMesh = new TransformMesh(this)
        this.takePoint = new TakePoint(this)
        this.animation = new Animation(this)
        this.sound = new Sound(this)
        this.playVideo = new PlayVideo(this)
        this.canvasTexture = new TextureCanvasAnimation(this)
        this.basicMaterials = new BasicMaterials(this)
        this.GUI3D = new GUIApp(this)
        this.shadowLight = new ShadowLight(this)
        this.littleWindow = new LittleWindow(this)
        this.multipleElements = new MultipleElements(this)

        this.matrix4Practice = new Matrix4Practice(this)
        this.eulerPractice = new EulerPractice(this)
        this.quaternionPractice = new QuaternionPractice(this)
        this.outlineShineEffect = new OutlineShineEffect(this)
        this.makeBufferGeometryMesh = new MakeBufferGeometryMesh(this)
        this.makeGeometryMesh = new MakeGeometryMesh(this)
        this.offLineRender = new OfflineRender(this)
        this.advancedMaterial = new AdvancedMaterial(this)
        this.skyBox = new SkyBox(this)
        this.waterPlane = new WaterPlane(this)
        this.lightningStrike = new LightningStrike(this)
        this.bloomOnly = new BloomOnly(this)
        this.cloud = new Cloud(this)
        this.grass = new Grass(this)
        this.startLoop()

    }

    addCustomCube() {
        this.makeBufferGeometryCube = new MakeBufferGeometryCube(this)
    }

    /**
     * 初始化场景
     */
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.autoUpdate = true
        this.changeSceneBackground(1)
    }

    getSceneChildren() {
        const result = []

        function recurrenceScene(aim, origin) {
            const count = origin.length
            for (let i = 0; i < count; i++) {
                const item = origin[i]
                if (item.children.length === 0) {
                    const data = {
                        title: item.type,
                        key: item.uuid
                    }
                    if (item.cname) {
                        data.title = item.cname
                    }
                    aim.push(data)
                } else {
                    const data = {
                        title: item.type,
                        key: item.uuid,
                        children: []
                    }
                    if (item.cname) {
                        data.title = item.cname
                    }
                    aim.push(data)
                    recurrenceScene(data.children, item.children)
                }
            }
        }

        recurrenceScene(result, this.scene.children)
        return result
    }

    getMeshByUUID(uuid) {
        this.scene.children.forEach(item => {
            if (item.uuid === uuid[0]) {
                console.log('根据UUID获取', item)
                if (this.boxHelper) {
                    this.scene.remove(this.boxHelper);
                }
                this.boxHelper = new THREE.BoxHelper(item, 0xffff00);
                this.boxHelper.cname = '选择网格辅助'
                this.scene.add(this.boxHelper);
                return item
            }
        })
    }

    getMeshByUUIDDispose() {
        if (this.boxHelper) {
            this.scene.remove(this.boxHelper);
        }
    }

    changeSceneBackground(mode) {
        if (mode === 0) {
            const backgroundColor = new THREE.Color(0x000000)// 黒
            this.scene.background = backgroundColor
        } else if (mode === 1) {
            const backgroundColor = new THREE.Color(0x1E1E1E)// 深灰
            this.scene.background = backgroundColor
        } else if (mode === 2) {
            const backgroundColor = new THREE.Color(0x888888)// 浅灰
            this.scene.background = backgroundColor
        } else if (mode === 3) {
            const backgroundColor = new THREE.Color(0xFFFFFF)// 白
            this.scene.background = backgroundColor
        }
    }

    /**
     * 初始化光源
     */
    initLight(intensity) {
        const distance = 500

        //环境光 均匀 无方向 无阴影
        const ambient = new THREE.AmbientLight(0x444444, intensity);

        // 方向光及辅助器
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
        directionalLight.position.set(distance, distance, distance);
        directionalLight.cname = '点光源'

        // 点光源位置
        const point0 = new THREE.PointLight(0xffffff, intensity);
        point0.position.set(distance, 0, 0);
        point0.cname = '点光源'

        const point1 = new THREE.PointLight(0xffffff, intensity);
        point1.position.set(-distance, 0, 0);
        point1.cname = '点光源'

        const point2 = new THREE.PointLight(0xffffff, intensity);
        point2.position.set(0, distance, 0);
        point2.cname = '点光源'

        const point3 = new THREE.PointLight(0xffffff, intensity);
        point3.position.set(0, -distance, 0);
        point3.cname = '点光源'

        const point4 = new THREE.PointLight(0xffffff, intensity);
        point4.position.set(0, 0, distance);
        point4.cname = '点光源'

        const point5 = new THREE.PointLight(0xffffff, intensity);
        point5.position.set(0, 0, -distance);
        point5.cname = '点光源'

        // 半球光（HemisphereLight）
        // 平面光光源（RectAreaLight）

        //点光源添加到场景中
        this.scene.add(point0, point1, point2, point3, point4, point5);
    }

    /**
     * 初始化Renderer
     */
    initRenderer() {
        const width = this.dom.width
        const height = this.dom.height;
        this.renderer = new THREE.WebGLRenderer({canvas: this.dom, antialias: true});
        //设置渲染区域尺寸
        this.renderer.setSize(width, height);
        //设置背景颜色
        this.renderer.setClearColor(0x000000, 0.1);
        this.renderer.shadowMap.enabled = true;
    }

    /**
     * loop
     */
    startLoop() {
        const self = this

        function run() {
            if (self.loopFlag) {
                requestAnimationFrame(run);
                self.onRender();
                if (self.renderQueue.length > 0) {
                    self.renderQueue.forEach((item, index) => {
                        item()
                    })
                }
                self.eventBus.dispatchEvent({type: 'updateLeftTreeData', message: 'message!'})

            }
        }

        run()
    }

    removeFromQueue(name) {
        this.renderQueue.forEach((item, index) => {
            if (item.name === name) {
                this.renderQueue.splice(index, 1)
            }
        })
    }

    /**
     * 更新相机
     */
    onRender() {
        this.renderer.render(this.scene, this.camera); //执行渲染操作
    }

    onLoop() {

    }

    /**
     * 动态调整屏幕大小
     */
    windowRelise() {
        this.dom.width = window.innerWidth
        this.dom.height = window.innerHeight
        this.renderer.setSize(this.dom.width, this.dom.height);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    destroy() {
        this.loopFlag = false
        this.transformMesh.removeEvent()
    }

}
