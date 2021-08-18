import {CSGProperties} from './CSGProperties'
import {CSGMatrix4x4} from './CSGMatrix4x4'
import {CSGVector3D} from './CSGVector3D'
import {CSGVertex} from './CSGVertex'
import {CSGPolygon} from './CSGPolygon'
import {CSGTree} from './CSGTree'
import {CSGFuzzyCSGFactory} from './CSGFuzzyCSGFactory'
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis'
import {CSGVector2D} from './CSGVector2D'
import {CSGLine2D} from './CSGLine2D'
import {CSGConnector} from './CSGConnector'
import {CSGPlane} from './CSGPlane';
import {CAG} from "./CAG";

import * as THREE from 'three'

const Face3 = THREE.Face3
const Geometry = THREE.Geometry
const Vector3 = THREE.Vector3
const BufferGeometry = THREE.BufferGeometry
const Mesh = THREE.Mesh

function insertSorted(array, element, comparefunc) {
    var leftbound = 0;
    var rightbound = array.length;
    while (rightbound > leftbound) {
        var testindex = Math.floor((leftbound + rightbound) / 2);
        var testelement = array[testindex];
        var compareresult = comparefunc(element, testelement);
        if (compareresult > 0) {
            // element > testelement
            leftbound = testindex + 1;
        } else {
            rightbound = testindex;
        }
    }
    array.splice(leftbound, 0, element);
}

function fnNumberSort(a, b) {
    return a - b;
}

var CSG = function () {
    this.polygons = [];
    this.properties = new CSGProperties();
    this.isCanonicalized = true;
    this.isRetesselated = true;
};

CSG.staticTag = 1;

CSG.Vector3D = CSGVector3D

CSG.Plane = CSGPlane

CSG.Matrix4x4 = CSGMatrix4x4

CSG.defaultResolution2D = 32;

CSG.defaultResolution3D = 12;

CSG.fromBufferGeometry = function (geometry, matrix) {
    geometry = geometry.toNonIndexed();

    var position = geometry.attributes.position;

    var i;
    var j;
    var n;
    var pos;
    var polygon;
    var polygons = [];

    for (i = 0; i < position.count / 3; ++i) {
        var vertices = [];

        for (j = 0; j < 3; ++j) {
            n = i * 3 + j;
            pos = new CSGVector3D(position.getX(n), position.getY(n), position.getZ(n));
            vertices.push(new CSGVertex(pos));
        }

        polygon = new CSGPolygon(vertices);
        polygon.checkIfConvex();
        polygons.push(polygon);
    }

    var csg = CSG.fromPolygons(polygons);
    if (matrix !== undefined) {
        var mat4 = new CSGMatrix4x4(matrix.clone().elements);
        csg = csg.transform(mat4);
    }
    return csg;
};

CSG.fromGeometry = function (geometry, matrix) {
    var polygons = [];

    for (var i = 0; i < geometry.faces.length; i++) {
        var face = geometry.faces[i];
        var pos;
        var vertex;
        var vertices = [];
        var polygon;

        if (face instanceof Face3) {
            vertex = geometry.vertices[face.a];
            pos = new CSGVector3D(vertex.x, vertex.y, vertex.z);
            vertices.push(new CSGVertex(pos));

            vertex = geometry.vertices[face.b];
            pos = new CSGVector3D(vertex.x, vertex.y, vertex.z);
            vertices.push(new CSGVertex(pos));

            vertex = geometry.vertices[face.c];
            pos = new CSGVector3D(vertex.x, vertex.y, vertex.z);
            vertices.push(new CSGVertex(pos));
        } else {
            throw `Invalid face type at index ${i}`;
        }

        polygon = new CSGPolygon(vertices);
        polygon.checkIfConvex(); // throw a error if not convex
        polygons.push(polygon);
    }

    var csg = CSG.fromPolygons(polygons);
    if (matrix !== undefined) {
        var mat4 = new CSGMatrix4x4(matrix.clone().elements);
        csg = csg.transform(mat4);
    }
    return csg;
};

CSG.fromMesh = function (mesh) {
    mesh.updateMatrix();
    this.matrix = new CSGMatrix4x4(mesh.matrix.clone().elements);
    var _geometry;
    if (mesh.geometry instanceof BufferGeometry) {
        _geometry = new Geometry().fromBufferGeometry(mesh.geometry);
    } else {
        _geometry = mesh.geometry;
    }
    var csg = CSG.fromGeometry(_geometry);
    return csg.transform(this.matrix);
};

CSG.toBufferGeometry = function (csg, matrix, outGeometry = new THREE.BufferGeometry()) {

    function getGeometryVertex(vertices, vertex_position) {
        var temp = new Vector3(vertex_position.x, vertex_position.y, vertex_position.z);
        vertices.push(temp);
        return vertices.length - 1;
    }

    if (matrix !== undefined) {
        var mat4 = new CSGMatrix4x4(matrix.clone().elements);
        csg = csg.transform(mat4);
    }

    var polygons = csg.toPolygons();

    var allvertices = [];
    var positions = [];
    var normals = [];

    polygons.forEach(function (polygon) {
        var vertices = polygon.vertices.map(vertex => getGeometryVertex(allvertices, vertex.pos), this);

        if (vertices[0] === vertices[vertices.length - 1]) {
            vertices.pop();
        }

        for (let i = 2; i < vertices.length; i++) {
            positions.push(
                allvertices[vertices[0]].x, allvertices[vertices[0]].y, allvertices[vertices[0]].z,
                allvertices[vertices[i - 1]].x, allvertices[vertices[i - 1]].y, allvertices[vertices[i - 1]].z,
                allvertices[vertices[i]].x, allvertices[vertices[i]].y, allvertices[vertices[i]].z
            );

            normals.push(
                polygon.plane.normal.x, polygon.plane.normal.y, polygon.plane.normal.z,
                polygon.plane.normal.x, polygon.plane.normal.y, polygon.plane.normal.z,
                polygon.plane.normal.x, polygon.plane.normal.y, polygon.plane.normal.z
            );
        }
    }, this);
    // outGeometry.setFromVertices(positions, normals);  // TODO
    const _positions = new Float32Array(positions)
    const attribuePositions = new THREE.BufferAttribute(_positions, 3);
    outGeometry.attributes.position = attribuePositions

    const _normals = new Float32Array(normals)
    const attribueNormals = new THREE.BufferAttribute(_normals, 3);
    outGeometry.attributes.normal = attribueNormals

    return outGeometry;
};

CSG.toGeometry = function (csg, matrix, outGeometry = new Geometry()) {

    function getGeometryVertex(geometry, vertex_position) {
        geometry.vertices.push(new Vector3(vertex_position.x, vertex_position.y, vertex_position.z));

        return geometry.vertices.length - 1;
    }

    if (matrix !== undefined) {
        var mat4 = new CSGMatrix4x4(matrix.clone().elements);
        csg = csg.transform(mat4);
    }

    var face;
    var polygons = csg.toPolygons();

    polygons.forEach(function (polygon) {
        var vertices = polygon.vertices.map(vertex => getGeometryVertex(outGeometry, vertex.pos), this);

        if (vertices[0] === vertices[vertices.length - 1]) {
            vertices.pop();
        }

        for (let i = 2; i < vertices.length; i++) {
            face = new Face3(vertices[0], vertices[i - 1], vertices[i], new Vector3().copy(polygon.plane.normal));
            outGeometry.faces.push(face);
        }
    }, this);

    return outGeometry;
};

// convert CSG object to three.js object.
CSG.toMesh = function (csg, material, outMesh = new Mesh()) {
    outMesh.geometry = CSG.toBufferGeometry(csg, undefined, outMesh.geometry);
    outMesh.material = material;
    return outMesh;
};

CSG.fromPolygons = function (polygons) {
    var csg = new CSG();
    csg.polygons = polygons;
    csg.isCanonicalized = false;
    csg.isRetesselated = false;
    return csg;
};

// Construct a CSG solid from generated slices.
// Look at CSG.Polygon.prototype.solidFromSlices for details
CSG.fromSlices = function (options) {
    return (new CSGPolygon.createFromPoints([
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
    ])).solidFromSlices(options);
};

// create from an untyped object with identical property names:
CSG.fromObject = function (obj) {
    var polygons = obj.polygons.map(p => CSGPolygon.fromObject(p));
    var csg = CSG.fromPolygons(polygons);
    csg = csg.canonicalized();
    return csg;
};

// Reconstruct a CSG from the output of toCompactBinary()
CSG.fromCompactBinary = function (bin) {
    if (bin.class !== 'CSG') {
        throw new Error('Not a CSG');
    }
    var planes = [];
    var planeData = bin.planeData;
    var numplanes = planeData.length / 4;
    var arrayindex = 0;
    var x;
    var y;
    var z;
    var w;
    var normal;
    var
        plane;
    for (var planeindex = 0; planeindex < numplanes; planeindex++) {
        x = planeData[arrayindex++];
        y = planeData[arrayindex++];
        z = planeData[arrayindex++];
        w = planeData[arrayindex++];
        normal = CSGVector3D.Create(x, y, z);
        plane = new CSGPlane(normal, w);
        planes.push(plane);
    }
    var vertices = [];
    var vertexData = bin.vertexData;
    var numvertices = vertexData.length / 3;
    var pos;
    var
        vertex;
    arrayindex = 0;
    for (var vertexindex = 0; vertexindex < numvertices; vertexindex++) {
        x = vertexData[arrayindex++];
        y = vertexData[arrayindex++];
        z = vertexData[arrayindex++];
        pos = CSGVector3D.Create(x, y, z);
        vertex = new CSGVertex(pos);
        vertices.push(vertex);
    }
    var shareds = bin.shared.map(shared => CSGPolygonShared.fromObject(shared));
    var polygons = [];
    var numpolygons = bin.numPolygons;
    var numVerticesPerPolygon = bin.numVerticesPerPolygon;
    var polygonVertices = bin.polygonVertices;
    var polygonPlaneIndexes = bin.polygonPlaneIndexes;
    var polygonSharedIndexes = bin.polygonSharedIndexes;
    var numpolygonvertices;
    var polygonvertices;
    var shared;
    var
        polygon; // already defined plane,
    arrayindex = 0;
    for (var polygonindex = 0; polygonindex < numpolygons; polygonindex++) {
        numpolygonvertices = numVerticesPerPolygon[polygonindex];
        polygonvertices = [];
        for (var i = 0; i < numpolygonvertices; i++) {
            polygonvertices.push(vertices[polygonVertices[arrayindex++]]);
        }
        plane = planes[polygonPlaneIndexes[polygonindex]];
        shared = shareds[polygonSharedIndexes[polygonindex]];
        polygon = new CSGPolygon(polygonvertices, shared, plane);
        polygons.push(polygon);
    }
    var csg = CSG.fromPolygons(polygons);
    csg.isCanonicalized = true;
    csg.isRetesselated = true;
    return csg;
};

CSG.getTag = function () {
    return CSG.staticTag++;
};

// Parse an option from the options object
// If the option is not present, return the default value
CSG.parseOption = function (options, optionname, defaultvalue) {
    var result = defaultvalue;
    if (options) {
        if (optionname in options) {
            result = options[optionname];
        }
    }
    return result;
};

// Parse an option and force into a CSG.Vector3D. If a scalar is passed it is converted
// into a vector with equal x,y,z
CSG.parseOptionAs3DVector = function (options, optionname, defaultvalue) {
    var result = CSG.parseOption(options, optionname, defaultvalue);
    result = new CSGVector3D(result);
    return result;
};

CSG.parseOptionAs3DVectorList = function (options, optionname, defaultvalue) {
    var result = CSG.parseOption(options, optionname, defaultvalue);
    return result.map(res => new CSGVector3D(res));
};

// Parse an option and force into a CSG.Vector2D. If a scalar is passed it is converted
// into a vector with equal x,y
CSG.parseOptionAs2DVector = function (options, optionname, defaultvalue) {
    var result = CSG.parseOption(options, optionname, defaultvalue);
    result = new CSGVector2D(result);
    return result;
};

