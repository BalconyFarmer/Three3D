import * as CANNON from 'cannon'
import * as THREE from "three";

export class PhysiSimulate {
    constructor(app) {
        this.app = app
    }

    // 添加重力 添加球 添加阻挡平面
    init() {
        let world = new CANNON.World() // 负责管理对象和模拟物理的中心
        world.gravity.set(0, -10, 0)   // 接着设置物理世界的重力，这里设置了负 Y 轴为 10 m/s²
        // Cannon.js 提供了 Broadphase、NaiveBroadphase 两种碰撞检测阶段，默认是 NaiveBroadphase。
        world.broadphase = new CANNON.NaiveBroadphase()

        let sphereShape = new CANNON.Sphere(1)  // Step 1 创建形状
        let sphereBody = new CANNON.Body({      // Step 2 为形状添加刚体
            mass: 5,
            position: new CANNON.Vec3(0, 10, 0),
            shape: sphereShape
        })
        world.add(sphereBody) // Step 3 将刚体添加到世界

        // 平面 Body
        let groundShape = new CANNON.Plane()
        let groundBody = new CANNON.Body({
            mass: 0,
            shape: groundShape
        })
        // setFromAxisAngle 旋转 X 轴 -90 度
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -1.5707963267948966)
        world.add(groundBody)

        // 球网格
        let sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
        let sphereMaterial = new THREE.MeshStandardMaterial({color: 0xffff00})
        let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        this.app.scene.add(sphere)

        function update() {
            requestAnimationFrame(update)
            world.step(1 / 60)
            if (sphere) {
                sphere.position.copy(sphereBody.position)
                sphere.quaternion.copy(sphereBody.quaternion)
            }
        }

        update()
    }
}
