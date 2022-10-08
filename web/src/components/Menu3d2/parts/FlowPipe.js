import * as THREE from 'three'

const serverAdress = 'http://localhost:1111'

export class FlowPipe {
    constructor(app, linePoints) {
        this.app = app;
        this.mesh;
        this.texture;
        this.redius = 5 // 半径
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

    add(data, direction) {
        const self = this
        let textureTest = new THREE.TextureLoader().load(require('./run.png')); // 流动材质 找一个酷炫点的图~

        // 流动线
        let arr = [data];

        setCurve(arr, 0.5, textureTest);

        function setCurve(arr, radius, texture = textureTest) {
            let curveObj = {}, points;
            let tubeMaterial, tubeGeometry, tubeArr = [];

            for (let i = 0; i < arr.length; i++) {
                points = [];
                for (let j = 0; j < arr[i].length; j++) {
                    points.push(new THREE.Vector3(arr[i][j][0], arr[i][j][1], arr[i][j][2]));
                }
                let curve = curveObj['curve-' + i];
                curve = new THREE.CatmullRomCurve3(points, false); /* 是否闭合 */
                tubeGeometry = new THREE.TubeGeometry(curve, 1, radius, 300, false); // path, tubularSegments, radius, radiusSegments, closed

                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(20, 1);
                tubeMaterial = new THREE.MeshPhongMaterial({
                    map: texture,
                    transparent: true
                });

                tubeArr[i] = new THREE.Mesh(tubeGeometry, tubeMaterial);
            }

            self.app.scene.add(...tubeArr);
        }

        render();

        function render() {
            if (direction) {
                textureTest.offset.x -= 0.006; // 设置偏移
            } else {
                textureTest.offset.x += 0.006; // 设置偏移
            }
            requestAnimationFrame(render);
        }
    }
}