CSG.parseOptionAsFloat = function (options, optionname, defaultvalue) {
    var result = CSG.parseOption(options, optionname, defaultvalue);
    if (typeof (result) === 'string') {
        result = Number(result);
    }
    if (isNaN(result) || typeof (result) !== 'number') {
        throw new Error(`Parameter ${optionname} should be a number`);
    }
    return result;
};

CSG.parseOptionAsInt = function (options, optionname, defaultvalue) {
    var result = CSG.parseOption(options, optionname, defaultvalue);
    result = Number(Math.floor(result));
    if (isNaN(result)) {
        throw new Error(`Parameter ${optionname} should be a number`);
    }
    return result;
};

CSG.parseOptionAsBool = function (options, optionname, defaultvalue) {
    var result = CSG.parseOption(options, optionname, defaultvalue);
    if (typeof (result) === 'string') {
        if (result === 'true') {
            result = true;
        } else if (result === 'false') {
            result = false;
        } else if (result === 0) {
            result = false;
        }
    }
    result = !!result;
    return result;
};

// Construct an axis-aligned solid cuboid.
// Parameters:
//   center: center of cube (default [0,0,0])
//   radius: radius of cube (default [1,1,1]), can be specified as scalar or as 3D vector
//
// Example code:
//
//     var cube = CSG.cube({
//       center: [0, 0, 0],
//       radius: 1
//     });
CSG.cube = function (options) {
    var c;
    var
        r;
    options = options || {};
    if (('corner1' in options) || ('corner2' in options)) {
        if (('center' in options) || ('radius' in options)) {
            throw new Error('cube: should either give a radius and center parameter, or a corner1 and corner2 parameter');
        }
        var corner1 = CSG.parseOptionAs3DVector(options, 'corner1', [0, 0, 0]);
        var corner2 = CSG.parseOptionAs3DVector(options, 'corner2', [1, 1, 1]);
        c = corner1.plus(corner2).times(0.5);
        r = corner2.minus(corner1).times(0.5);
    } else {
        c = CSG.parseOptionAs3DVector(options, 'center', [0, 0, 0]);
        r = CSG.parseOptionAs3DVector(options, 'radius', [1, 1, 1]);
    }
    r = r.abs(); // negative radii make no sense
    var result = CSG.fromPolygons([
        [
            [0, 4, 6, 2],
            [-1, 0, 0],
        ],
        [
            [1, 3, 7, 5],
            [+1, 0, 0],
        ],
        [
            [0, 1, 5, 4],
            [0, -1, 0],
        ],
        [
            [2, 6, 7, 3],
            [0, +1, 0],
        ],
        [
            [0, 2, 3, 1],
            [0, 0, -1],
        ],
        [
            [4, 5, 7, 6],
            [0, 0, +1],
        ],
    ].map((info) => {
        // var normal = new CSGVector3D(info[1]);
        // var plane = new CSGPlane(normal, 1);
        var vertices = info[0].map((i) => {
            var pos = new CSGVector3D(
                c.x + r.x * (2 * !!(i & 1) - 1), c.y + r.y * (2 * !!(i & 2) - 1), c.z + r.z * (2 * !!(i & 4) - 1));
            return new CSGVertex(pos);
        });
        return new CSGPolygon(vertices, null /* , plane */);
    }));
    result.properties.cube = new CSGProperties();
    result.properties.cube.center = new CSGVector3D(c);
    // add 6 connectors, at the centers of each face:
    result.properties.cube.facecenters = [
        new CSGConnector(new CSGVector3D([r.x, 0, 0]).plus(c), [1, 0, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([-r.x, 0, 0]).plus(c), [-1, 0, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([0, r.y, 0]).plus(c), [0, 1, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([0, -r.y, 0]).plus(c), [0, -1, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([0, 0, r.z]).plus(c), [0, 0, 1], [1, 0, 0]),
        new CSGConnector(new CSGVector3D([0, 0, -r.z]).plus(c), [0, 0, -1], [1, 0, 0]),
    ];
    return result;
};

// Construct a solid sphere
//
// Parameters:
//   center: center of sphere (default [0,0,0])
//   radius: radius of sphere (default 1), must be a scalar
//   resolution: determines the number of polygons per 360 degree revolution (default 12)
//   axes: (optional) an array with 3 vectors for the x, y and z base vectors
//
// Example usage:
//
//     var sphere = CSG.sphere({
//       center: [0, 0, 0],
//       radius: 2,
//       resolution: 32,
//     });
CSG.sphere = function (options) {
    options = options || {};
    var center = CSG.parseOptionAs3DVector(options, 'center', [0, 0, 0]);
    var radius = CSG.parseOptionAsFloat(options, 'radius', 1);
    var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
    var xvector;
    var yvector;
    var
        zvector;
    if ('axes' in options) {
        xvector = options.axes[0].unit().times(radius);
        yvector = options.axes[1].unit().times(radius);
        zvector = options.axes[2].unit().times(radius);
    } else {
        xvector = new CSGVector3D([1, 0, 0]).times(radius);
        yvector = new CSGVector3D([0, -1, 0]).times(radius);
        zvector = new CSGVector3D([0, 0, 1]).times(radius);
    }
    if (resolution < 4) {
        resolution = 4;
    }
    var qresolution = Math.round(resolution / 4);
    var prevcylinderpoint;
    var polygons = [];
    for (var slice1 = 0; slice1 <= resolution; slice1++) {
        var angle = Math.PI * 2.0 * slice1 / resolution;
        var cylinderpoint = xvector.times(Math.cos(angle)).plus(yvector.times(Math.sin(angle)));
        if (slice1 > 0) {
            // cylinder vertices:
            var vertices = [];
            var prevcospitch;
            var
                prevsinpitch;
            for (var slice2 = 0; slice2 <= qresolution; slice2++) {
                var pitch = 0.5 * Math.PI * slice2 / qresolution;
                var cospitch = Math.cos(pitch);
                var sinpitch = Math.sin(pitch);
                if (slice2 > 0) {
                    vertices = [];
                    vertices.push(new CSGVertex(center.plus(prevcylinderpoint.times(prevcospitch).minus(zvector.times(prevsinpitch)))));
                    vertices.push(new CSGVertex(center.plus(cylinderpoint.times(prevcospitch).minus(zvector.times(prevsinpitch)))));
                    if (slice2 < qresolution) {
                        vertices.push(new CSGVertex(center.plus(cylinderpoint.times(cospitch).minus(zvector.times(sinpitch)))));
                    }
                    vertices.push(new CSGVertex(center.plus(prevcylinderpoint.times(cospitch).minus(zvector.times(sinpitch)))));
                    polygons.push(new CSGPolygon(vertices));
                    vertices = [];
                    vertices.push(new CSGVertex(center.plus(prevcylinderpoint.times(prevcospitch).plus(zvector.times(prevsinpitch)))));
                    vertices.push(new CSGVertex(center.plus(cylinderpoint.times(prevcospitch).plus(zvector.times(prevsinpitch)))));
                    if (slice2 < qresolution) {
                        vertices.push(new CSGVertex(center.plus(cylinderpoint.times(cospitch).plus(zvector.times(sinpitch)))));
                    }
                    vertices.push(new CSGVertex(center.plus(prevcylinderpoint.times(cospitch).plus(zvector.times(sinpitch)))));
                    vertices.reverse();
                    polygons.push(new CSGPolygon(vertices));
                }
                prevcospitch = cospitch;
                prevsinpitch = sinpitch;
            }
        }
        prevcylinderpoint = cylinderpoint;
    }
    var result = CSG.fromPolygons(polygons);
    result.properties.sphere = new CSGProperties();
    result.properties.sphere.center = new CSGVector3D(center);
    result.properties.sphere.facepoint = center.plus(xvector);
    return result;
};

// Construct a solid cylinder.
//
// Parameters:
//   start: start point of cylinder (default [0, -1, 0])
//   end: end point of cylinder (default [0, 1, 0])
//   radius: radius of cylinder (default 1), must be a scalar
//   resolution: determines the number of polygons per 360 degree revolution (default 12)
//
// Example usage:
//
//     var cylinder = CSG.cylinder({
//       start: [0, -1, 0],
//       end: [0, 1, 0],
//       radius: 1,
//       resolution: 16
//     });
CSG.cylinder = function (options) {
    var s = CSG.parseOptionAs3DVector(options, 'start', [0, -1, 0]);
    var e = CSG.parseOptionAs3DVector(options, 'end', [0, 1, 0]);
    var r = CSG.parseOptionAsFloat(options, 'radius', 1);
    var rEnd = CSG.parseOptionAsFloat(options, 'radiusEnd', r);
    var rStart = CSG.parseOptionAsFloat(options, 'radiusStart', r);
    var alpha = CSG.parseOptionAsFloat(options, 'sectorAngle', 360);
    alpha = alpha > 360 ? alpha % 360 : alpha;
    if ((rEnd < 0) || (rStart < 0)) {
        throw new Error('Radius should be non-negative');
    }
    if ((rEnd === 0) && (rStart === 0)) {
        throw new Error('Either radiusStart or radiusEnd should be positive');
    }
    var slices = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
    var ray = e.minus(s);
    var axisZ = ray.unit(); // , isY = (Math.abs(axisZ.y) > 0.5);
    var axisX = axisZ.randomNonParallelVector().unit();
    //  var axisX = new CSGVector3D(isY, !isY, 0).cross(axisZ).unit();
    var axisY = axisX.cross(axisZ).unit();
    var start = new CSGVertex(s);
    var end = new CSGVertex(e);
    var polygons = [];

    function point(stack, slice, radius) {
        var angle = slice * Math.PI * alpha / 180;
        var out = axisX.times(Math.cos(angle)).plus(axisY.times(Math.sin(angle)));
        var pos = s.plus(ray.times(stack)).plus(out.times(radius));
        return new CSGVertex(pos);
    }

    if (alpha > 0) {
        for (var i = 0; i < slices; i++) {
            var t0 = i / slices;
            var t1 = (i + 1) / slices;
            if (rEnd === rStart) {
                polygons.push(new CSGPolygon([start, point(0, t0, rEnd), point(0, t1, rEnd)]));
                polygons.push(new CSGPolygon([point(0, t1, rEnd), point(0, t0, rEnd), point(1, t0, rEnd), point(1, t1, rEnd)]));
                polygons.push(new CSGPolygon([end, point(1, t1, rEnd), point(1, t0, rEnd)]));
            } else {
                if (rStart > 0) {
                    polygons.push(new CSGPolygon([start, point(0, t0, rStart), point(0, t1, rStart)]));
                    polygons.push(new CSGPolygon([point(0, t0, rStart), point(1, t0, rEnd), point(0, t1, rStart)]));
                }
                if (rEnd > 0) {
                    polygons.push(new CSGPolygon([end, point(1, t1, rEnd), point(1, t0, rEnd)]));
                    polygons.push(new CSGPolygon([point(1, t0, rEnd), point(1, t1, rEnd), point(0, t1, rStart)]));
                }
            }
        }
        if (alpha < 360) {
            polygons.push(new CSGPolygon([start, end, point(0, 0, rStart)]));
            polygons.push(new CSGPolygon([point(0, 0, rStart), end, point(1, 0, rEnd)]));
            polygons.push(new CSGPolygon([start, point(0, 1, rStart), end]));
            polygons.push(new CSGPolygon([point(0, 1, rStart), point(1, 1, rEnd), end]));
        }
    }
    var result = CSG.fromPolygons(polygons);
    result.properties.cylinder = new CSGProperties();
    result.properties.cylinder.start = new CSGConnector(s, axisZ.negated(), axisX);
    result.properties.cylinder.end = new CSGConnector(e, axisZ, axisX);
    var cylCenter = s.plus(ray.times(0.5));
    var fptVec = axisX.rotate(s, axisZ, -alpha / 2).times((rStart + rEnd) / 2);
    var fptVec90 = fptVec.cross(axisZ);
    // note this one is NOT a face normal for a cone. - It's horizontal from cyl perspective
    result.properties.cylinder.facepointH = new CSGConnector(cylCenter.plus(fptVec), fptVec, axisZ);
    result.properties.cylinder.facepointH90 = new CSGConnector(cylCenter.plus(fptVec90), fptVec90, axisZ);
    return result;
};

// Like a cylinder, but with rounded ends instead of flat
//
// Parameters:
//   start: start point of cylinder (default [0, -1, 0])
//   end: end point of cylinder (default [0, 1, 0])
//   radius: radius of cylinder (default 1), must be a scalar
//   resolution: determines the number of polygons per 360 degree revolution (default 12)
//   normal: a vector determining the starting angle for tesselation. Should be non-parallel to start.minus(end)
//
// Example usage:
//
//     var cylinder = CSG.roundedCylinder({
//       start: [0, -1, 0],
//       end: [0, 1, 0],
//       radius: 1,
//       resolution: 16
//     });
CSG.roundedCylinder = function (options) {
    var p1 = CSG.parseOptionAs3DVector(options, 'start', [0, -1, 0]);
    var p2 = CSG.parseOptionAs3DVector(options, 'end', [0, 1, 0]);
    var radius = CSG.parseOptionAsFloat(options, 'radius', 1);
    var direction = p2.minus(p1);
    var defaultnormal;
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
        defaultnormal = new CSGVector3D(0, 1, 0);
    } else {
        defaultnormal = new CSGVector3D(1, 0, 0);
    }
    var normal = CSG.parseOptionAs3DVector(options, 'normal', defaultnormal);
    var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
    if (resolution < 4) {
        resolution = 4;
    }
    var polygons = [];
    var qresolution = Math.floor(0.25 * resolution);
    var length = direction.length();
    if (length < 1e-10) {
        return CSG.sphere({
            center: p1,
            radius,
            resolution,
        });
    }
    var zvector = direction.unit().times(radius);
    var xvector = zvector.cross(normal).unit().times(radius);
    var yvector = xvector.cross(zvector).unit().times(radius);
    var prevcylinderpoint;
    for (var slice1 = 0; slice1 <= resolution; slice1++) {
        var angle = Math.PI * 2.0 * slice1 / resolution;
        var cylinderpoint = xvector.times(Math.cos(angle)).plus(yvector.times(Math.sin(angle)));
        if (slice1 > 0) {
            // cylinder vertices:
            var vertices = [];
            vertices.push(new CSGVertex(p1.plus(cylinderpoint)));
            vertices.push(new CSGVertex(p1.plus(prevcylinderpoint)));
            vertices.push(new CSGVertex(p2.plus(prevcylinderpoint)));
            vertices.push(new CSGVertex(p2.plus(cylinderpoint)));
            polygons.push(new CSGPolygon(vertices));
            var prevcospitch;
            var
                prevsinpitch;
            for (var slice2 = 0; slice2 <= qresolution; slice2++) {
                var pitch = 0.5 * Math.PI * slice2 / qresolution;
                // var pitch = Math.asin(slice2/qresolution);
                var cospitch = Math.cos(pitch);
                var sinpitch = Math.sin(pitch);
                if (slice2 > 0) {
                    vertices = [];
                    vertices.push(new CSGVertex(p1.plus(prevcylinderpoint.times(prevcospitch).minus(zvector.times(prevsinpitch)))));
                    vertices.push(new CSGVertex(p1.plus(cylinderpoint.times(prevcospitch).minus(zvector.times(prevsinpitch)))));
                    if (slice2 < qresolution) {
                        vertices.push(new CSGVertex(p1.plus(cylinderpoint.times(cospitch).minus(zvector.times(sinpitch)))));
                    }
                    vertices.push(new CSGVertex(p1.plus(prevcylinderpoint.times(cospitch).minus(zvector.times(sinpitch)))));
                    polygons.push(new CSGPolygon(vertices));
                    vertices = [];
                    vertices.push(new CSGVertex(p2.plus(prevcylinderpoint.times(prevcospitch).plus(zvector.times(prevsinpitch)))));
                    vertices.push(new CSGVertex(p2.plus(cylinderpoint.times(prevcospitch).plus(zvector.times(prevsinpitch)))));
                    if (slice2 < qresolution) {
                        vertices.push(new CSGVertex(p2.plus(cylinderpoint.times(cospitch).plus(zvector.times(sinpitch)))));
                    }
                    vertices.push(new CSGVertex(p2.plus(prevcylinderpoint.times(cospitch).plus(zvector.times(sinpitch)))));
                    vertices.reverse();
                    polygons.push(new CSGPolygon(vertices));
                }
                prevcospitch = cospitch;
                prevsinpitch = sinpitch;
            }
        }
        prevcylinderpoint = cylinderpoint;
    }
    var result = CSG.fromPolygons(polygons);
    var ray = zvector.unit();
    var axisX = xvector.unit();
    result.properties.roundedCylinder = new CSGProperties();
    result.properties.roundedCylinder.start = new CSGConnector(p1, ray.negated(), axisX);
    result.properties.roundedCylinder.end = new CSGConnector(p2, ray, axisX);
    result.properties.roundedCylinder.facepoint = p1.plus(xvector);
    return result;
};

// Construct an axis-aligned solid rounded cuboid.
// Parameters:
//   center: center of cube (default [0,0,0])
//   radius: radius of cube (default [1,1,1]), can be specified as scalar or as 3D vector
//   roundradius: radius of rounded corners (default 0.2), must be a scalar
//   resolution: determines the number of polygons per 360 degree revolution (default 8)
//
// Example code:
//
//     var cube = CSG.roundedCube({
//       center: [0, 0, 0],
//       radius: 1,
//       roundradius: 0.2,
//       resolution: 8,
//     });
CSG.roundedCube = function (options) {
    var EPS = 1e-5;
    var minRR = 1e-2; // minroundradius 1e-3 gives rounding errors already
    var center;
    var
        cuberadius;
    options = options || {};
    if (('corner1' in options) || ('corner2' in options)) {
        if (('center' in options) || ('radius' in options)) {
            throw new Error('roundedCube: should either give a radius and center parameter, or a corner1 and corner2 parameter');
        }
        var corner1 = CSG.parseOptionAs3DVector(options, 'corner1', [0, 0, 0]);
        var corner2 = CSG.parseOptionAs3DVector(options, 'corner2', [1, 1, 1]);
        center = corner1.plus(corner2).times(0.5);
        cuberadius = corner2.minus(corner1).times(0.5);
    } else {
        center = CSG.parseOptionAs3DVector(options, 'center', [0, 0, 0]);
        cuberadius = CSG.parseOptionAs3DVector(options, 'radius', [1, 1, 1]);
    }
    cuberadius = cuberadius.abs(); // negative radii make no sense
    var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
    if (resolution < 4) {
        resolution = 4;
    }
    if (resolution % 2 === 1 && resolution < 8) {
        resolution = 8;
    } // avoid ugly
    var roundradius = CSG.parseOptionAs3DVector(options, 'roundradius', [0.2, 0.2, 0.2]);
    // slight hack for now - total radius stays ok

    roundradius = CSG.Vector3D.Create(Math.max(roundradius.x, minRR), Math.max(roundradius.y, minRR), Math.max(roundradius.z, minRR));
    var innerradius = cuberadius.minus(roundradius);
    if (innerradius.x < 0 || innerradius.y < 0 || innerradius.z < 0) {
        throw ('roundradius <= radius!');
    }
    var res = CSG.sphere({
        radius: 1,
        resolution,
    });
    res = res.scale(roundradius);
    innerradius.x > EPS && (res = res.stretchAtPlane([1, 0, 0], [0, 0, 0], 2 * innerradius.x));
    innerradius.y > EPS && (res = res.stretchAtPlane([0, 1, 0], [0, 0, 0], 2 * innerradius.y));
    innerradius.z > EPS && (res = res.stretchAtPlane([0, 0, 1], [0, 0, 0], 2 * innerradius.z));
    res = res.translate([-innerradius.x + center.x, -innerradius.y + center.y, -innerradius.z + center.z]);
    res = res.reTesselated();
    res.properties.roundedCube = new CSGProperties();
    res.properties.roundedCube.center = new CSGVertex(center);
    res.properties.roundedCube.facecenters = [
        new CSGConnector(new CSGVector3D([cuberadius.x, 0, 0]).plus(center), [1, 0, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([-cuberadius.x, 0, 0]).plus(center), [-1, 0, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([0, cuberadius.y, 0]).plus(center), [0, 1, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([0, -cuberadius.y, 0]).plus(center), [0, -1, 0], [0, 0, 1]),
        new CSGConnector(new CSGVector3D([0, 0, cuberadius.z]).plus(center), [0, 0, 1], [1, 0, 0]),
        new CSGConnector(new CSGVector3D([0, 0, -cuberadius.z]).plus(center), [0, 0, -1], [1, 0, 0]),
    ];
    return res;
};

// solve 2x2 linear equation:
// [ab][x] = [u]
// [cd][y]   [v]
CSG.solve2Linear = function (a, b, c, d, u, v) {
    var det = a * d - b * c;
    var invdet = 1.0 / det;
    var x = u * d - b * v;
    var y = -u * c + a * v;
    x *= invdet;
    y *= invdet;
    return [x, y];
};

CSG.polyhedron = function (options) {
    options = options || {};
    if (('points' in options) !== ('faces' in options)) {
        throw new Error("polyhedron needs 'points' and 'faces' arrays");
    }

    var vertices = CSG.parseOptionAs3DVectorList(options, 'points', [
        [1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [-1, 1, 0],
        [0, 0, 1],
    ])
        .map(pt => new CSGVertex(pt));

    var faces = CSG.parseOption(options, 'faces', [
        [0, 1, 4],
        [1, 2, 4],
        [2, 3, 4],
        [3, 0, 4],
        [1, 0, 3],
        [2, 1, 3],
    ]);

    // openscad convention defines inward normals - so we have to invert here
    faces.forEach((face) => {
        face.reverse();
    });

    var polygons = faces.map(face => new CSGPolygon(face.map(idx => vertices[idx])));

    // TODO: facecenters as connectors? probably overkill. Maybe centroid
    // the re-tesselation here happens because it's so easy for a user to
    // create parametrized polyhedrons that end up with 1-2 dimensional polygons.
    // These will create infinite loops at CSG.Tree()
    return CSG.fromPolygons(polygons).reTesselated();
};

CSG.IsFloat = function (n) {
    return (!isNaN(n)) || (n === Infinity) || (n === -Infinity);
};

// Get the x coordinate of a point with a certain y coordinate, interpolated between two
// points (CSG.Vector2D).
// Interpolation is robust even if the points have the same y coordinate
CSG.interpolateBetween2DPointsForY = function (point1, point2, y) {
    var f1 = y - point1.y;
    var f2 = point2.y - point1.y;
    if (f2 < 0) {
        f1 = -f1;
        f2 = -f2;
    }
    var t;
    if (f1 <= 0) {
        t = 0.0;
    } else if (f1 >= f2) {
        t = 1.0;
    } else if (f2 < 1e-10) {
        t = 0.5;
    } else {
        t = f1 / f2;
    }
    var result = point1.x + t * (point2.x - point1.x);
    return result;
};

// Retesselation function for a set of coplanar polygons. See the introduction at the top of
// this file.
CSG.reTesselateCoplanarPolygons = function (sourcepolygons, destpolygons) {
    var EPS = 1e-5;
    var numpolygons = sourcepolygons.length;
    if (numpolygons > 0) {
        var plane = sourcepolygons[0].plane;
        var shared = sourcepolygons[0].shared;
        var orthobasis = new CSGOrthoNormalBasis(plane);
        var polygonvertices2d = []; // array of array of CSG.Vector2D
        var polygontopvertexindexes = []; // array of indexes of topmost vertex per polygon
        var topy2polygonindexes = {};
        var ycoordinatetopolygonindexes = {};
        var xcoordinatebins = {};
        var ycoordinatebins = {};
        // convert all polygon vertices to 2D
        // Make a list of all encountered y coordinates
        // And build a map of all polygons that have a vertex at a certain y coordinate:
        var ycoordinateBinningFactor = 1.0 / EPS * 10;
        for (var polygonindex = 0; polygonindex < numpolygons; polygonindex++) {
            var poly3d = sourcepolygons[polygonindex];
            var vertices2d = [];
            var numvertices = poly3d.vertices.length;
            var minindex = -1;
            if (numvertices > 0) {
                var miny;
                var maxy;
                var
                    maxindex;
                for (var i = 0; i < numvertices; i++) {
                    var pos2d = orthobasis.to2D(poly3d.vertices[i].pos);
                    // perform binning of y coordinates: If we have multiple vertices very
                    // close to each other, give them the same y coordinate:
                    var ycoordinatebin = Math.floor(pos2d.y * ycoordinateBinningFactor);
                    var newy;
                    if (ycoordinatebin in ycoordinatebins) {
                        newy = ycoordinatebins[ycoordinatebin];
                    } else if (ycoordinatebin + 1 in ycoordinatebins) {
                        newy = ycoordinatebins[ycoordinatebin + 1];
                    } else if (ycoordinatebin - 1 in ycoordinatebins) {
                        newy = ycoordinatebins[ycoordinatebin - 1];
                    } else {
                        newy = pos2d.y;
                        ycoordinatebins[ycoordinatebin] = pos2d.y;
                    }
                    pos2d = CSGVector2D.Create(pos2d.x, newy);
                    vertices2d.push(pos2d);
                    var y = pos2d.y;
                    if ((i === 0) || (y < miny)) {
                        miny = y;
                        minindex = i;
                    }
                    if ((i === 0) || (y > maxy)) {
                        maxy = y;
                        maxindex = i;
                    }
                    if (!(y in ycoordinatetopolygonindexes)) {
                        ycoordinatetopolygonindexes[y] = {};
                    }
                    ycoordinatetopolygonindexes[y][polygonindex] = true;
                }
                if (miny >= maxy) {
                    // degenerate polygon, all vertices have same y coordinate. Just ignore it from now:
                    vertices2d = [];
                    numvertices = 0;
                    minindex = -1;
                } else {
                    if (!(miny in topy2polygonindexes)) {
                        topy2polygonindexes[miny] = [];
                    }
                    topy2polygonindexes[miny].push(polygonindex);
                }
            } // if(numvertices > 0)
            // reverse the vertex order:
            vertices2d.reverse();
            minindex = numvertices - minindex - 1;
            polygonvertices2d.push(vertices2d);
            polygontopvertexindexes.push(minindex);
        }
        var ycoordinates = [];
        for (var ycoordinate in ycoordinatetopolygonindexes) {
            ycoordinates.push(ycoordinate);
        }
        ycoordinates.sort(fnNumberSort);
        // Now we will iterate over all y coordinates, from lowest to highest y coordinate
        // activepolygons: source polygons that are 'active', i.e. intersect with our y coordinate
        //   Is sorted so the polygons are in left to right order
        // Each element in activepolygons has these properties:
        //        polygonindex: the index of the source polygon (i.e. an index into the sourcepolygons
        //                      and polygonvertices2d arrays)
        //        leftvertexindex: the index of the vertex at the left side of the polygon (lowest x)
        //                         that is at or just above the current y coordinate
        //        rightvertexindex: dito at right hand side of polygon
        //        topleft, bottomleft: coordinates of the left side of the polygon crossing the current y coordinate
        //        topright, bottomright: coordinates of the right hand side of the polygon crossing the current y coordinate
        var activepolygons = [];
        var prevoutpolygonrow = [];
        for (var yindex = 0; yindex < ycoordinates.length; yindex++) {
            var newoutpolygonrow = [];
            var ycoordinate_as_string = ycoordinates[yindex];
            var ycoordinate = Number(ycoordinate_as_string);
            // update activepolygons for this y coordinate:
            // - Remove any polygons that end at this y coordinate
            // - update leftvertexindex and rightvertexindex (which point to the current vertex index
            //   at the the left and right side of the polygon
            // Iterate over all polygons that have a corner at this y coordinate:
            var polygonindexeswithcorner = ycoordinatetopolygonindexes[ycoordinate_as_string];
            for (var activepolygonindex = 0; activepolygonindex < activepolygons.length; ++activepolygonindex) {
                var activepolygon = activepolygons[activepolygonindex];
                var polygonindex = activepolygon.polygonindex;
                if (polygonindexeswithcorner[polygonindex]) {
                    // this active polygon has a corner at this y coordinate:
                    var vertices2d = polygonvertices2d[polygonindex];
                    var numvertices = vertices2d.length;
                    var newleftvertexindex = activepolygon.leftvertexindex;
                    var newrightvertexindex = activepolygon.rightvertexindex;
                    // See if we need to increase leftvertexindex or decrease rightvertexindex:
                    while (true) {
                        var nextleftvertexindex = newleftvertexindex + 1;
                        if (nextleftvertexindex >= numvertices) {
                            nextleftvertexindex = 0;
                        }
                        if (vertices2d[nextleftvertexindex].y !== ycoordinate) {
                            break;
                        }
                        newleftvertexindex = nextleftvertexindex;
                    }
                    var nextrightvertexindex = newrightvertexindex - 1;
                    if (nextrightvertexindex < 0) {
                        nextrightvertexindex = numvertices - 1;
                    }
                    if (vertices2d[nextrightvertexindex].y === ycoordinate) {
                        newrightvertexindex = nextrightvertexindex;
                    }
                    if ((newleftvertexindex !== activepolygon.leftvertexindex) && (newleftvertexindex === newrightvertexindex)) {
                        // We have increased leftvertexindex or decreased rightvertexindex, and now they point to the same vertex
                        // This means that this is the bottom point of the polygon. We'll remove it:
                        activepolygons.splice(activepolygonindex, 1);
                        --activepolygonindex;
                    } else {
                        activepolygon.leftvertexindex = newleftvertexindex;
                        activepolygon.rightvertexindex = newrightvertexindex;
                        activepolygon.topleft = vertices2d[newleftvertexindex];
                        activepolygon.topright = vertices2d[newrightvertexindex];
                        var nextleftvertexindex = newleftvertexindex + 1;
                        if (nextleftvertexindex >= numvertices) {
                            nextleftvertexindex = 0;
                        }
                        activepolygon.bottomleft = vertices2d[nextleftvertexindex];
                        var nextrightvertexindex = newrightvertexindex - 1;
                        if (nextrightvertexindex < 0) {
                            nextrightvertexindex = numvertices - 1;
                        }
                        activepolygon.bottomright = vertices2d[nextrightvertexindex];
                    }
                } // if polygon has corner here
            } // for activepolygonindex
            var nextycoordinate;
            if (yindex >= ycoordinates.length - 1) {
                // last row, all polygons must be finished here:
                activepolygons = [];
                nextycoordinate = null;
            } else {
                // yindex < ycoordinates.length-1
                nextycoordinate = Number(ycoordinates[yindex + 1]);
                var middleycoordinate = 0.5 * (ycoordinate + nextycoordinate);
                // update activepolygons by adding any polygons that start here:
                var startingpolygonindexes = topy2polygonindexes[ycoordinate_as_string];
                for (var polygonindex_key in startingpolygonindexes) {
                    var polygonindex = startingpolygonindexes[polygonindex_key];
                    var vertices2d = polygonvertices2d[polygonindex];
                    var numvertices = vertices2d.length;
                    var topvertexindex = polygontopvertexindexes[polygonindex];
                    // the top of the polygon may be a horizontal line. In that case topvertexindex can point to any point on this line.
                    // Find the left and right topmost vertices which have the current y coordinate:
                    var topleftvertexindex = topvertexindex;
                    while (true) {
                        var i = topleftvertexindex + 1;
                        if (i >= numvertices) {
                            i = 0;
                        }
                        if (vertices2d[i].y !== ycoordinate) {
                            break;
                        }
                        if (i === topvertexindex) {
                            break;
                        } // should not happen, but just to prevent endless loops
                        topleftvertexindex = i;
                    }
                    var toprightvertexindex = topvertexindex;
                    while (true) {
                        var i = toprightvertexindex - 1;
                        if (i < 0) {
                            i = numvertices - 1;
                        }
                        if (vertices2d[i].y !== ycoordinate) {
                            break;
                        }
                        if (i === topleftvertexindex) {
                            break;
                        } // should not happen, but just to prevent endless loops
                        toprightvertexindex = i;
                    }
                    var nextleftvertexindex = topleftvertexindex + 1;
                    if (nextleftvertexindex >= numvertices) {
                        nextleftvertexindex = 0;
                    }
                    var nextrightvertexindex = toprightvertexindex - 1;
                    if (nextrightvertexindex < 0) {
                        nextrightvertexindex = numvertices - 1;
                    }
                    var newactivepolygon = {
                        polygonindex,
                        leftvertexindex: topleftvertexindex,
                        rightvertexindex: toprightvertexindex,
                        topleft: vertices2d[topleftvertexindex],
                        topright: vertices2d[toprightvertexindex],
                        bottomleft: vertices2d[nextleftvertexindex],
                        bottomright: vertices2d[nextrightvertexindex],
                    };
                    insertSorted(activepolygons, newactivepolygon, (el1, el2) => {
                        var x1 = CSG.interpolateBetween2DPointsForY(
                            el1.topleft, el1.bottomleft, middleycoordinate);
                        var x2 = CSG.interpolateBetween2DPointsForY(
                            el2.topleft, el2.bottomleft, middleycoordinate);
                        if (x1 > x2) {
                            return 1;
                        }
                        if (x1 < x2) {
                            return -1;
                        }
                        return 0;
                    });
                } // for(var polygonindex in startingpolygonindexes)
            } //  yindex < ycoordinates.length-1
            // if( (yindex === ycoordinates.length-1) || (nextycoordinate - ycoordinate > EPS) )
            if (true) {
                // Now activepolygons is up to date
                // Build the output polygons for the next row in newoutpolygonrow:
                for (var activepolygon_key in activepolygons) {
                    var activepolygon = activepolygons[activepolygon_key];
                    var polygonindex = activepolygon.polygonindex;
                    var vertices2d = polygonvertices2d[polygonindex];
                    var numvertices = vertices2d.length;
                    var x = CSG.interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, ycoordinate);
                    var topleft = CSGVector2D.Create(x, ycoordinate);
                    x = CSG.interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, ycoordinate);
                    var topright = CSGVector2D.Create(x, ycoordinate);
                    x = CSG.interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, nextycoordinate);
                    var bottomleft = CSGVector2D.Create(x, nextycoordinate);
                    x = CSG.interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, nextycoordinate);
                    var bottomright = CSGVector2D.Create(x, nextycoordinate);
                    var outpolygon = {
                        topleft,
                        topright,
                        bottomleft,
                        bottomright,
                        leftline: CSGLine2D.fromPoints(topleft, bottomleft),
                        rightline: CSGLine2D.fromPoints(bottomright, topright),
                    };
                    if (newoutpolygonrow.length > 0) {
                        var prevoutpolygon = newoutpolygonrow[newoutpolygonrow.length - 1];
                        var d1 = outpolygon.topleft.distanceTo(prevoutpolygon.topright);
                        var d2 = outpolygon.bottomleft.distanceTo(prevoutpolygon.bottomright);
                        if ((d1 < EPS) && (d2 < EPS)) {
                            // we can join this polygon with the one to the left:
                            outpolygon.topleft = prevoutpolygon.topleft;
                            outpolygon.leftline = prevoutpolygon.leftline;
                            outpolygon.bottomleft = prevoutpolygon.bottomleft;
                            newoutpolygonrow.splice(newoutpolygonrow.length - 1, 1);
                        }
                    }
                    newoutpolygonrow.push(outpolygon);
                } // for(activepolygon in activepolygons)
                if (yindex > 0) {
                    // try to match the new polygons against the previous row:
                    var prevcontinuedindexes = {};
                    var matchedindexes = {};
                    for (var i = 0; i < newoutpolygonrow.length; i++) {
                        var thispolygon = newoutpolygonrow[i];
                        for (var ii = 0; ii < prevoutpolygonrow.length; ii++) {
                            if (!matchedindexes[ii]) {
                                // not already processed?
                                // We have a match if the sidelines are equal or if the top coordinates
                                // are on the sidelines of the previous polygon
                                var prevpolygon = prevoutpolygonrow[ii];
                                if (prevpolygon.bottomleft.distanceTo(thispolygon.topleft) < EPS) {
                                    if (prevpolygon.bottomright.distanceTo(thispolygon.topright) < EPS) {
                                        // Yes, the top of this polygon matches the bottom of the previous:
                                        matchedindexes[ii] = true;
                                        // Now check if the joined polygon would remain convex:
                                        var d1 = thispolygon.leftline.direction().x - prevpolygon.leftline.direction().x;
                                        var d2 = thispolygon.rightline.direction().x - prevpolygon.rightline.direction().x;
                                        var leftlinecontinues = Math.abs(d1) < EPS;
                                        var rightlinecontinues = Math.abs(d2) < EPS;
                                        var leftlineisconvex = leftlinecontinues || (d1 >= 0);
                                        var rightlineisconvex = rightlinecontinues || (d2 >= 0);
                                        if (leftlineisconvex && rightlineisconvex) {
                                            // yes, both sides have convex corners:
                                            // This polygon will continue the previous polygon
                                            thispolygon.outpolygon = prevpolygon.outpolygon;
                                            thispolygon.leftlinecontinues = leftlinecontinues;
                                            thispolygon.rightlinecontinues = rightlinecontinues;
                                            prevcontinuedindexes[ii] = true;
                                        }
                                        break;
                                    }
                                }
                            } // if(!prevcontinuedindexes[ii])
                        } // for ii
                    } // for i
                    for (var ii = 0; ii < prevoutpolygonrow.length; ii++) {
                        if (!prevcontinuedindexes[ii]) {
                            // polygon ends here
                            // Finish the polygon with the last point(s):
                            var prevpolygon = prevoutpolygonrow[ii];
                            prevpolygon.outpolygon.rightpoints.push(prevpolygon.bottomright);
                            if (prevpolygon.bottomright.distanceTo(prevpolygon.bottomleft) > EPS) {
                                // polygon ends with a horizontal line:
                                prevpolygon.outpolygon.leftpoints.push(prevpolygon.bottomleft);
                            }
                            // reverse the left half so we get a counterclockwise circle:
                            prevpolygon.outpolygon.leftpoints.reverse();
                            var points2d = prevpolygon.outpolygon.rightpoints.concat(prevpolygon.outpolygon.leftpoints);
                            var vertices3d = [];
                            points2d.map((point2d) => {
                                var point3d = orthobasis.to3D(point2d);
                                var vertex3d = new CSGVertex(point3d);
                                vertices3d.push(vertex3d);
                            });
                            var polygon = new CSGPolygon(vertices3d, shared, plane);
                            destpolygons.push(polygon);
                        }
                    }
                } // if(yindex > 0)
                for (var i = 0; i < newoutpolygonrow.length; i++) {
                    var thispolygon = newoutpolygonrow[i];
                    if (!thispolygon.outpolygon) {
                        // polygon starts here:
                        thispolygon.outpolygon = {
                            leftpoints: [],
                            rightpoints: [],
                        };
                        thispolygon.outpolygon.leftpoints.push(thispolygon.topleft);
                        if (thispolygon.topleft.distanceTo(thispolygon.topright) > EPS) {
                            // we have a horizontal line at the top:
                            thispolygon.outpolygon.rightpoints.push(thispolygon.topright);
                        }
                    } else {
                        // continuation of a previous row
                        if (!thispolygon.leftlinecontinues) {
                            thispolygon.outpolygon.leftpoints.push(thispolygon.topleft);
                        }
                        if (!thispolygon.rightlinecontinues) {
                            thispolygon.outpolygon.rightpoints.push(thispolygon.topright);
                        }
                    }
                }
                prevoutpolygonrow = newoutpolygonrow;
            }
        } // for yindex
    } // if(numpolygons > 0)
};

Object.assign(CSG.prototype, {

    toPolygons() {
        return this.polygons;
    },

    // Return a new CSG solid representing space in either this solid or in the
    // solid `csg`. Neither this solid nor the solid `csg` are modified.
    //
    //     A.union(B)
    //
    //     +-------+            +-------+
    //     |       |            |       |
    //     |   A   |            |       |
    //     |    +--+----+   =   |       +----+
    //     +----+--+    |       +----+       |
    //          |   B   |            |       |
    //          |       |            |       |
    //          +-------+            +-------+
    //
    union(csg) {
        var csgs;
        if (csg instanceof Array) {
            csgs = csg.slice(0);
            csgs.push(this);
        } else {
            csgs = [this, csg];
        }
        // combine csg pairs in a way that forms a balanced binary tree pattern
        for (var i = 1; i < csgs.length; i += 2) {
            csgs.push(csgs[i - 1].unionSub(csgs[i]));
        }
        return csgs[i - 1].reTesselated().canonicalized();
    },

    unionSub(csg, retesselate, canonicalize) {
        if (!this.mayOverlap(csg)) {
            return this.unionForNonIntersecting(csg);
        } else {
            var a = new CSGTree(this.polygons);
            var b = new CSGTree(csg.polygons);
            a.clipTo(b, false);
            // b.clipTo(a, true); // ERROR: this doesn't work
            b.clipTo(a);
            b.invert();
            b.clipTo(a);
            b.invert();
            var newpolygons = a.allPolygons().concat(b.allPolygons());
            var result = CSG.fromPolygons(newpolygons);
            result.properties = this.properties._merge(csg.properties);
            if (retesselate) {
                result = result.reTesselated();
            }
            if (canonicalize) {
                result = result.canonicalized();
            }
            return result;
        }
    },

    // Like union, but when we know that the two solids are not intersecting
    // Do not use if you are not completely sure that the solids do not intersect!
    unionForNonIntersecting(csg) {
        var newpolygons = this.polygons.concat(csg.polygons);
        var result = CSG.fromPolygons(newpolygons);
        result.properties = this.properties._merge(csg.properties);
        result.isCanonicalized = this.isCanonicalized && csg.isCanonicalized;
        result.isRetesselated = this.isRetesselated && csg.isRetesselated;
        return result;
    },

    // Return a new CSG solid representing space in this solid but not in the
    // solid `csg`. Neither this solid nor the solid `csg` are modified.
    //
    //     A.subtract(B)
    //
    //     +-------+            +-------+
    //     |       |            |       |
    //     |   A   |            |       |
    //     |    +--+----+   =   |    +--+
    //     +----+--+    |       +----+
    //          |   B   |
    //          |       |
    //          +-------+
    //
    subtract(csg) {
        var csgs;
        if (csg instanceof Array) {
            csgs = csg;
        } else {
            csgs = [csg];
        }
        var result = this;
        for (var i = 0; i < csgs.length; i++) {
            var islast = (i === (csgs.length - 1));
            result = result.subtractSub(csgs[i], islast, islast);
        }
        return result;
    },

    subtractSub(csg, retesselate, canonicalize) {
        var a = new CSGTree(this.polygons);
        var b = new CSGTree(csg.polygons);
        a.invert();
        a.clipTo(b);
        b.clipTo(a, true);
        a.addPolygons(b.allPolygons());
        a.invert();
        var result = CSG.fromPolygons(a.allPolygons());
        result.properties = this.properties._merge(csg.properties);
        if (retesselate) {
            result = result.reTesselated();
        }
        if (canonicalize) {
            result = result.canonicalized();
        }
        return result;
    },

    // Return a new CSG solid representing space both this solid and in the
    // solid `csg`. Neither this solid nor the solid `csg` are modified.
    //
    //     A.intersect(B)
    //
    //     +-------+
    //     |       |
    //     |   A   |
    //     |    +--+----+   =   +--+
    //     +----+--+    |       +--+
    //          |   B   |
    //          |       |
    //          +-------+
    //
    intersect(csg) {
        var csgs;
        if (csg instanceof Array) {
            csgs = csg;
        } else {
            csgs = [csg];
        }
        var result = this;
        for (var i = 0; i < csgs.length; i++) {
            var islast = (i === (csgs.length - 1));
            result = result.intersectSub(csgs[i], islast, islast);
        }
        return result;
    },

    intersectSub(csg, retesselate, canonicalize) {
        var a = new CSGTree(this.polygons);
        var b = new CSGTree(csg.polygons);
        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.addPolygons(b.allPolygons());
        a.invert();
        var result = CSG.fromPolygons(a.allPolygons());
        result.properties = this.properties._merge(csg.properties);
        if (retesselate) {
            result = result.reTesselated();
        }
        if (canonicalize) {
            result = result.canonicalized();
        }
        return result;
    },

    // Return a new CSG solid with solid and empty space switched. This solid is
    // not modified.
    invert() {
        var flippedpolygons = this.polygons.map(p => p.flipped());
        return CSG.fromPolygons(flippedpolygons);
    },

    // Affine transformation of CSG object. Returns a new CSG object
    transform1(matrix4x4) {
        var newpolygons = this.polygons.map(p => p.transform(matrix4x4));
        var result = CSG.fromPolygons(newpolygons);
        result.properties = this.properties._transform(matrix4x4);
        result.isRetesselated = this.isRetesselated;
        return result;
    },

    transform(matrix4x4) {
        var ismirror = matrix4x4.isMirroring();
        var transformedvertices = {};
        var transformedplanes = {};
        var newpolygons = this.polygons.map((p) => {
            var newplane;
            var plane = p.plane;
            var planetag = plane.getTag();
            if (planetag in transformedplanes) {
                newplane = transformedplanes[planetag];
            } else {
                newplane = plane.transform(matrix4x4);
                transformedplanes[planetag] = newplane;
            }
            var newvertices = p.vertices.map((v) => {
                var newvertex;
                var vertextag = v.getTag();
                if (vertextag in transformedvertices) {
                    newvertex = transformedvertices[vertextag];
                } else {
                    newvertex = v.transform(matrix4x4);
                    transformedvertices[vertextag] = newvertex;
                }
                return newvertex;
            });
            if (ismirror) {
                newvertices.reverse();
            }
            return new CSGPolygon(newvertices, p.shared, newplane);
        });
        var result = CSG.fromPolygons(newpolygons);
        result.properties = this.properties._transform(matrix4x4);
        result.isRetesselated = this.isRetesselated;
        result.isCanonicalized = this.isCanonicalized;
        return result;
    },

    toString() {
        var result = 'CSG solid:\n';
        this.polygons.map((p) => {
            result += p.toString();
        });
        return result;
    },

    // Expand the solid
    // resolution: number of points per 360 degree for the rounded corners
    expand(radius, resolution) {
        var result = this.expandedShell(radius, resolution, true);
        result = result.reTesselated();
        result.properties = this.properties; // keep original properties
        return result;
    },

    // Contract the solid
    // resolution: number of points per 360 degree for the rounded corners
    contract(radius, resolution) {
        var expandedshell = this.expandedShell(radius, resolution, false);
        var result = this.subtract(expandedshell);
        result = result.reTesselated();
        result.properties = this.properties; // keep original properties
        return result;
    },

    // cut the solid at a plane, and stretch the cross-section found along plane normal
    stretchAtPlane(normal, point, length) {
        var plane = CSG.Plane.fromNormalAndPoint(normal, point);
        var onb = new CSGOrthoNormalBasis(plane);
        var crosssect = this.sectionCut(onb);
        var midpiece = crosssect.extrudeInOrthonormalBasis(onb, length);
        var piece1 = this.cutByPlane(plane);
        var piece2 = this.cutByPlane(plane.flipped());
        var result = piece1.union([midpiece, piece2.translate(plane.normal.times(length))]);
        return result;
    },

    // Create the expanded shell of the solid:
    // All faces are extruded to get a thickness of 2*radius
    // Cylinders are constructed around every side
    // Spheres are placed on every vertex
    // unionWithThis: if true, the resulting solid will be united with 'this' solid;
    //   the result is a true expansion of the solid
    //   If false, returns only the shell
    expandedShell(radius, resolution, unionWithThis) {
        var csg = this.reTesselated();
        var result;
        if (unionWithThis) {
            result = csg;
        } else {
            result = new CSG();
        }

        // first extrude all polygons:
        csg.polygons.map((polygon) => {
            var extrudevector = polygon.plane.normal.unit().times(2 * radius);
            var translatedpolygon = polygon.translate(extrudevector.times(-0.5));
            var extrudedface = translatedpolygon.extrude(extrudevector);
            result = result.unionSub(extrudedface, false, false);
        });
        // Make a list of all unique vertex pairs (i.e. all sides of the solid)
        // For each vertex pair we collect the following:
        //   v1: first coordinate
        //   v2: second coordinate
        //   planenormals: array of normal vectors of all planes touching this side
        var vertexpairs = {}; // map of 'vertex pair tag' to {v1, v2, planenormals}
        csg.polygons.map((polygon) => {
            var numvertices = polygon.vertices.length;
            var prevvertex = polygon.vertices[numvertices - 1];
            var prevvertextag = prevvertex.getTag();
            for (var i = 0; i < numvertices; i++) {
                var vertex = polygon.vertices[i];
                var vertextag = vertex.getTag();
                var vertextagpair;
                if (vertextag < prevvertextag) {
                    vertextagpair = `${vertextag}-${prevvertextag}`;
                } else {
                    vertextagpair = `${prevvertextag}-${vertextag}`;
                }
                var obj;
                if (vertextagpair in vertexpairs) {
                    obj = vertexpairs[vertextagpair];
                } else {
                    obj = {
                        v1: prevvertex,
                        v2: vertex,
                        planenormals: [],
                    };
                    vertexpairs[vertextagpair] = obj;
                }
                obj.planenormals.push(polygon.plane.normal);
                prevvertextag = vertextag;
                prevvertex = vertex;
            }
        });

        // now construct a cylinder on every side
        // The cylinder is always an approximation of a true cylinder: it will have <resolution> polygons
        // around the sides. We will make sure though that the cylinder will have an edge at every
        // face that touches this side. This ensures that we will get a smooth fill even
        // if two edges are at, say, 10 degrees and the resolution is low.
        // Note: the result is not retesselated yet but it really should be!
        for (var vertextagpair in vertexpairs) {
            var vertexpair = vertexpairs[vertextagpair];
            var startpoint = vertexpair.v1.pos;
            var endpoint = vertexpair.v2.pos;
            // our x,y and z vectors:
            var zbase = endpoint.minus(startpoint).unit();
            var xbase = vertexpair.planenormals[0].unit();
            var ybase = xbase.cross(zbase);
            // make a list of angles that the cylinder should traverse:
            var angles = [];
            // first of all equally spaced around the cylinder:
            for (var i = 0; i < resolution; i++) {
                angles.push(i * Math.PI * 2 / resolution);
            }
            // and also at every normal of all touching planes:
            for (var i = 0, iMax = vertexpair.planenormals.length; i < iMax; i++) {
                var planenormal = vertexpair.planenormals[i];
                var si = ybase.dot(planenormal);
                var co = xbase.dot(planenormal);
                var angle = Math.atan2(si, co);
                if (angle < 0) {
                    angle += Math.PI * 2;
                }
                angles.push(angle);
                angle = Math.atan2(-si, -co);
                if (angle < 0) {
                    angle += Math.PI * 2;
                }
                angles.push(angle);
            }
            // this will result in some duplicate angles but we will get rid of those later.
            // Sort:
            angles = angles.sort(fnNumberSort);
            // Now construct the cylinder by traversing all angles:
            var numangles = angles.length;
            var prevp1;
            var prevp2;
            var startfacevertices = [];
            var endfacevertices = [];
            var polygons = [];
            for (var i = -1; i < numangles; i++) {
                var angle = angles[(i < 0) ? (i + numangles) : i];
                var si = Math.sin(angle);
                var co = Math.cos(angle);
                var p = xbase.times(co * radius).plus(ybase.times(si * radius));
                var p1 = startpoint.plus(p);
                var p2 = endpoint.plus(p);
                var skip = false;
                if (i >= 0) {
                    if (p1.distanceTo(prevp1) < 1e-5) {
                        skip = true;
                    }
                }
                if (!skip) {
                    if (i >= 0) {
                        startfacevertices.push(new CSGVertex(p1));
                        endfacevertices.push(new CSGVertex(p2));
                        var polygonvertices = [
                            new CSGVertex(prevp2),
                            new CSGVertex(p2),
                            new CSGVertex(p1),
                            new CSGVertex(prevp1),
                        ];
                        var polygon = new CSGPolygon(polygonvertices);
                        polygons.push(polygon);
                    }
                    prevp1 = p1;
                    prevp2 = p2;
                }
            }
            endfacevertices.reverse();
            polygons.push(new CSGPolygon(startfacevertices));
            polygons.push(new CSGPolygon(endfacevertices));
            var cylinder = CSG.fromPolygons(polygons);
            result = result.unionSub(cylinder, false, false);
        }

        // make a list of all unique vertices
        // For each vertex we also collect the list of normals of the planes touching the vertices
        var vertexmap = {};
        csg.polygons.map((polygon) => {
            polygon.vertices.map((vertex) => {
                var vertextag = vertex.getTag();
                var obj;
                if (vertextag in vertexmap) {
                    obj = vertexmap[vertextag];
                } else {
                    obj = {
                        pos: vertex.pos,
                        normals: [],
                    };
                    vertexmap[vertextag] = obj;
                }
                obj.normals.push(polygon.plane.normal);
            });
        });

        // and build spheres at each vertex
        // We will try to set the x and z axis to the normals of 2 planes
        // This will ensure that our sphere tesselation somewhat matches 2 planes
        for (var vertextag in vertexmap) {
            var vertexobj = vertexmap[vertextag];
            // use the first normal to be the x axis of our sphere:
            var xaxis = vertexobj.normals[0].unit();
            // and find a suitable z axis. We will use the normal which is most perpendicular to the x axis:
            var bestzaxis = null;
            var bestzaxisorthogonality = 0;
            for (var i = 1; i < vertexobj.normals.length; i++) {
                var normal = vertexobj.normals[i].unit();
                var cross = xaxis.cross(normal);
                var crosslength = cross.length();
                if (crosslength > 0.05) {
                    if (crosslength > bestzaxisorthogonality) {
                        bestzaxisorthogonality = crosslength;
                        bestzaxis = normal;
                    }
                }
            }
            if (!bestzaxis) {
                bestzaxis = xaxis.randomNonParallelVector();
            }
            var yaxis = xaxis.cross(bestzaxis).unit();
            var zaxis = yaxis.cross(xaxis);
            var sphere = CSG.sphere({
                center: vertexobj.pos,
                radius,
                resolution,
                axes: [xaxis, yaxis, zaxis],
            });
            result = result.unionSub(sphere, false, false);
        }
        return result;
    },

    canonicalized() {
        if (this.isCanonicalized) {
            return this;
        } else {
            var factory = new CSGFuzzyCSGFactory();
            var result = factory.getCSG(this);
            result.isCanonicalized = true;
            result.isRetesselated = this.isRetesselated;
            result.properties = this.properties; // keep original properties
            return result;
        }
    },
    reTesselated() {
        if (this.isRetesselated) {
            return this;
        } else {
            var csg = this;
            var polygonsPerPlane = {};
            var isCanonicalized = csg.isCanonicalized;
            var fuzzyfactory = new CSGFuzzyCSGFactory();
            csg.polygons.map((polygon) => {
                var plane = polygon.plane;
                var shared = polygon.shared;
                if (!isCanonicalized) {
                    // in order to identify to polygons having the same plane, we need to canonicalize the planes
                    // We don't have to do a full canonizalization (including vertices), to save time only do the planes and the shared data:
                    plane = fuzzyfactory.getPlane(plane);
                    shared = fuzzyfactory.getPolygonShared(shared);
                }
                var tag = `${plane.getTag()}/${shared.getTag()}`;
                if (!(tag in polygonsPerPlane)) {
                    polygonsPerPlane[tag] = [polygon];
                } else {
                    polygonsPerPlane[tag].push(polygon);
                }
            });
            var destpolygons = [];
            for (var planetag in polygonsPerPlane) {
                var sourcepolygons = polygonsPerPlane[planetag];
                if (sourcepolygons.length < 2) {
                    destpolygons = destpolygons.concat(sourcepolygons);
                } else {
                    var retesselayedpolygons = [];
                    CSG.reTesselateCoplanarPolygons(sourcepolygons, retesselayedpolygons);
                    destpolygons = destpolygons.concat(retesselayedpolygons);
                }
            }
            var result = CSG.fromPolygons(destpolygons);
            result.isRetesselated = true;
            // result = result.canonicalized();
            result.properties = this.properties; // keep original properties
            return result;
        }
    },

    // returns an array of two CSG.Vector3Ds (minimum coordinates and maximum coordinates)
    getBounds() {
        if (!this.cachedBoundingBox) {
            var minpoint = new CSGVector3D(0, 0, 0);
            var maxpoint = new CSGVector3D(0, 0, 0);
            var polygons = this.polygons;
            var numpolygons = polygons.length;
            for (var i = 0; i < numpolygons; i++) {
                var polygon = polygons[i];
                var bounds = polygon.boundingBox();
                if (i === 0) {
                    minpoint = bounds[0];
                    maxpoint = bounds[1];
                } else {
                    minpoint = minpoint.min(bounds[0]);
                    maxpoint = maxpoint.max(bounds[1]);
                }
            }
            this.cachedBoundingBox = [minpoint, maxpoint];
        }
        return this.cachedBoundingBox;
    },
    // returns true if there is a possibility that the two solids overlap
    // returns false if we can be sure that they do not overlap
    mayOverlap(csg) {
        if ((this.polygons.length === 0) || (csg.polygons.length === 0)) {
            return false;
        } else {
            var mybounds = this.getBounds();
            var otherbounds = csg.getBounds();
            if (mybounds[1].x < otherbounds[0].x) {
                return false;
            }
            if (mybounds[0].x > otherbounds[1].x) {
                return false;
            }
            if (mybounds[1].y < otherbounds[0].y) {
                return false;
            }
            if (mybounds[0].y > otherbounds[1].y) {
                return false;
            }
            if (mybounds[1].z < otherbounds[0].z) {
                return false;
            }
            if (mybounds[0].z > otherbounds[1].z) {
                return false;
            }
            return true;
        }
    },
    // Cut the solid by a plane. Returns the solid on the back side of the plane
    cutByPlane(plane) {
        if (this.polygons.length === 0) {
            return new CSG();
        }
        // Ideally we would like to do an intersection with a polygon of inifinite size
        // but this is not supported by our implementation. As a workaround, we will create
        // a cube, with one face on the plane, and a size larger enough so that the entire
        // solid fits in the cube.
        // find the max distance of any vertex to the center of the plane:
        var planecenter = plane.normal.times(plane.w);
        var maxdistance = 0;
        this.polygons.map((polygon) => {
            polygon.vertices.map((vertex) => {
                var distance = vertex.pos.distanceToSquared(planecenter);
                if (distance > maxdistance) {
                    maxdistance = distance;
                }
            });
        });
        maxdistance = Math.sqrt(maxdistance);
        maxdistance *= 1.01; // make sure it's really larger
        // Now build a polygon on the plane, at any point farther than maxdistance from the plane center:
        var vertices = [];
        var orthobasis = new CSGOrthoNormalBasis(plane);
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(maxdistance, -maxdistance))));
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(-maxdistance, -maxdistance))));
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(-maxdistance, maxdistance))));
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(maxdistance, maxdistance))));
        var polygon = new CSGPolygon(vertices, null, plane.flipped());
        // and extrude the polygon into a cube, backwards of the plane:
        var cube = polygon.extrude(plane.normal.times(-maxdistance));
        // Now we can do the intersection:
        var result = this.intersect(cube);
        result.properties = this.properties; // keep original properties
        return result;
    },

    // Connect a solid to another solid, such that two CSG.Connectors become connected
    //   myConnector: a CSG.Connector of this solid
    //   otherConnector: a CSG.Connector to which myConnector should be connected
    //   mirror: false: the 'axis' vectors of the connectors should point in the same direction
    //           true: the 'axis' vectors of the connectors should point in opposite direction
    //   normalrotation: degrees of rotation between the 'normal' vectors of the two
    //                   connectors
    connectTo(myConnector, otherConnector, mirror, normalrotation) {
        var matrix = myConnector.getTransformationTo(otherConnector, mirror, normalrotation);
        return this.transform(matrix);
    },

    // set the .shared property of all polygons
    // Returns a new CSG solid, the original is unmodified!
    setShared(shared) {
        var polygons = this.polygons.map(p => new CSGPolygon(p.vertices, shared, p.plane));
        var result = CSG.fromPolygons(polygons);
        result.properties = this.properties; // keep original properties
        result.isRetesselated = this.isRetesselated;
        result.isCanonicalized = this.isCanonicalized;
        return result;
    },

    setColor(args) {
        var newshared = CSGPolygonShared.fromColor.apply(this, arguments);
        return this.setShared(newshared);
    },

    toCompactBinary() {
        var csg = this.canonicalized();
        var numpolygons = csg.polygons.length;
        var numpolygonvertices = 0;
        var numvertices = 0;
        var vertexmap = {};
        var vertices = [];
        var numplanes = 0;
        var planemap = {};
        var polygonindex = 0;
        var planes = [];
        var shareds = [];
        var sharedmap = {};
        var numshared = 0;
        // for (var i = 0, iMax = csg.polygons.length; i < iMax; i++) {
        //  var p = csg.polygons[i];
        //  for (var j = 0, jMax = p.length; j < jMax; j++) {
        //      ++numpolygonvertices;
        //      var vertextag = p[j].getTag();
        //      if(!(vertextag in vertexmap)) {
        //          vertexmap[vertextag] = numvertices++;
        //          vertices.push(p[j]);
        //      }
        //  }
        csg.polygons.map((p) => {
            p.vertices.map((v) => {
                ++numpolygonvertices;
                var vertextag = v.getTag();
                if (!(vertextag in vertexmap)) {
                    vertexmap[vertextag] = numvertices++;
                    vertices.push(v);
                }
            });
            var planetag = p.plane.getTag();
            if (!(planetag in planemap)) {
                planemap[planetag] = numplanes++;
                planes.push(p.plane);
            }
            var sharedtag = p.shared.getTag();
            if (!(sharedtag in sharedmap)) {
                sharedmap[sharedtag] = numshared++;
                shareds.push(p.shared);
            }
        });
        var numVerticesPerPolygon = new Uint32Array(numpolygons);
        var polygonSharedIndexes = new Uint32Array(numpolygons);
        var polygonVertices = new Uint32Array(numpolygonvertices);
        var polygonPlaneIndexes = new Uint32Array(numpolygons);
        var vertexData = new Float64Array(numvertices * 3);
        var planeData = new Float64Array(numplanes * 4);
        var polygonVerticesIndex = 0;
        for (var polygonindex = 0; polygonindex < numpolygons; ++polygonindex) {
            var p = csg.polygons[polygonindex];
            numVerticesPerPolygon[polygonindex] = p.vertices.length;
            p.vertices.map((v) => {
                var vertextag = v.getTag();
                var vertexindex = vertexmap[vertextag];
                polygonVertices[polygonVerticesIndex++] = vertexindex;
            });
            var planetag = p.plane.getTag();
            var planeindex = planemap[planetag];
            polygonPlaneIndexes[polygonindex] = planeindex;
            var sharedtag = p.shared.getTag();
            var sharedindex = sharedmap[sharedtag];
            polygonSharedIndexes[polygonindex] = sharedindex;
        }
        var verticesArrayIndex = 0;
        vertices.map((v) => {
            var pos = v.pos;
            vertexData[verticesArrayIndex++] = pos._x;
            vertexData[verticesArrayIndex++] = pos._y;
            vertexData[verticesArrayIndex++] = pos._z;
        });
        var planesArrayIndex = 0;
        planes.map((p) => {
            var normal = p.normal;
            planeData[planesArrayIndex++] = normal._x;
            planeData[planesArrayIndex++] = normal._y;
            planeData[planesArrayIndex++] = normal._z;
            planeData[planesArrayIndex++] = p.w;
        });
        var result = {
            class: 'CSG',
            numPolygons: numpolygons,
            numVerticesPerPolygon,
            polygonPlaneIndexes,
            polygonSharedIndexes,
            polygonVertices,
            vertexData,
            planeData,
            shared: shareds,
        };
        return result;
    },

    // For debugging
    // Creates a new solid with a tiny cube at every vertex of the source solid
    toPointCloud(cuberadius) {
        var csg = this.reTesselated();
        var result = new CSG();
        // make a list of all unique vertices
        // For each vertex we also collect the list of normals of the planes touching the vertices
        var vertexmap = {};
        csg.polygons.map((polygon) => {
            polygon.vertices.map((vertex) => {
                vertexmap[vertex.getTag()] = vertex.pos;
            });
        });
        for (var vertextag in vertexmap) {
            var pos = vertexmap[vertextag];
            var cube = CSG.cube({
                center: pos,
                radius: cuberadius,
            });
            result = result.unionSub(cube, false, false);
        }
        result = result.reTesselated();
        return result;
    },

    // Get the transformation that transforms this CSG such that it is lying on the z=0 plane,
    // as flat as possible (i.e. the least z-height).
    // So that it is in an orientation suitable for CNC milling
    getTransformationAndInverseTransformationToFlatLying() {
        if (this.polygons.length === 0) {
            return new CSGMatrix4x4(); // unity
        } else {
            // get a list of unique planes in the CSG:
            var csg = this.canonicalized();
            var planemap = {};
            csg.polygons.map((polygon) => {
                planemap[polygon.plane.getTag()] = polygon.plane;
            });
            // try each plane in the CSG and find the plane that, when we align it flat onto z=0,
            // gives the least height in z-direction.
            // If two planes give the same height, pick the plane that originally had a normal closest
            // to [0,0,-1].
            var xvector = new CSGVector3D(1, 0, 0);
            var yvector = new CSGVector3D(0, 1, 0);
            var zvector = new CSGVector3D(0, 0, 1);
            var z0connectorx = new CSGConnector([0, 0, 0], [0, 0, -1], xvector);
            var z0connectory = new CSGConnector([0, 0, 0], [0, 0, -1], yvector);
            var isfirst = true;
            var minheight = 0;
            var maxdotz = 0;
            var besttransformation;
            var
                bestinversetransformation;
            for (var planetag in planemap) {
                var plane = planemap[planetag];
                var pointonplane = plane.normal.times(plane.w);
                var transformation;
                var
                    inversetransformation;
                // We need a normal vecrtor for the transformation
                // determine which is more perpendicular to the plane normal: x or y?
                // we will align this as much as possible to the x or y axis vector
                var xorthogonality = plane.normal.cross(xvector).length();
                var yorthogonality = plane.normal.cross(yvector).length();
                if (xorthogonality > yorthogonality) {
                    // x is better:
                    var planeconnector = new CSGConnector(pointonplane, plane.normal, xvector);
                    transformation = planeconnector.getTransformationTo(z0connectorx, false, 0);
                    inversetransformation = z0connectorx.getTransformationTo(planeconnector, false, 0);
                } else {
                    // y is better:
                    var planeconnector = new CSGConnector(pointonplane, plane.normal, yvector);
                    transformation = planeconnector.getTransformationTo(z0connectory, false, 0);
                    inversetransformation = z0connectory.getTransformationTo(planeconnector, false, 0);
                }
                var transformedcsg = csg.transform(transformation);
                var dotz = -plane.normal.dot(zvector);
                var bounds = transformedcsg.getBounds();
                var zheight = bounds[1].z - bounds[0].z;
                var isbetter = isfirst;
                if (!isbetter) {
                    if (zheight < minheight) {
                        isbetter = true;
                    } else if (zheight === minheight) {
                        if (dotz > maxdotz) {
                            isbetter = true;
                        }
                    }
                }
                if (isbetter) {
                    // translate the transformation around the z-axis and onto the z plane:
                    var translation = new CSGVector3D([-0.5 * (bounds[1].x + bounds[0].x), -0.5 * (bounds[1].y + bounds[0].y), -bounds[0].z]);
                    transformation = transformation.multiply(CSG.Matrix4x4.translation(translation));
                    inversetransformation = CSGMatrix4x4.translation(translation.negated()).multiply(inversetransformation);
                    minheight = zheight;
                    maxdotz = dotz;
                    besttransformation = transformation;
                    bestinversetransformation = inversetransformation;
                }
                isfirst = false;
            }
            return [besttransformation, bestinversetransformation];
        }
    },

    getTransformationToFlatLying() {
        var result = this.getTransformationAndInverseTransformationToFlatLying();
        return result[0];
    },

    lieFlat() {
        var transformation = this.getTransformationToFlatLying();
        return this.transform(transformation);
    },

    // project the 3D CSG onto a plane
    // This returns a 2D CAG with the 'shadow' shape of the 3D solid when projected onto the
    // plane represented by the orthonormal basis
    projectToOrthoNormalBasis(orthobasis) {
        var EPS = 1e-5;
        var cags = [];
        this.polygons.filter(p =>
            // only return polys in plane, others may disturb result
            p.plane.normal.minus(orthobasis.plane.normal).lengthSquared() < EPS * EPS,
        )
            .map((polygon) => {
                var cag = polygon.projectToOrthoNormalBasis(orthobasis);
                if (cag.sides.length > 0) {
                    cags.push(cag);
                }
            });
        var result = new CAG().union(cags);
        return result;
    },

    sectionCut(orthobasis) {
        var EPS = 1e-5;
        var plane1 = orthobasis.plane;
        var plane2 = orthobasis.plane.flipped();
        plane1 = new CSGPlane(plane1.normal, plane1.w);
        plane2 = new CSGPlane(plane2.normal, plane2.w + 5 * EPS);
        var cut3d = this.cutByPlane(plane1);
        cut3d = cut3d.cutByPlane(plane2);
        return cut3d.projectToOrthoNormalBasis(orthobasis);
    },

    /*
         fixTJunctions:

         Suppose we have two polygons ACDB and EDGF:

          A-----B
          |     |
          |     E--F
          |     |  |
          C-----D--G

         Note that vertex E forms a T-junction on the side BD. In this case some STL slicers will complain
         that the solid is not watertight. This is because the watertightness check is done by checking if
         each side DE is matched by another side ED.

         This function will return a new solid with ACDB replaced by ACDEB

         Note that this can create polygons that are slightly non-convex (due to rounding errors). Therefore the result should
         not be used for further CSG operations!
         */
    fixTJunctions() {
        // noinspection JSAnnotator
        function addSide(vertex0, vertex1, polygonindex) {
            var starttag = vertex0.getTag();
            var endtag = vertex1.getTag();
            if (starttag === endtag) {
                throw new Error('Assertion failed');
            }
            var newsidetag = `${starttag}/${endtag}`;
            var reversesidetag = `${endtag}/${starttag}`;
            if (reversesidetag in sidemap) {
                // we have a matching reverse oriented side.
                // Instead of adding the new side, cancel out the reverse side:
                // console.log("addSide("+newsidetag+") has reverse side:");
                deleteSide(vertex1, vertex0, null);
                return null;
            }
            //  console.log("addSide("+newsidetag+")");
            var newsideobj = {
                vertex0,
                vertex1,
                polygonindex,
            };
            if (!(newsidetag in sidemap)) {
                sidemap[newsidetag] = [newsideobj];
            } else {
                sidemap[newsidetag].push(newsideobj);
            }
            if (starttag in vertextag2sidestart) {
                vertextag2sidestart[starttag].push(newsidetag);
            } else {
                vertextag2sidestart[starttag] = [newsidetag];
            }
            if (endtag in vertextag2sideend) {
                vertextag2sideend[endtag].push(newsidetag);
            } else {
                vertextag2sideend[endtag] = [newsidetag];
            }
            return newsidetag;
        }

        // noinspection JSAnnotator
        function deleteSide(vertex0, vertex1, polygonindex) {
            var starttag = vertex0.getTag();
            var endtag = vertex1.getTag();
            var sidetag = `${starttag}/${endtag}`;
            // console.log("deleteSide("+sidetag+")");
            if (!(sidetag in sidemap)) {
                throw new Error('Assertion failed');
            }
            var idx = -1;
            var sideobjs = sidemap[sidetag];
            for (var i = 0; i < sideobjs.length; i++) {
                var sideobj = sideobjs[i];
                if (sideobj.vertex0 !== vertex0) {
                    continue;
                }
                if (sideobj.vertex1 !== vertex1) {
                    continue;
                }
                if (polygonindex !== null) {
                    if (sideobj.polygonindex !== polygonindex) {
                        continue;
                    }
                }
                idx = i;
                break;
            }
            if (idx < 0) {
                throw new Error('Assertion failed');
            }
            sideobjs.splice(idx, 1);
            if (sideobjs.length === 0) {
                delete sidemap[sidetag];
            }
            idx = vertextag2sidestart[starttag].indexOf(sidetag);
            if (idx < 0) {
                throw new Error('Assertion failed');
            }
            vertextag2sidestart[starttag].splice(idx, 1);
            if (vertextag2sidestart[starttag].length === 0) {
                delete vertextag2sidestart[starttag];
            }
            idx = vertextag2sideend[endtag].indexOf(sidetag);
            if (idx < 0) {
                throw new Error('Assertion failed');
            }
            vertextag2sideend[endtag].splice(idx, 1);
            if (vertextag2sideend[endtag].length === 0) {
                delete vertextag2sideend[endtag];
            }
        }

        var csg = this.canonicalized();
        var sidemap = {};
        for (var polygonindex = 0; polygonindex < csg.polygons.length; polygonindex++) {
            var polygon = csg.polygons[polygonindex];
            var numvertices = polygon.vertices.length;
            if (numvertices >= 3) {
                // should be true
                var vertex = polygon.vertices[0];
                var vertextag = vertex.getTag();
                for (var vertexindex = 0; vertexindex < numvertices; vertexindex++) {
                    var nextvertexindex = vertexindex + 1;
                    if (nextvertexindex === numvertices) {
                        nextvertexindex = 0;
                    }
                    var nextvertex = polygon.vertices[nextvertexindex];
                    var nextvertextag = nextvertex.getTag();
                    var sidetag = `${vertextag}/${nextvertextag}`;
                    var reversesidetag = `${nextvertextag}/${vertextag}`;
                    if (reversesidetag in sidemap) {
                        // this side matches the same side in another polygon. Remove from sidemap:
                        var ar = sidemap[reversesidetag];
                        ar.splice(-1, 1);
                        if (ar.length === 0) {
                            delete sidemap[reversesidetag];
                        }
                    } else {
                        var sideobj = {
                            vertex0: vertex,
                            vertex1: nextvertex,
                            polygonindex,
                        };
                        if (!(sidetag in sidemap)) {
                            sidemap[sidetag] = [sideobj];
                        } else {
                            sidemap[sidetag].push(sideobj);
                        }
                    }
                    vertex = nextvertex;
                    vertextag = nextvertextag;
                }
            }
        }
        // now sidemap contains 'unmatched' sides
        // i.e. side AB in one polygon does not have a matching side BA in another polygon
        var vertextag2sidestart = {};
        var vertextag2sideend = {};
        var sidestocheck = {};
        var sidemapisempty = true;
        for (var sidetag in sidemap) {
            sidemapisempty = false;
            sidestocheck[sidetag] = true;
            sidemap[sidetag].map((sideobj) => {
                var starttag = sideobj.vertex0.getTag();
                var endtag = sideobj.vertex1.getTag();
                if (starttag in vertextag2sidestart) {
                    vertextag2sidestart[starttag].push(sidetag);
                } else {
                    vertextag2sidestart[starttag] = [sidetag];
                }
                if (endtag in vertextag2sideend) {
                    vertextag2sideend[endtag].push(sidetag);
                } else {
                    vertextag2sideend[endtag] = [sidetag];
                }
            });
        }
        if (!sidemapisempty) {
            // make a copy of the polygons array, since we are going to modify it:
            var polygons = csg.polygons.slice(0);

            while (true) {
                var sidemapisempty = true;
                for (var sidetag in sidemap) {
                    sidemapisempty = false;
                    sidestocheck[sidetag] = true;
                }
                if (sidemapisempty) {
                    break;
                }
                var donesomething = false;
                while (true) {
                    var sidetagtocheck = null;
                    for (var sidetag in sidestocheck) {
                        sidetagtocheck = sidetag;
                        break;
                    }
                    if (sidetagtocheck === null) {
                        break;
                    } // sidestocheck is empty, we're done!
                    var donewithside = true;
                    if (sidetagtocheck in sidemap) {
                        var sideobjs = sidemap[sidetagtocheck];
                        if (sideobjs.length === 0) {
                            throw new Error('Assertion failed');
                        }
                        var sideobj = sideobjs[0];
                        for (var directionindex = 0; directionindex < 2; directionindex++) {
                            var startvertex = (directionindex === 0) ? sideobj.vertex0 : sideobj.vertex1;
                            var endvertex = (directionindex === 0) ? sideobj.vertex1 : sideobj.vertex0;
                            var startvertextag = startvertex.getTag();
                            var endvertextag = endvertex.getTag();
                            var matchingsides = [];
                            if (directionindex === 0) {
                                if (startvertextag in vertextag2sideend) {
                                    matchingsides = vertextag2sideend[startvertextag];
                                }
                            } else {
                                if (startvertextag in vertextag2sidestart) {
                                    matchingsides = vertextag2sidestart[startvertextag];
                                }
                            }
                            for (var matchingsideindex = 0; matchingsideindex < matchingsides.length; matchingsideindex++) {
                                var matchingsidetag = matchingsides[matchingsideindex];
                                var matchingside = sidemap[matchingsidetag][0];
                                var matchingsidestartvertex = (directionindex === 0) ? matchingside.vertex0 : matchingside.vertex1;
                                var matchingsideendvertex = (directionindex === 0) ? matchingside.vertex1 : matchingside.vertex0;
                                var matchingsidestartvertextag = matchingsidestartvertex.getTag();
                                var matchingsideendvertextag = matchingsideendvertex.getTag();
                                if (matchingsideendvertextag !== startvertextag) {
                                    throw new Error('Assertion failed');
                                }
                                if (matchingsidestartvertextag === endvertextag) {
                                    // matchingside cancels sidetagtocheck
                                    deleteSide(startvertex, endvertex, null);
                                    deleteSide(endvertex, startvertex, null);
                                    donewithside = false;
                                    directionindex = 2; // skip reverse direction check
                                    donesomething = true;
                                    break;
                                } else {
                                    var startpos = startvertex.pos;
                                    var endpos = endvertex.pos;
                                    var checkpos = matchingsidestartvertex.pos;
                                    var direction = checkpos.minus(startpos);
                                    // Now we need to check if endpos is on the line startpos-checkpos:
                                    var t = endpos.minus(startpos).dot(direction) / direction.dot(direction);
                                    if ((t > 0) && (t < 1)) {
                                        var closestpoint = startpos.plus(direction.times(t));
                                        var distancesquared = closestpoint.distanceToSquared(endpos);
                                        if (distancesquared < 1e-10) {
                                            // Yes it's a t-junction! We need to split matchingside in two:
                                            var polygonindex = matchingside.polygonindex;
                                            var polygon = polygons[polygonindex];
                                            // find the index of startvertextag in polygon:
                                            var insertionvertextag = matchingside.vertex1.getTag();
                                            var insertionvertextagindex = -1;
                                            for (var i = 0; i < polygon.vertices.length; i++) {
                                                if (polygon.vertices[i].getTag() === insertionvertextag) {
                                                    insertionvertextagindex = i;
                                                    break;
                                                }
                                            }
                                            if (insertionvertextagindex < 0) {
                                                throw new Error('Assertion failed');
                                            }
                                            // split the side by inserting the vertex:
                                            var newvertices = polygon.vertices.slice(0);
                                            newvertices.splice(insertionvertextagindex, 0, endvertex);
                                            var newpolygon = new CSGPolygon(newvertices, polygon.shared /* polygon.plane */);
                                            polygons[polygonindex] = newpolygon;
                                            // remove the original sides from our maps:
                                            // deleteSide(sideobj.vertex0, sideobj.vertex1, null);
                                            deleteSide(matchingside.vertex0, matchingside.vertex1, polygonindex);
                                            var newsidetag1 = addSide(matchingside.vertex0, endvertex, polygonindex);
                                            var newsidetag2 = addSide(endvertex, matchingside.vertex1, polygonindex);
                                            if (newsidetag1 !== null) {
                                                sidestocheck[newsidetag1] = true;
                                            }
                                            if (newsidetag2 !== null) {
                                                sidestocheck[newsidetag2] = true;
                                            }
                                            donewithside = false;
                                            directionindex = 2; // skip reverse direction check
                                            donesomething = true;
                                            break;
                                        } // if(distancesquared < 1e-10)
                                    } // if( (t > 0) && (t < 1) )
                                } // if(endingstidestartvertextag === endvertextag)
                            } // for matchingsideindex
                        } // for directionindex
                    } // if(sidetagtocheck in sidemap)
                    if (donewithside) {
                        delete sidestocheck[sidetag];
                    }
                }
                if (!donesomething) {
                    break;
                }
            }
            var newcsg = CSG.fromPolygons(polygons);
            newcsg.properties = csg.properties;
            newcsg.isCanonicalized = true;
            newcsg.isRetesselated = true;
            csg = newcsg;
        } // if(!sidemapisempty)
        var sidemapisempty = true;
        for (var sidetag in sidemap) {
            sidemapisempty = false;
            break;
        }
        if (!sidemapisempty) {
            console.log('!sidemapisempty');
        }
        return csg;
    },

    toTriangles() {
        var polygons = [];
        this.polygons.forEach((poly) => {
            var firstVertex = poly.vertices[0];
            for (var i = poly.vertices.length - 3; i >= 0; i--) {
                polygons.push(new CSGPolygon([
                        firstVertex, poly.vertices[i + 1], poly.vertices[i + 2],
                    ],
                    poly.shared, poly.plane));
            }
        });
        return polygons;
    },

    // features: string, or array containing 1 or more strings of: 'volume', 'area'
    // more could be added here (Fourier coeff, moments)
    getFeatures(features) {
        if (!(features instanceof Array)) {
            features = [features];
        }
        var result = this.toTriangles().map(triPoly => triPoly.getTetraFeatures(features))
            .reduce((pv, v) => v.map((feat, i) => feat + (pv === 0 ? 0 : pv[i])), 0);
        return (result.length === 1) ? result[0] : result;
    },

    mirrored(plane) {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    },

    mirroredX() {
        var plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    },

    mirroredY() {
        var plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    },

    mirroredZ() {
        var plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    },

    translate(v) {
        return this.transform(CSGMatrix4x4.translation(v));
    },

    scale(f) {
        return this.transform(CSGMatrix4x4.scaling(f));
    },

    rotateX(deg) {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    },

    rotateY(deg) {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    },

    rotateZ(deg) {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    },

    rotate(rotationCenter, rotationAxis, degrees) {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    },

    rotateEulerAngles(alpha, beta, gamma, position) {
        position = position || [0, 0, 0];
        var Rz1 = CSGMatrix4x4.rotationZ(alpha);
        var Rx = CSGMatrix4x4.rotationX(beta);
        var Rz2 = CSGMatrix4x4.rotationZ(gamma);
        var T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    },

    center(cAxes) {
        var axes = ['x', 'y', 'z'];

        cAxes = Array.prototype.map.call(arguments, a => a.toLowerCase());
        // no args: center on all axes
        if (!cAxes.length) {
            cAxes = axes.slice();
        }
        var b = this.getBounds();

        return this.translate(axes.map(a => (cAxes.indexOf(a) > -1 ?
            -(b[0][a] + b[1][a]) / 2 : 0)));
    },

});

export {CSG};
