import * as THREE from "three";

export class MakeMeshPoint {
    constructor(app) {
        this.app = app
        this.Geometry = null
    }

    start() {
        this.makeGeometry()
    }

    makeGeometry() {
        function CustomSinCurve(scale) {

            THREE.Curve.call(this);

            this.scale = (scale === undefined) ? 1 : scale;

        }

        CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
        CustomSinCurve.prototype.constructor = CustomSinCurve;

        CustomSinCurve.prototype.getPoint = function (t) {

            const tx = t * 3 - 1.5;
            const ty = Math.sin(2 * Math.PI * t);
            const tz = 0;

            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

        };

        const path = new CustomSinCurve(10);
        const geometry = new THREE.TubeGeometry(path, 20, 2, 8, false);
        // const materials = new THREE.MeshBasicMaterial({color: 0x00ff00});
        const material = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 5.0 //点对象像素尺寸
        }); //材质对象
        const mesh = new THREE.Points(geometry, material);
        this.app.scene.add(mesh);
    }


}
