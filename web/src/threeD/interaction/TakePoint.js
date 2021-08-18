import {RaycasterHelper} from './RaycasterHelper'

/**
 * 点击打印坐标
 */
export class TakePoint extends RaycasterHelper {
    constructor(app) {
        super(app);
    }

    start() {
        this.startRaycast()
        const self = this
        this.atSelectMesh(function (mesh) {
            console.warn('拾取点坐标:', parseInt(self.point.x), parseInt(self.point.y), parseInt(self.point.z))
        })
    }

    stop() {
        this.stopRaycast()
    }
}
