import * as THREE from "three";
import {ThreeBSP} from 'three-js-csg-es6'
import {CSG} from '../0lib/CSG/CSG'
import {VerticesViewer} from '../helpers/representationalviewer/verticesViewer'

export class BSPCalculate {
    constructor(app) {
        this.app = app
    }

    /**
     * testBSP 测试
     */
    startTestBSP() {
        // this.makeCSGCube()
        // this.makeRoundedCube()
        // this.mekeCSGSphere()
        // this.mekeCSGCylinder()
        // this.makeRoundedCylinder()
        // this.mekePolyhedron()

        this.unionTest()
        // this.subtractTest()
        // this.intersectTest()
        // this.invtertTest()

        // this.toGeometryTest()
        // this.fromGeometryTest()
        // this.fromMeshToMeshTest()

        // this.fromBufferGeometryToView()
    }

    makeCSGCube() {
        const cubeCSG = CSG.cube()
        const cubeGeometry = CSG.toGeometry(cubeCSG)
        const cubeMaterial = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
        this.app.scene.add(cubeMesh)
        return cubeCSG;
    }

    makeRoundedCube() {
        const roundCubeCSG = CSG.roundedCube({
            start: [0, -1, 0],
            end: [0, 1, 0],
            radius: 1,
            resolution: 16
        })
        const roundCubeGeometry = CSG.toGeometry(roundCubeCSG)
        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const roundCubeMesh = new THREE.Mesh(roundCubeGeometry, Material)
        roundCubeMesh.translateZ(10)
        this.app.scene.add(roundCubeMesh)
        return roundCubeCSG;
    }

    mekeCSGSphere() {
        const sphereCSG = CSG.sphere({radius: 1.3});
        const sphereGeometry = CSG.toGeometry(sphereCSG)
        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const sphereMesh = new THREE.Mesh(sphereGeometry, Material)
        sphereMesh.translateZ(20)
        this.app.scene.add(sphereMesh)
        return sphereCSG
    }

    mekeCSGCylinder() {
        const cylinderCSG = CSG.cylinder()
        const cylinderGeometry = CSG.toGeometry(cylinderCSG)
        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, Material)
        cylinderMesh.translateZ(30)
        this.app.scene.add(cylinderMesh)
        return cylinderCSG
    }

    makeRoundedCylinder() {
        const cylinderCSG = CSG.roundedCylinder()
        const cylinderGeometry = CSG.toGeometry(cylinderCSG)
        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, Material)
        cylinderMesh.translateZ(40)
        this.app.scene.add(cylinderMesh)
        return cylinderCSG
    }

    mekePolyhedron() {
        const cylinderCSG = CSG.polyhedron()
        const cylinderGeometry = CSG.toGeometry(cylinderCSG)
        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, Material)
        cylinderMesh.translateZ(50)
        this.app.scene.add(cylinderMesh)
        return cylinderCSG
    }

    unionTest() {
        const sphereCSG = CSG.sphere({radius: 1.3});
        const cylinderCSG = CSG.roundedCylinder()
        const result = sphereCSG.union(cylinderCSG)
        const Geometry = CSG.toGeometry(result)

        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const cylinderMesh = new THREE.Mesh(Geometry, Material)
        cylinderMesh.translateX(10)
        this.app.scene.add(cylinderMesh)
        return result
    }

    subtractTest() {
        const Sphere = this.mekeCSGSphere()
        const cube = CSG.cube()
        const result = cube.subtract(Sphere)

        const Geometry = CSG.toGeometry(result)

        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const cylinderMesh = new THREE.Mesh(Geometry, Material)
        cylinderMesh.translateX(20)
        this.app.scene.add(cylinderMesh)
        return result
    }

    intersectTest() {
        const Sphere = this.mekeCSGSphere()
        const cube = CSG.cube()
        const result = cube.intersect(Sphere)

        const Geometry = CSG.toGeometry(result)

        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide});
        const cylinderMesh = new THREE.Mesh(Geometry, Material)
        cylinderMesh.translateX(30)
        this.app.scene.add(cylinderMesh)
        return result
    }

    invtertTest() {
        const polyhedron = CSG.polyhedron()
        const result = polyhedron.invert()

        const Geometry = CSG.toGeometry(result)

        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide})
        const cylinderMesh = new THREE.Mesh(Geometry, Material)
        cylinderMesh.translateX(40)
        this.app.scene.add(cylinderMesh)
        return result
    }

    toGeometryTest() { // bufferGeometry
        const polyhedron = CSG.polyhedron()
        const geo = CSG.toBufferGeometry(polyhedron)
        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide})
        const cylinderMesh = new THREE.Mesh(geo, Material)
        cylinderMesh.translateY(20)
        this.app.scene.add(cylinderMesh)
        return geo
    }

    fromGeometryTest() {
        const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        const bspA = CSG.fromBufferGeometry(geometry)
        const Geometry = CSG.toGeometry(bspA)
        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide})
        const cylinderMesh = new THREE.Mesh(Geometry, Material)
        cylinderMesh.translateY(30)
        this.app.scene.add(cylinderMesh)
        return cylinderMesh
    }

    fromMeshToMeshTest() {
        const mesh = this.fromGeometryTest()
        const resultCSG = CSG.fromMesh(mesh)
        const resultMesh = CSG.toMesh(resultCSG, mesh.material)
        resultMesh.translateY(40)
        this.app.scene.add(resultMesh)
    }

    fromBufferGeometryToView() {
        // const Geometry = new THREE.ConeBufferGeometry( 5, 20, 3 );
        const Geometry = new THREE.BoxBufferGeometry(100, 100, 100);

        VerticesViewer.showVertices(Geometry.attributes.normal.array, this.app)
        VerticesViewer.showVertices(Geometry.attributes.position.array, this.app)

        const bspA = CSG.fromBufferGeometry(Geometry)
        const _Geometry = CSG.toGeometry(bspA)

        const Material = new THREE.MeshStandardMaterial({color: 0x00cc00, side: THREE.DoubleSide})
        const cylinderMesh = new THREE.Mesh(_Geometry, Material)

        this.app.scene.add(cylinderMesh)
    }

}
