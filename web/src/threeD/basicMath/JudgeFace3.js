import * as THREE from "three";
import {Helper} from '../helpers/Helper'

export class JudgeFace3 {
    constructor(app) {
        this.app = app
        this.plane = null
    }

    init() {
        this.judgePosint()
    }

    judgePosint() {
        const awaitPoint = new THREE.Vector3(-13, -13, -13);
        Helper.addVerticHelper(awaitPoint.x, awaitPoint.y, awaitPoint.z, 2, this.app.scene)

        const planeNormal = new THREE.Vector3(0, 1, 0)
        const w = -10
        const awaitPlane = new THREE.Plane(planeNormal, w)
        Helper.addPlaneHelper(awaitPlane, 10, this.app.scene)
        this.app.arrowLine.showArrowLine(planeNormal.clone(), new THREE.Vector3(10, 10, 10))

        let stayPoint = new THREE.Vector3()
        awaitPlane.projectPoint(awaitPoint, stayPoint)
        Helper.addVerticHelper(stayPoint.x, stayPoint.y, stayPoint.z, 2, this.app.scene)

        const stayToAwait = awaitPoint.clone().sub(stayPoint.clone())
        stayToAwait.normalize()
        // this.app.arrowLine.showArrowLine(stayToAwait.clone(), stayPoint.clone())

        const v1 = stayToAwait.clone().normalize().round()
        const v2 = planeNormal.clone().normalize().round()
        if (v1.equals(v2)) {
            console.log('front')
        } else {
            console.log('back')
        }
    }
}
