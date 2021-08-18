import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";

/**
 * 加载obj文件类
 * 先加载材质,再加载obj
 */
export class ImportObj {
    constructor(app) {
        this.app = app
        this.mesh = null
        this.meshPromise = null
        this.OBJurl = null
        this.MTLurl = null
        this.OBJLoaderer = new OBJLoader();
        this.MTLLoaderer = new MTLLoader();
    }

    loadOBJ(url, name, position) {
        this.OBJurl = url
        this.MTLurl = url.replace('.obj', '.mtl')
        this.loadMTL()
        if (position && name) {
            this.position = position
            this.name = name
        }
    }

    loadMTL() {
        function onLoadMaterial(material) {
            if (material) {
                this.OBJLoaderer.setMaterials(material)
            }
            this._loadOBJModel()
        }

        this.MTLLoaderer.load(this.MTLurl, onLoadMaterial.bind(this))
    }

    _loadOBJModel(url) {
        // 加载成功执行
        function callbackOnLoad(object3d) {
            this.app.scene.add(object3d)
            this.app.onRender()
            this.mesh = object3d
            if (this.func) {
                this.func(object3d)
            }
            if (this.position) {
                object3d.position = this.position
            }
            if (this.name) {
                object3d.cname = this.name
            }
        }

        // 加载错误处理
        function errorHandler(error) {
            console.log('An error happened', error);
        }

        // 加载进度回调
        function progress(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded' + 'OBJ加载完成!');
        }

        if (this.OBJurl) {
            this.OBJLoaderer.load(this.OBJurl, callbackOnLoad.bind(this), progress, errorHandler);
        } else {
            console.log('请输入正确的url')
        }
    }

    loadOver(func) {
        this.func = func
    }

}
