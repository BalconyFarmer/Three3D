import * as THREE from "three";

export class BasicMaterials {
    constructor(app) {
        this.app = app
        this.nameList = []
        this.materialList = []
        this.initNameList()
        this.geometry = null
        this.mesh = null
    }

    show() {
        this.nameList.forEach(item => {
            const containerDom = document.getElementById('materialBalls')
            let materialBallDom = document.createElement("canvas")
            materialBallDom.style.marginLeft = '10px'
            materialBallDom.style.marginTop = '10px'
            materialBallDom.width = 100
            materialBallDom.height = 100
            containerDom.appendChild(materialBallDom)
            this.init3DBall(materialBallDom, item)
        })
    }

    init3DBall(canvas, materialName) {
        let scene = null
        let camera = null
        let point = null // light
        let ambient = null  // light
        let renderer = null
        let mesh = null

        function initScene() {
            scene = new THREE.Scene();
            scene.autoUpdate = true
            const backgroundColor = new THREE.Color('gray')
            scene.background = backgroundColor
        }

        initScene()

        function initCamera() {
            const width = canvas.width
            const height = canvas.height;
            //窗口宽高比
            const k = width / height;
            //三维场景显示范围控制系数，系数越大，显示的范围越大
            const s = 20;
            //创建相机对象 PerspectiveCamera 正交相机 OrthographicCamera 透视相机
            camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
            // this.camera = new THREE.PerspectiveCamera(
            //     45, width / height, 1, 1000
            // );
            //设置相机位置
            camera.position.set(200, 300, 200);
            //设置相机方向(指向的场景对象)
            camera.lookAt(scene.position);
        }

        initCamera()

        function initLight() {
            point = new THREE.PointLight(0xffffff);
            //点光源位置
            point.position.set(400, 200, 300);
            //点光源添加到场景中
            scene.add(point);
            //环境光
            ambient = new THREE.AmbientLight(0x444444);
            scene.add(ambient);
        }

        initLight()

        function initRenderer() {
            const width = canvas.width
            const height = canvas.height;
            renderer = new THREE.WebGLRenderer({canvas: canvas});
            //设置渲染区域尺寸
            renderer.setSize(width, height);
            //设置背景颜色
            renderer.setClearColor(0xb9d3ff, 1);
        }

        initRenderer()

        function addMesh() {
            const geometry = new THREE.BoxBufferGeometry(12, 12, 12);
            const material = new THREE[materialName]({color: 0x00ff00});
            mesh = new THREE.Mesh(geometry, material);
            // mesh.rotateY(45)
            // mesh.position.x += 10
            scene.add(mesh)
            renderer.render(scene, camera)
        }

        addMesh()

        function startAnimation() {
            mesh.rotateY(0.01)
            renderer.render(scene, camera)
        }

        this.app.renderQueue.push(startAnimation)
    }

    makeGeometry() {
        this.geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    }

    /**
     * 线材质
     * @constructor
     */
    LineBasicMaterial() {
        return new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
    }

    /**
     * 虚线材质
     * @constructor
     */
    LineDashedMaterial() {
        return new THREE.LineDashedMaterial({
            color: 0xffffff,
            linewidth: 1,
            scale: 1,
            dashSize: 3,
            gapSize: 1,
        });
    }

    /**
     * 点材质
     * @constructor
     */
    PointsMaterial() {
        return new THREE.PointsMaterial({color: 0x888888});
    }

    /**
     * 着色器材质
     * @returns {THREE.ShaderMaterial}
     * @constructor
     */
    ShaderMaterial() {
        return new THREE.ShaderMaterial({

            uniforms: {

                time: {value: 1.0},
                resolution: {value: new THREE.Vector2()}

            },

            vertexShader: document.getElementById('vertexShader').textContent,

            fragmentShader: document.getElementById('fragmentShader').textContent

        });
    }

    /**
     * 阴影材质
     * @returns {*}
     * @constructor
     */
    ShadowMaterial() {
        let shadowMaterial = new THREE.ShadowMaterial();
        shadowMaterial.opacity = 0.2;
        return shadowMaterial
    }

