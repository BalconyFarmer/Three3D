import * as THREE from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

export class ImportFBX {
    constructor(app) {
        this.app = app
        // obj作为参数创建一个混合器，解析播放obj及其子对象包含的动画数据
        this.mixer = null
        this.url = null
    }

    loadFBX(url, position, scale) {
        const self = this
        this.url = url
        var loader = new FBXLoader();//创建一个FBX加载器

        if (this.url) {
            loader.load(this.url, function (obj) {
                self.app.scene.add(obj)
                // obj.translateY(-80);
                if (position) {
                    obj.position.set(position.x, position.y, position.z);
                }
                if (scale) {
                    obj.scale.set(scale.x, scale.y, scale.z);
                }

                self.mixer = new THREE.AnimationMixer(obj);

                // 查看动画数据
                console.log(obj.animations)
                // obj.animations[0]：获得剪辑对象clip
                var AnimationAction = self.mixer.clipAction(obj.animations[0]);
                // AnimationAction.timeScale = 1; //默认1，可以调节播放速度
                // AnimationAction.loop = THREE.LoopOnce; //不循环播放
                // AnimationAction.clampWhenFinished=true;//暂停在最后一帧播放的状态
                AnimationAction.play();//播放动画
                self.addLoopQuene.bind(self)()
            })
        }

    }

    addLoopQuene() {
        const self = this
        this.app.renderQueue.push(
            function updateFBX() {
                if (self.mixer) {
                    // 更新混合器相关的时间
                    self.mixer.update(self.app.clock.getDelta()); // 两帧的时间间隔
                }
            }
        )
    }
}
