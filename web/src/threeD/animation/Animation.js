import * as THREE from "three";

export class Animation {
    constructor(app) {
        this.app = app
        this.group = null
        this.clip = null
        this.mixer = null

        this.timeScale = 1
        this.meshName = '警车'
        this.mesh = null
        this.time = null
        this.position = null
        this.rotationTime = null
        this.rotationPosition = null
    }

    start(mesh, time, position, rotationTime, rotationPosition) {
        this.mesh = mesh
        this.time = time
        this.position = position
        if (rotationTime && rotationPosition) {
            this.rotationTime = rotationTime
            this.rotationPosition = rotationPosition
        }
        this.makeGroup()
    }

    makeGroup() {
        const self = this
        const loader = this.app.objLoaders.loadOBJ(this.mesh, this.meshName)
        loader.loadOver(function (mesh) {
            self.group = mesh
            self.group.name = this.meshName
            self.makeAnimationData.bind(self)()
            self.makePlayer()
            self.addRenderQueue()
        })
    }

    makeAnimationData() {
        const duration = Math.max(...this.time);
        const posTrack = new THREE.KeyframeTrack(`${this.meshName}.position`, this.time, this.position);
        const tracks = [posTrack]
        if (this.rotationTime) {
            const rotationTrack = new THREE.QuaternionKeyframeTrack(`${this.meshName}.quaternion`, this.rotationTime, this.rotationPosition);
            tracks.push(rotationTrack)
        }
        this.clip = new THREE.AnimationClip("default", duration, tracks);
    }

    makePlayer() {
        this.mixer = new THREE.AnimationMixer(this.group);
        const AnimationAction = this.mixer.clipAction(this.clip);
        AnimationAction.timeScale = this.timeScale;
        // AnimationAction.loop = THREE.LoopOnce; //不循环播放
        AnimationAction.play();//开始播放
    }

    addRenderQueue() {
        // 创建一个时钟对象Clock
        const clock = new THREE.Clock();
        const self = this
        this.app.renderQueue.push(
            function updateStats() {
                if (self.mixer) {
                    self.mixer.update(clock.getDelta());
                }
            }
        )
    }

    parse() {

    }

    toJSON(JSON) {

    }

}
