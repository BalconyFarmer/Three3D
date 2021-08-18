import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {FirstPersonControls} from "./FirstPersonControls";

export class Controls {
    constructor(app) {
        this.app = app
        this.controller = new OrbitControls(this.app.camera, this.app.renderer.domElement);
        this.firstPersonControls = null
        this._updateAutoRun = this.updateAutoRun
    }

    /**
     * 开启自动旋转
     * @param speed
     */
    startAutoRun(speed) {
        this.controller.autoRotate = true       // 开启自动旋转 .update()
        this.controller.autoRotateSpeed = speed || 10   // 移动速度

        // this.controller.dampingFactor = true     // 阻尼惯性 .update()
        // this.controller.enableDamping = true      // 重力惯性

        const self = this
        this.app.renderQueue.push(
            function updateAutoRun() {
                self.controller.update(self.app.clock.getDelta());//更新时间
            }
        )
    }

    /**
     * 停止自动旋转
     */
    stopAutoRun() {
        this.controller.autoRotate = false
        this.app.removeFromQueue('updateAutoRun')
    }

    /**
     * 旋转限度
     * @param minAzimuthAngle
     * @param maxAzimuthAngle
     * @param minPolarAngle
     * @param maxPolarAngle
     * @param minDistance
     * @param maxDistance
     */
    setLimit(minAzimuthAngle, maxAzimuthAngle, minPolarAngle, maxPolarAngle, minDistance, maxDistance) {

        const _minAzimuthAngle = minAzimuthAngle || 0
        const _maxAzimuthAngle = maxAzimuthAngle || Math.PI / 2
        const _minPolarAngle = minPolarAngle || 0
        const _maxPolarAngle = maxPolarAngle || Math.PI / 2
        const _minDistance = minDistance || 10
        const _maxDistance = maxDistance || 100

        this.controller.minAzimuthAngle = _minAzimuthAngle
        this.controller.maxAzimuthAngle = _maxAzimuthAngle

        this.controller.minPolarAngle = _minPolarAngle
        this.controller.maxPolarAngle = _maxPolarAngle

        this.controller.minDistance = _minDistance
        this.controller.maxDistance = _maxDistance
    }

    /**
     * 启动轨道相机控制器
     */
    startOrbitControls() {
        this.controller.enabled = true

        this.stopFirstPersonControls()

        this.controller.reset()

    }

    stopOrbitControls() {
        this.controller.enabled = false
        this.controller.saveState()
    }

    /**
     * 启动第一人称相机控制器
     * @param personalControlPosition
     * @param lookPosition
     */
    startFirstPersonControls(personalControlPosition, lookPosition) {
        this.stopOrbitControls()
        this.stopAutoRun()
        this.firstPersonControls = new FirstPersonControls(this.app, personalControlPosition, lookPosition)
    }

    /**
     * 停止第一人称相机控制器
     */
    stopFirstPersonControls() {
        this.firstPersonControls.destroy()
        this.firstPersonControls = null
    }

    /**
     *  移除所有监听事件
     */
    disposeOrbitControlsEvent() {
        this.controller.dispose()
    }

}