    /**
     * 精灵材质
     * @returns {THREE.SpriteMaterial}
     * @constructor
     */
    SpriteMaterial() {
        let spriteMap = new THREE.TextureLoader().load('textures/sprite.png');
        let spriteMaterial = new THREE.SpriteMaterial({map: spriteMap, color: 0xffffff});
        // let sprite = new THREE.Sprite(spriteMaterial);
        // sprite.scale.set(200, 200, 1)
        return spriteMaterial
    }

    /**
     * 原生着色器材质
     * @returns {THREE.RawShaderMaterial}
     * @constructor
     */
    RawShaderMaterial() {
        var material = new THREE.RawShaderMaterial({

            uniforms: {
                time: {value: 1.0}
            },
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent,

        });

        return material
    }

    /**
     * 基础材质
     * @returns {THREE.MeshBasicMaterial}
     * @constructor
     */
    MeshBasicMaterial() {
        return new THREE.MeshBasicMaterial()
    }

    /**
     * 一种按深度绘制几何体的材质。深度基于相机远近平面。白色最近，黑色最远。
     * @constructor
     */
    MeshDepthMaterial() {
        return new THREE.MeshDepthMaterial()
    }

    /**
     * 确保物体的透明部分不投射阴影
     * @returns {THREE.MeshDepthMaterial}
     * @constructor
     */
    MeshDistanceMaterial() {
        return new THREE.MeshDepthMaterial()
    }

    /**
     * 一种非光泽表面的材质，没有镜面高光
     * @constructor
     */
    MeshLambertMaterial() {
        return new THREE.MeshLambertMaterial()
    }

    /**
     * MeshMatcapMaterial 由一个材质捕捉（MatCap，或光照球（Lit Sphere））纹理所定义，其编码了材质的颜色与明暗。
     * @returns {*}
     * @constructor
     */
    MeshMatcapMaterial() {
        return new THREE.MeshMatcapMaterial()
    }

    /**
     * 一种把法向量映射到RGB颜色的材质
     * @constructor
     */
    MeshNormalMaterial() {
        return new THREE.MeshNormalMaterial()
    }

    /**
     *  一种用于具有镜面高光的光泽表面的材质。
     * @returns {THREE.MeshPhongMaterial}
     * @constructor
     */
    MeshPhongMaterial() {
        return new THREE.MeshPhongMaterial()
    }

    /**
     * 物理网格材质
     * @constructor
     */
    MeshPhysicalMaterial() {
        return new THREE.MeshPhysicalMaterial()
    }

    /**
     * 标准网格材质
     * @constructor
     */
    MeshStandardMaterial() {
        return new THREE.MeshStandardMaterial()
    }

    /**
     * 卡通材质
     * @constructor
     */
    MeshToonMaterial() {
        return new THREE.MeshToonMaterial()
    }

    /**
     * 材质加载器
     * @constructor
     */
    MaterialLoader() {
        // 初始化一个加载器
        var loader = new THREE.MaterialLoader();

        // 加载资源
        loader.load(
            // 资源URL
            'path/to/material.json',

            // onLoad回调
            function (material) {
                object.material = material;
            },

            // onProgress回调
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },

            // onError回调
            function (err) {
                console.log('An error happened');
            }
        );
    }

    /**
     * 销毁
     */
    destroy() {

    }

    initNameList() {
        this.nameList = [
            // 'LineBasicMaterial',
            // 'LineDashedMaterial',
            // 'PointsMaterial',
            // 'ShaderMaterial',
            // 'ShadowMaterial',
            // 'SpriteMaterial',
            // 'RawShaderMaterial',
            'MeshBasicMaterial',
            'MeshDepthMaterial',
            'MeshDistanceMaterial',
            'MeshLambertMaterial',
            'MeshMatcapMaterial',
            'MeshNormalMaterial',
            'MeshPhongMaterial',
            'MeshPhysicalMaterial',
            'MeshStandardMaterial',
            'MeshToonMaterial'
        ]
    }

}

