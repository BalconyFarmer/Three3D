export class ExportImport {
    constructor(app) {
        this.app = app
    }

    /**
     * scene 导出器  -> JSON -> scene
     */
    sceneExporter() {
        if (this.scene) {
            const result = this.scene.toJSON()
            const resultString = JSON.stringify(result)
            localStorage.setItem("sceneJson", resultString);
        }
    }

    /**
     * scene 加载器
     */
    sceneLoader() {
        const json = localStorage.getItem("sceneJson");   // json字符串
        if (json) {
            const loadedScene = JSON.parse(json);          // json对象
            const loader = new THREE.ObjectLoader();
            const loaderScene = loader.parse(loadedScene)
            this.scene.add(loaderScene);
            this.onRender()
        }
    }


    /**
     * mesh导出
     * @param mesh
     */
    meshExporter(mesh) {
        if (mesh) {
            const result = mesh.toJSON()
            const _resultObj = JSON.stringify(result)
            localStorage.setItem("json", _resultObj);
        } else if (this._testMeshExport) {
            const result = this._testMeshExport.toJSON()
            const _resultObj = JSON.stringify(result)
            localStorage.setItem("json", _resultObj);
        }
    }

    /**
     * 加载器 mesh -> JSON -> mesh
     */
    meshLoader() {
        const json = localStorage.getItem("json");   // json字符串
        if (json) {
            const loadedGeometry = JSON.parse(json);          // json对象
            const loader = new THREE.ObjectLoader();
            const loaderMesh = loader.parse(loadedGeometry)
            loaderMesh.position.x -= 150;
            this.scene.add(loaderMesh);
            this.onRender()
        }
    }

    /**
     * 添加测试geo
     */
    addGeo() {
        //geo -> Material -> mesh
        const geometry = new THREE.BoxGeometry(100, 100, 100); //创建一个立方体几何对象Geometry
        const material = new THREE.MeshLambertMaterial({
            color: 0x0000ff
        });
        const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        this.scene.add(mesh); //网格模型添加到场景中
        this.onRender()
        this._testMeshExport = mesh
    }

    localStorageTest() {
        for (const key in localStorage) {
            console.log(key + '---' + localStorage[key])
        }
    }
}
