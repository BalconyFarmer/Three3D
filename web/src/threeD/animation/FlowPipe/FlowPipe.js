import * as THREE from 'three'
import {serverAdress} from '@/config';

export class FlowPipe {
    constructor(app, linePoints) {
        this.app = app;
        this.mesh;
        this.texture;
        this.redius = 1 // 半径
        this.direction = true
        // 点位
        this.linePoints = linePoints || [new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 100, 100), new THREE.Vector3(100, 100, 0), new THREE.Vector3(200, 200, 200)]
    }

    creat() {
        let self = this;

        const CurvePath = new THREE.CurvePath();

        this.linePoints.forEach((item, index) => {
            if (index < this.linePoints.length - 1) {
                const line = new THREE.LineCurve3(item, this.linePoints[index + 1])
                CurvePath.curves.push(line)
            }
        })

        const geometry = new THREE.TubeGeometry(CurvePath, 100, this.redius, 25, false);

        let textureLoader = new THREE.TextureLoader();
        this.texture = textureLoader.load(serverAdress + '/3Dstatic/model3D/run.png');
        this.texture.wrapS = THREE.RepeatWrapping
        this.texture.wrapT = THREE.RepeatWrapping
        // this.texture.rotation = Math.PI / 2;
        this.texture.repeat.x = 20;

        let material = new THREE.MeshPhongMaterial({
            map: this.texture,
            transparent: true,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.app.scene.add(this.mesh)
        this.mesh.cname = '流动管道'

        this.app.renderQueue.push(
            function () {
                if (self.texture) {
                    if (self.direction) {
                        self.texture.offset.x += 0.01
                    } else {
                        self.texture.offset.x -= 0.01
                    }
                }
            }
        )
    }
}
