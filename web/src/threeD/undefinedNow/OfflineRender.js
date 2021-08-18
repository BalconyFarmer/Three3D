import * as THREE from "three";

/**
 * 超过15个实例会报错
 */
export class OfflineRender {
    constructor(app) {
        this.app = app
    }

    start() {
        for (let i = 0; i < 5; i++) {
            const a = new OfflineRenderGo(this.app)
        }
    }

}


export class OfflineRenderGo {
    constructor(app) {
        this.app = app

        this.RT_SIZE = 300
        this.Renderer = null
        this.RenderTarget = null
        this.dom = null
        this.mesh = null
        this.RTScene = null
        this.Camera = null

        this.initHide3d()
        this.appendCanvas()
        this.addLoop()
    }

    initHide3d() {
        this.RenderTarget = new THREE.WebGLRenderTarget(this.RT_SIZE, this.RT_SIZE);

        function initScene() {
            this.RTScene = new THREE.Scene();
            const backgroundColor = new THREE.Color(0x00ffff)
            this.RTScene.background = backgroundColor
        }

        initScene.bind(this)()

        function initCamera() {
            const k = this.RT_SIZE / this.RT_SIZE;
            const s = 20;
            this.Camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
            this.Camera.position.set(20, 30, 20);
            let positionAdjust = new THREE.Vector3()
            positionAdjust = this.RTScene.position.clone()
            this.Camera.lookAt(positionAdjust);
        }

        initCamera.bind(this)()

        function initLight() {
            const RTLight = new THREE.DirectionalLight(0xffffff, 1.5);
            RTLight.position.set(0, 1, 1).normalize();
            this.RTScene.add(RTLight);
        }

        initLight.bind(this)()

        function addMesh() {
            // 向场景添加环面
            const geometryTorus = new THREE.ConeGeometry(5, 30, 32);
            // 使用红色的材质
            const materialTorus = new THREE.MeshLambertMaterial({color: 0xff0000});
            this.mesh = new THREE.Mesh(geometryTorus, materialTorus);
            this.RTScene.add(this.mesh);

            this.Renderer = new THREE.WebGLRenderer({
                antialias: true // 开启消除锯齿
            });
            this.Renderer.setPixelRatio(window.devicePixelRatio); // 设置屏幕像素比
            this.Renderer.setSize(window.innerWidth, window.innerHeight);
            this.Renderer.setRenderTarget(this.RenderTarget);
        }

        addMesh.bind(this)()

    }

    appendCanvas() {
        const previewContainer = document.getElementById('previewContainer');
        let previewCanvas = document.createElement('canvas')
        previewCanvas.width = 300
        previewCanvas.height = 300
        this.ctx = previewCanvas.getContext('2d');
        previewContainer.appendChild(previewCanvas)
    }

    addLoop() {
        const self = this
        this.app.renderQueue.push(
            function offlineRender() {
                self.mesh.rotateZ(0.01)
                self.Renderer.clear();
                self.Renderer.render(self.RTScene, self.Camera);

                let buffer = new Uint8Array(self.RT_SIZE * self.RT_SIZE * 4);
                self.Renderer.readRenderTargetPixels(self.RenderTarget, 0, 0, self.RT_SIZE, self.RT_SIZE, buffer);          // 读取像素到 buffer
                const clamped = new Uint8ClampedArray(buffer.buffer);
                const imageData = new ImageData(clamped, self.RT_SIZE, self.RT_SIZE);                                       // 创建可供 canvas 使用的图像数据类型
                self.ctx.putImageData(imageData, 0, 0);                                                                     // 绘制到 canvas 中
            }
        )
    }
}
