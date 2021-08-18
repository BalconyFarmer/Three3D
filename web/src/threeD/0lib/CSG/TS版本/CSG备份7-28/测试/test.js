// 正常
function makeCSGCube() {
    return VISION.CSG.cube();
}

// 报错 无法运行
function makeRoundedCube() {
    return VISION.CSG.roundedCube({
        start: [0, -1, 0],
        end: [0, 1, 0],
        radius: 1,
        resolution: 16
    })
}

// 正常
function mekeCSGSphere() {
    return VISION.CSG.sphere({radius: 1.3});
}

// 正常
function mekeCSGCylinder() {
    return VISION.CSG.cylinder()
}

// 正常
function makeRoundedCylinder() {
    return VISION.CSG.roundedCylinder()
}

// 正常
function mekePolyhedron() {
    return VISION.CSG.polyhedron()
}

function toGeometryTest() {
    const polyhedron = VISION.VISION.CSG.polyhedron()
    const geo = VISION.VISION.CSG.toGeometry(polyhedron)
    debugger
}

// toGeometryTest() // -> 结果好像正确,原引擎数据出现NaN

function fromGeometryTest() {
    // const geoA = VISION.BoxGeometryBuilder.build(10, 10, 10)
    const polyhedron = VISION.VISION.CSG.polyhedron()
    const geo = VISION.VISION.CSG.toGeometry(polyhedron)
    const bspA = VISION.VISION.CSG.fromGeometry(geo)
    debugger
}

// fromGeometryTest() // -> 看起来正确

function invtertTest() {
    const polyhedron = VISION.VISION.CSG.polyhedron()
    const result = polyhedron.invert()
    debugger
}

// invtertTest() // -> 正确

function unionTest() {
    const polyhedron = VISION.VISION.CSG.polyhedron()
    const cube = VISION.VISION.CSG.cube()
    const result = polyhedron.union(cube)
    debugger
}

// unionTest() // -> 正确

function subtractTest() {
    const polyhedron = VISION.VISION.CSG.polyhedron()
    const cube = VISION.VISION.CSG.cube()
    const result = polyhedron.subtract(cube)
    debugger
}

// subtractTest()

function intersectTest() {
    const polyhedron = VISION.VISION.CSG.polyhedron()
    const cube = VISION.VISION.CSG.cube()
    const result = polyhedron.intersect(cube)
    debugger
}

// intersectTest()
