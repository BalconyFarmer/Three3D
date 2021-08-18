import {CSGProperties} from './CSGProperties';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGVector3D} from './CSGVector3D';
import {CSGVertex} from './CSGVertex';
import {CSGPolygon} from './CSGPolygon';
import {CSGTree} from './CSGTree';
import {CSGFuzzyCSGFactory} from './CSGFuzzyCSGFactory';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis';
import {CSGVector2D} from './CSGVector2D';
import {CSGLine2D} from './CSGLine2D';
import {CSGPolygonShared} from './CSGPolygonShared';
import {CSGPlane} from './CSGPlane';
import {CSGConnector} from './CSGConnector';
import {CAG} from './CAG';
import {InterfaceCSGVector3D} from './InterfaceCSG';

import {Geometry} from '../Scene/Geometries/Geometry';
import {Vector3} from '../Math/Vector3';
import {Mesh} from '../Scene/Mesh';
import {Matrix4} from '../Math/Matrix4';
import {BufferAttributeKind} from "../Scene/Geometries/BufferAttributeKind";
import {BufferAttribute} from "../Scene/Geometries/BufferAttribute";
import {BufferArray, int} from "../types";


function fnNumberSort(a: any, b: any): any {
    return a - b;
}

function insertSorted(array: any[], element: any, comparefunc: any) {
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

/**
 * 实体几何运算类
 */
export class CSG {

    static Vector3D = CSGVector3D;
    static Plane = CSGPlane;

    /**
     * 多边形
     */
    public polygons: any[];

    /**
     * 属性
     */
    public properties: any;

    /**
     * 规范化状态
     */
    public isCanonicalized: boolean;

    /**
     * 精细化状态
     */
    public isRetesselated: boolean;

    /**
     * 矩阵
     */
    public matrix: any;

    /**
     * 四维矩阵
     */
    static Matrix4x4 = CSGMatrix4x4;

    /**
     * 静态分类号
     */
    static staticTag: number = 1;

    /**
     * 2D分辨率
     */
    static defaultResolution2D: number = 32;

    /**
     * 3D分辨率
     */
    static defaultResolution3D: number = 12;

    public cachedBoundingBox: any[];

    /**
     * 构造函数
     */
    constructor() {
        this.polygons = [];
        this.properties = new CSGProperties();
        this.isCanonicalized = true;
        this.isRetesselated = true;
    }

    /**
     * 从BufferGeometry创建
     * @param geometry
     * @param matrix
     */
    static fromGeometry(geometry: Geometry, matrix?: Matrix4): CSG {
        // geometry = geometry.toNonIndexed();

        let position = geometry.attributes.position;

        let i;
        let j;
        let n;
        let pos;
        let
            polygon;
        let polygons = [];

        for (i = 0; i < position.count / 3; ++i) {
            let vertices = [];

            for (j = 0; j < 3; ++j) {
                n = i * 3 + j;
                pos = new CSGVector3D(position.getX(n), position.getY(n), position.getZ(n));
                vertices.push(new CSGVertex(pos));
            }

            polygon = new CSGPolygon(vertices);
            polygon.checkIfConvex();
            polygons.push(polygon);
        }

        let csg = CSG.fromPolygons(polygons);
        if (matrix != undefined) {
            let mat4 = new CSGMatrix4x4(matrix.clone().elements);
            csg = csg.transform(mat4);
        }
        return csg;
    }

    /**
     * 从Mesh创建
     * @param mesh
     */

    static fromMesh(mesh: Mesh): CSG {
        let _matrix: any;
        mesh.updateMatrix();
        _matrix = new CSGMatrix4x4(mesh.matrix.clone().elements);
        let _geometry;
        if (mesh.geometry instanceof Geometry) {
            // _geometry = new Geometry().fromBufferGeometry(mesh.geometry);
            _geometry = mesh.geometry;
        } else {
            // _geometry = mesh.geometry;
            _geometry = mesh.geometry;
            console.warn('mesh类型错误')
        }
        let csg = CSG.fromGeometry(_geometry);
        return csg.transform(_matrix);
    }

    /**
     * 转化为BufferGeometry
     * @param csg
     * @param matrix
     * @param outGeometry
     */
    static toGeometry(csg: CSG, matrix?: any, outGeometry: Geometry = new Geometry()): Geometry {

        function getGeometryVertex(vertices: any, vertex_position: any) {
            let temp = new Vector3(vertex_position.x, vertex_position.y, vertex_position.z);
            vertices.push(temp);
            return vertices.length - 1;
        }

        if (matrix != undefined) {
            let mat4 = new CSGMatrix4x4(matrix.clone().elements);
            csg = csg.transform(mat4);
        }

        let polygons = csg.toPolygons();

        let allvertices: Vector3[] = [];
        let positions: number[] = [];
        let normals: number[] = [];

        polygons.forEach(function (polygon: CSGPolygon) {
            let vertices = polygon.vertices.map((vertex: any) => getGeometryVertex(allvertices, vertex.pos));

            if (vertices[0] == vertices[vertices.length - 1]) {
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

        // outGeometry.setFromVertices(positions, normals); // 原始方法

        let _positions: BufferArray = new Float32Array(positions);
        const bufferAttributePositions = new BufferAttribute(_positions, 3)
        outGeometry.setAttribute(BufferAttributeKind.PositionKind, bufferAttributePositions)

        let _normals: BufferArray = new Float32Array(normals);
        const bufferAttributeNormals = new BufferAttribute(_positions, 3)
        outGeometry.setAttribute(BufferAttributeKind.NormalKind, bufferAttributeNormals)

        return outGeometry;
    }

    /**
     * 转化为Mesh
     * @param csg
     * @param material
     * @param outMesh
     */

    /*    static toMesh(csg: CSG, materials: any, outMesh = new Mesh()): Mesh {
            outMesh.geometry = CSG.toGeometry(csg, undefined, outMesh.geometry);
            outMesh.materials = materials;
            return outMesh;
        }*/

    /**
     * 从多边形创建
     * @param polygons
     */
    static fromPolygons(polygons: any[]): CSG {
        let csg = new CSG();
        csg.polygons = polygons;
        csg.isCanonicalized = false;
        csg.isRetesselated = false;
        return csg;
    }

    /**
     * 从切片创建
     * @param options
     */
    static fromSlices(options: any): CSG {
        const a = CSGPolygon.createFromPoints([
            [0, 0, 0],
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 0],
        ]);
        return (a.solidFromSlices(options));
    }

    // create from an untyped object with identical property names:
    /**
     * 从具有相同属性名称的无类型对象创建：
     * @param obj
     */
    static fromObject(obj: any): CSG {
        let polygons = obj.polygons.map((p: any) => CSGPolygon.fromObject(p));
        let csg = CSG.fromPolygons(polygons);
        csg = csg.canonicalized();
        return csg;
    }

    // Reconstruct a CSG from the output of toCompactBinary()
    /**
     * 从压缩二进制创建
     * @param bin
     */
    static fromCompactBinary(bin: any): CSG {
        if (bin.class != 'CSG') {
            throw new Error('Not a CSG');
        }
        let planes = [];
        let planeData = bin.planeData;
        let numplanes = planeData.length / 4;
        let arrayindex = 0;
        let x;
        let y;
        let z;
        let w;
        let normal;
        let
            plane;
        for (let planeindex = 0; planeindex < numplanes; planeindex++) {
            x = planeData[arrayindex++];
            y = planeData[arrayindex++];
            z = planeData[arrayindex++];
            w = planeData[arrayindex++];
            normal = CSGVector3D.Create(x, y, z);
            plane = new CSGPlane(normal, w);
            planes.push(plane);
        }
        let vertices = [];
        let vertexData = bin.vertexData;
        let numvertices = vertexData.length / 3;
        let pos;
        let
            vertex;
        arrayindex = 0;
        for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
            x = vertexData[arrayindex++];
            y = vertexData[arrayindex++];
            z = vertexData[arrayindex++];
            pos = CSGVector3D.Create(x, y, z);
            vertex = new CSGVertex(pos);
            vertices.push(vertex);
        }
        let shareds = bin.shared.map((shared: any) => CSGPolygonShared.fromObject(shared));
        let polygons = [];
        let numpolygons = bin.numPolygons;
        let numVerticesPerPolygon = bin.numVerticesPerPolygon;
        let polygonVertices = bin.polygonVertices;
        let polygonPlaneIndexes = bin.polygonPlaneIndexes;
        let polygonSharedIndexes = bin.polygonSharedIndexes;
        let numpolygonvertices;
        let polygonvertices;
        let shared;
        let
            polygon; // already defined plane,
        arrayindex = 0;
        for (let polygonindex = 0; polygonindex < numpolygons; polygonindex++) {
            numpolygonvertices = numVerticesPerPolygon[polygonindex];
            polygonvertices = [];
            for (let i = 0; i < numpolygonvertices; i++) {
                polygonvertices.push(vertices[polygonVertices[arrayindex++]]);
            }
            plane = planes[polygonPlaneIndexes[polygonindex]];
            shared = shareds[polygonSharedIndexes[polygonindex]];
            polygon = new CSGPolygon(polygonvertices, shared, plane);
            polygons.push(polygon);
        }
        let csg = CSG.fromPolygons(polygons);
        csg.isCanonicalized = true;
        csg.isRetesselated = true;
        return csg;
    }

    /**
     * 获取分类号
     */
    static getTag(): number {
        return CSG.staticTag++;
    }

    // Parse an option from the options object
    // If the option is not present, return the default value
    /**
     * 解析选项
     * @param options
     * @param optionname
     * @param defaultvalue
     */
    static parseOption(options: any, optionname: any, defaultvalue: any): any {
        let result = defaultvalue;
        if (options) {
            if (optionname in options) {
                result = options[optionname];
            }
        }
        return result;
    }

    // Parse an option and force into a CSG.Vector3D. If a scalar is passed it is converted
    // into a vector with equal x,y,z
    /**
     * 转化选项为3D向量
     * @param options
     * @param optionname
     * @param defaultvalue
     */
    static parseOptionAs3DVector(options: any, optionname: any, defaultvalue: any): CSGVector3D {
        let result = CSG.parseOption(options, optionname, defaultvalue);
        result = new CSGVector3D(result);
        return result;
    }

    /**
     * 解析选项为三维向量列表
     * @param options
     * @param optionname
     * @param defaultvalue
     */
    static parseOptionAs3DVectorList(options: any, optionname: any, defaultvalue: any): any {
        let result = CSG.parseOption(options, optionname, defaultvalue);
        return result.map((res: any) => new CSGVector3D(res));
    }

    // Parse an option and force into a CSG.Vector2D. If a scalar is passed it is converted
    // into a vector with equal x,y
    /**
     * 解析选项为二维向量
     * @param options
     * @param optionname
     * @param defaultvalue
     */
    static parseOptionAs2DVector(options: any, optionname: any, defaultvalue: any): CSGVector2D {
        let result = CSG.parseOption(options, optionname, defaultvalue);
        result = new CSGVector2D(result);
        return result;
    }

    /**
     * 解析选项为浮点数
     * @param options
     * @param optionname
     * @param defaultvalue
     */
    static parseOptionAsFloat(options: any, optionname: any, defaultvalue: any): any {
        let result = CSG.parseOption(options, optionname, defaultvalue);
        if (typeof (result) == 'string') {
            result = Number(result);
        }
        if (isNaN(result) || typeof (result) != 'number') {
            throw new Error(`Parameter ${optionname} should be a number`);
        }
        return result;
    }

    /**
     * 解析选项为整数
     * @param options
     * @param optionname
     * @param defaultvalue
     */
    static parseOptionAsInt(options: any, optionname: any, defaultvalue: any): any {
        let result = CSG.parseOption(options, optionname, defaultvalue);
        result = Number(Math.floor(result));
        if (isNaN(result)) {
            throw new Error(`Parameter ${optionname} should be a number`);
        }
        return result;
    }

    /**
     * 解析选项为布尔值
     * @param options
     * @param optionname
     * @param defaultvalue
     */
    static parseOptionAsBool(options: any, optionname: any, defaultvalue: any): any {
        let result = CSG.parseOption(options, optionname, defaultvalue);
        if (typeof (result) == 'string') {
            if (result == 'true') {
                result = true;
            } else if (result == 'false') {
                result = false;
            }
            // else if (result == 0) { result = false; }
        }
        result = !!result;
        return result;
    }

    /**
     * 正方形
     * @param options
     */
    static cube(options: any): CSG {
        let c: any;
        let r: any;
        options = options || {};
        if (('corner1' in options) || ('corner2' in options)) {
            if (('center' in options) || ('radius' in options)) {
                throw new Error('cube: should either give a radius and center parameter, or a corner1 and corner2 parameter');
            }
            let corner1 = CSG.parseOptionAs3DVector(options, 'corner1', [0, 0, 0]);
            let corner2 = CSG.parseOptionAs3DVector(options, 'corner2', [1, 1, 1]);
            c = corner1.plus(corner2).times(0.5);
            r = corner2.minus(corner1).times(0.5);
        } else {
            c = CSG.parseOptionAs3DVector(options, 'center', [0, 0, 0]);
            r = CSG.parseOptionAs3DVector(options, 'radius', [1, 1, 1]);
        }
        r = r.abs(); // negative radii make no sense
        let result = CSG.fromPolygons([
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
            // let normal = new CSGVector3D(info[1]);
            // let plane = new CSGPlane(normal, 1);
            let vertices = info[0].map((i: number) => {
                const falg0: number = !!(i & 1) ? 1 : 0;
                const falg1: number = !!(i & 2) ? 1 : 0;
                const falg2: number = !!(i & 4) ? 1 : 0;
                let pos = new CSGVector3D(c.x + r.x * (2 * falg0 - 1), c.y + r.y * (2 * falg1 - 1), c.z + r.z * (2 * falg2 - 1));
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
    }

    /**
     * 原形
     * @param options
     */
    static sphere(options: any): CSG {
        options = options || {};
        let center = CSG.parseOptionAs3DVector(options, 'center', [0, 0, 0]);
        let radius = CSG.parseOptionAsFloat(options, 'radius', 1);
        let resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
        let xvector;
        let yvector;
        let zvector;
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
        let qresolution = Math.round(resolution / 4);
        let prevcylinderpoint;
        let polygons = [];
        for (let slice1 = 0; slice1 <= resolution; slice1++) {
            let angle = Math.PI * 2.0 * slice1 / resolution;
            let cylinderpoint = xvector.times(Math.cos(angle)).plus(yvector.times(Math.sin(angle)));
            if (slice1 > 0) {
                // cylinder vertices:
                let vertices = [];
                let prevcospitch;
                let
                    prevsinpitch;
                for (let slice2 = 0; slice2 <= qresolution; slice2++) {
                    let pitch = 0.5 * Math.PI * slice2 / qresolution;
                    let cospitch = Math.cos(pitch);
                    let sinpitch = Math.sin(pitch);
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
        let result = CSG.fromPolygons(polygons);
        result.properties.sphere = new CSGProperties();
        result.properties.sphere.center = new CSGVector3D(center);
        result.properties.sphere.facepoint = center.plus(xvector);
        return result;
    }

    /**
     * 圆柱形
     * @param options
     */
    static cylinder(options: any): CSG {
        let s = CSG.parseOptionAs3DVector(options, 'start', [0, -1, 0]);
        let e = CSG.parseOptionAs3DVector(options, 'end', [0, 1, 0]);
        let r = CSG.parseOptionAsFloat(options, 'radius', 1);
        let rEnd = CSG.parseOptionAsFloat(options, 'radiusEnd', r);
        let rStart = CSG.parseOptionAsFloat(options, 'radiusStart', r);
        let alpha = CSG.parseOptionAsFloat(options, 'sectorAngle', 360);
        alpha = alpha > 360 ? alpha % 360 : alpha;
        if ((rEnd < 0) || (rStart < 0)) {
            throw new Error('Radius should be non-negative');
        }
        if ((rEnd == 0) && (rStart == 0)) {
            throw new Error('Either radiusStart or radiusEnd should be positive');
        }
        let slices = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
        let ray = e.minus(s);
        let axisZ = ray.unit(); // , isY = (Math.abs(axisZ.y) > 0.5);
        let axisX = axisZ.randomNonParallelVector().unit();
        //  let axisX = new CSGVector3D(isY, !isY, 0).cross(axisZ).unit();
        let axisY = axisX.cross(axisZ).unit();
        let start = new CSGVertex(s);
        let end = new CSGVertex(e);
        let polygons = [];

        function point(stack: any, slice: any, radius: any) {
            let angle = slice * Math.PI * alpha / 180;
            let out = axisX.times(Math.cos(angle)).plus(axisY.times(Math.sin(angle)));
            let pos = s.plus(ray.times(stack)).plus(out.times(radius));
            return new CSGVertex(pos);
        }

        if (alpha > 0) {
            for (let i = 0; i < slices; i++) {
                let t0 = i / slices;
                let t1 = (i + 1) / slices;
                if (rEnd == rStart) {
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
        let result = CSG.fromPolygons(polygons);
        result.properties.cylinder = new CSGProperties();
        result.properties.cylinder.start = new CSGConnector(s, axisZ.negated(), axisX);
        result.properties.cylinder.end = new CSGConnector(e, axisZ, axisX);
        let cylCenter = s.plus(ray.times(0.5));
        let fptVec = axisX.rotate(s, axisZ, -alpha / 2).times((rStart + rEnd) / 2);
        let fptVec90 = fptVec.cross(axisZ);
        // note this one is NOT a face normal for a cone. - It's horizontal from cyl perspective
        result.properties.cylinder.facepointH = new CSGConnector(cylCenter.plus(fptVec), fptVec, axisZ);
        result.properties.cylinder.facepointH90 = new CSGConnector(cylCenter.plus(fptVec90), fptVec90, axisZ);
        return result;
    }

    /**
     * 圆柱形圆角
     * @param options
     */
    static roundedCylinder(options: any): CSG {
        let p1 = CSG.parseOptionAs3DVector(options, 'start', [0, -1, 0]);
        let p2 = CSG.parseOptionAs3DVector(options, 'end', [0, 1, 0]);
        let radius = CSG.parseOptionAsFloat(options, 'radius', 1);
        let direction = p2.minus(p1);
        let defaultnormal;
        if (Math.abs(direction.x) > Math.abs(direction.y)) {
            defaultnormal = new CSGVector3D(0, 1, 0);
        } else {
            defaultnormal = new CSGVector3D(1, 0, 0);
        }
        let normal = CSG.parseOptionAs3DVector(options, 'normal', defaultnormal);
        let resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
        if (resolution < 4) {
            resolution = 4;
        }
        let polygons = [];
        let qresolution = Math.floor(0.25 * resolution);
        let length = direction.length();
        if (length < 1e-10) {
            return CSG.sphere({
                center: p1,
                radius,
                resolution,
            });
        }
        let zvector = direction.unit().times(radius);
        let xvector = zvector.cross(normal).unit().times(radius);
        let yvector = xvector.cross(zvector).unit().times(radius);
        let prevcylinderpoint: any;
        for (let slice1 = 0; slice1 <= resolution; slice1++) {
            let angle = Math.PI * 2.0 * slice1 / resolution;
            let cylinderpoint = xvector.times(Math.cos(angle)).plus(yvector.times(Math.sin(angle)));
            if (slice1 > 0) {
                // cylinder vertices:
                let vertices = [];
                vertices.push(new CSGVertex(p1.plus(cylinderpoint)));
                vertices.push(new CSGVertex(p1.plus(prevcylinderpoint)));
                vertices.push(new CSGVertex(p2.plus(prevcylinderpoint)));
                vertices.push(new CSGVertex(p2.plus(cylinderpoint)));
                polygons.push(new CSGPolygon(vertices));
                let prevcospitch: any;
                let prevsinpitch: any;
                for (let slice2 = 0; slice2 <= qresolution; slice2++) {
                    let pitch = 0.5 * Math.PI * slice2 / qresolution;
                    // let pitch = Math.asin(slice2/qresolution);
                    let cospitch = Math.cos(pitch);
                    let sinpitch = Math.sin(pitch);
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
        let result = CSG.fromPolygons(polygons);
        let ray = zvector.unit();
        let axisX = xvector.unit();
        result.properties.roundedCylinder = new CSGProperties();
        result.properties.roundedCylinder.start = new CSGConnector(p1, ray.negated(), axisX);
        result.properties.roundedCylinder.end = new CSGConnector(p2, ray, axisX);
        result.properties.roundedCylinder.facepoint = p1.plus(xvector);
        return result;
    }

    /**
     * 正方形圆角
     * @param options
     */
    static roundedCube(options: any): CSG {
        let EPS = 1e-5;
        let minRR = 1e-2; // minroundradius 1e-3 gives rounding errors already
        let center;
        let cuberadius;
        options = options || {};
        if (('corner1' in options) || ('corner2' in options)) {
            if (('center' in options) || ('radius' in options)) {
                throw new Error('roundedCube: should either give a radius and center parameter, or a corner1 and corner2 parameter');
            }
            let corner1 = CSG.parseOptionAs3DVector(options, 'corner1', [0, 0, 0]);
            let corner2 = CSG.parseOptionAs3DVector(options, 'corner2', [1, 1, 1]);
            center = corner1.plus(corner2).times(0.5);
            cuberadius = corner2.minus(corner1).times(0.5);
        } else {
            center = CSG.parseOptionAs3DVector(options, 'center', [0, 0, 0]);
            cuberadius = CSG.parseOptionAs3DVector(options, 'radius', [1, 1, 1]);
        }
        cuberadius = cuberadius.abs(); // negative radii make no sense
        let resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
        if (resolution < 4) {
            resolution = 4;
        }
        if (resolution % 2 == 1 && resolution < 8) {
            resolution = 8;
        } // avoid ugly
        let roundradius = CSG.parseOptionAs3DVector(options, 'roundradius', [0.2, 0.2, 0.2]);
        // slight hack for now - total radius stays ok
        roundradius = CSG.Vector3D.Create(Math.max(roundradius.x, minRR), Math.max(roundradius.y, minRR), Math.max(roundradius.z, minRR));
        let innerradius = cuberadius.minus(roundradius);
        if (innerradius.x < 0 || innerradius.y < 0 || innerradius.z < 0) {
            throw ('roundradius <= radius!');
        }
        let res = CSG.sphere({
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
    }

    // solve 2x2 linear equation:
    // [ab][x] = [u]
    // [cd][y]   [v]
    /**
     * 平行线
     * @param a
     * @param b
     * @param c
     * @param d
     * @param u
     * @param v
     */
    static solve2Linear(a: number, b: number, c: number, d: number, u: number, v: number) {
        let det = a * d - b * c;
        let invdet = 1.0 / det;
        let x = u * d - b * v;
        let y = -u * c + a * v;
        x *= invdet;
        y *= invdet;
        return [x, y];
    }

    /**
     * 多面体
     * @param options
     */
    static polyhedron(options: any): CSG {
        options = options || {};
        if (('points' in options) != ('faces' in options)) {
            throw new Error("polyhedron needs 'points' and 'faces' arrays");
        }

        let vertices = CSG.parseOptionAs3DVectorList(options, 'points', [
            [1, 1, 0],
            [1, -1, 0],
            [-1, -1, 0],
            [-1, 1, 0],
            [0, 0, 1],
        ])
            .map((pt: any) => new CSGVertex(pt));

        let faces = CSG.parseOption(options, 'faces', [
            [0, 1, 4],
            [1, 2, 4],
            [2, 3, 4],
            [3, 0, 4],
            [1, 0, 3],
            [2, 1, 3],
        ]);

        // openscad convention defines inward normals - so we have to invert here
        faces.forEach((face: any) => {
            face.reverse();
        });

        let polygons = faces.map((face: any) => new CSGPolygon(face.map((idx: any) => vertices[idx])));

        // TODO: facecenters as connectors? probably overkill. Maybe centroid
        // the re-tesselation here happens because it's so easy for a user to
        // create parametrized polyhedrons that end up with 1-2 dimensional polygons.
        // These will create infinite loops at CSG.Tree()
        return CSG.fromPolygons(polygons).reTesselated();
    }

    /**
     * 判断浮点型
     * @param n
     * @constructor
     */
    static IsFloat(n: any): boolean {
        return (!isNaN(n)) || (n == Infinity) || (n == -Infinity);
    }

    // Get the x coordinate of a point with a certain y coordinate, interpolated between two
    // points (CSG.Vector2D).
    // Interpolation is robust even if the points have the same y coordinate
    /**
     * 获取点之间具有一定y坐标的x坐标
     * @param point1
     * @param point2
     * @param y
     */
    static interpolateBetween2DPointsForY(point1: any, point2: any, y: any): number {
        let f1 = y - point1.y;
        let f2 = point2.y - point1.y;
        if (f2 < 0) {
            f1 = -f1;
            f2 = -f2;
        }
        let t;
        if (f1 <= 0) {
            t = 0.0;
        } else if (f1 >= f2) {
            t = 1.0;
        } else if (f2 < 1e-10) {
            t = 0.5;
        } else {
            t = f1 / f2;
        }
        let result = point1.x + t * (point2.x - point1.x);
        return result;
    }

    // Retesselation function for a set of coplanar polygons. See the introduction at the top of
    // this file.
    /**
     * 一组共面多边形的重新镶嵌功能 // TODO
     * @param sourcepolygons
     * @param destpolygons
     */
    static reTesselateCoplanarPolygons(sourcepolygons: any, destpolygons: any) {
        let EPS = 1e-5;
        let numpolygons = sourcepolygons.length;
        if (numpolygons > 0) {
            let plane = sourcepolygons[0].plane;
            let shared = sourcepolygons[0].shared;
            let orthobasis = new CSGOrthoNormalBasis(plane);
            let polygonvertices2d = []; // array of array of CSG.Vector2D
            let polygontopvertexindexes = []; // array of indexes of topmost vertex per polygon
            let topy2polygonindexes: any = {};
            let ycoordinatetopolygonindexes: any = {};
            let xcoordinatebins = {};
            let ycoordinatebins: any = {};
            // convert all polygon vertices to 2D
            // Make a list of all encountered y coordinates
            // And build a map of all polygons that have a vertex at a certain y coordinate:
            let ycoordinateBinningFactor = 1.0 / EPS * 10;
            for (let polygonindex = 0; polygonindex < numpolygons; polygonindex++) {
                let poly3d = sourcepolygons[polygonindex];
                let vertices2d = [];
                let numvertices = poly3d.vertices.length;
                let minindex = -1;
                if (numvertices > 0) {
                    let miny: number = -1.7976931348623157E+103088;
                    let maxy: number = Infinity;
                    let maxindex: number;
                    for (let i = 0; i < numvertices; i++) {
                        let pos2d = orthobasis.to2D(poly3d.vertices[i].pos);
                        // perform binning of y coordinates: If we have multiple vertices very
                        // close to each other, give them the same y coordinate:
                        let ycoordinatebin = Math.floor(pos2d.y * ycoordinateBinningFactor);
                        let newy;
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
                        let y = pos2d.y;
                        if ((i == 0) || (y < miny)) {
                            miny = y;
                            minindex = i;
                        }
                        if ((i == 0) || (y > maxy)) {
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
            let ycoordinates = [];
            for (let ycoordinate in ycoordinatetopolygonindexes) {
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
            let activepolygons: any[] = [];
            let prevoutpolygonrow: any[] = [];
            for (let yindex = 0; yindex < ycoordinates.length; yindex++) {
                let newoutpolygonrow: any = [];
                let ycoordinate_as_string = ycoordinates[yindex];
                let ycoordinate = Number(ycoordinate_as_string);
                // update activepolygons for this y coordinate:
                // - Remove any polygons that end at this y coordinate
                // - update leftvertexindex and rightvertexindex (which point to the current vertex index
                //   at the the left and right side of the polygon
                // Iterate over all polygons that have a corner at this y coordinate:
                let polygonindexeswithcorner = ycoordinatetopolygonindexes[ycoordinate_as_string];
                for (let activepolygonindex = 0; activepolygonindex < activepolygons.length; ++activepolygonindex) {
                    let activepolygon = activepolygons[activepolygonindex];
                    let polygonindex = activepolygon.polygonindex;
                    if (polygonindexeswithcorner[polygonindex]) {
                        // this active polygon has a corner at this y coordinate:
                        let vertices2d = polygonvertices2d[polygonindex];
                        let numvertices = vertices2d.length;
                        let newleftvertexindex = activepolygon.leftvertexindex;
                        let newrightvertexindex = activepolygon.rightvertexindex;
                        // See if we need to increase leftvertexindex or decrease rightvertexindex:
                        while (true) {
                            let nextleftvertexindex = newleftvertexindex + 1;
                            if (nextleftvertexindex >= numvertices) {
                                nextleftvertexindex = 0;
                            }
                            if (vertices2d[nextleftvertexindex].y != ycoordinate) {
                                break;
                            }
                            newleftvertexindex = nextleftvertexindex;
                        }
                        let nextrightvertexindex = newrightvertexindex - 1;
                        if (nextrightvertexindex < 0) {
                            nextrightvertexindex = numvertices - 1;
                        }
                        if (vertices2d[nextrightvertexindex].y == ycoordinate) {
                            newrightvertexindex = nextrightvertexindex;
                        }
                        if ((newleftvertexindex != activepolygon.leftvertexindex) && (newleftvertexindex == newrightvertexindex)) {
                            // We have increased leftvertexindex or decreased rightvertexindex, and now they point to the same vertex
                            // This means that this is the bottom point of the polygon. We'll remove it:
                            activepolygons.splice(activepolygonindex, 1);
                            --activepolygonindex;
                        } else {
                            activepolygon.leftvertexindex = newleftvertexindex;
                            activepolygon.rightvertexindex = newrightvertexindex;
                            activepolygon.topleft = vertices2d[newleftvertexindex];
                            activepolygon.topright = vertices2d[newrightvertexindex];
                            let nextleftvertexindex = newleftvertexindex + 1;
                            if (nextleftvertexindex >= numvertices) {
                                nextleftvertexindex = 0;
                            }
                            activepolygon.bottomleft = vertices2d[nextleftvertexindex];
                            let nextrightvertexindex = newrightvertexindex - 1;
                            if (nextrightvertexindex < 0) {
                                nextrightvertexindex = numvertices - 1;
                            }
                            activepolygon.bottomright = vertices2d[nextrightvertexindex];
                        }
                    } // if polygon has corner here
                } // for activepolygonindex
                let nextycoordinate: any;
                if (yindex >= ycoordinates.length - 1) {
                    // last row, all polygons must be finished here:
                    activepolygons = [];
                    nextycoordinate = null;
                } else {
                    // yindex < ycoordinates.length-1
                    nextycoordinate = Number(ycoordinates[yindex + 1]);
                    let middleycoordinate = 0.5 * (ycoordinate + nextycoordinate);
                    // update activepolygons by adding any polygons that start here:
                    let startingpolygonindexes = topy2polygonindexes[ycoordinate_as_string];
                    for (let polygonindex_key in startingpolygonindexes) {
                        let polygonindex = startingpolygonindexes[polygonindex_key];
                        let vertices2d = polygonvertices2d[polygonindex];
                        let numvertices = vertices2d.length;
                        let topvertexindex = polygontopvertexindexes[polygonindex];
                        // the top of the polygon may be a horizontal line. In that case topvertexindex can point to any point on this line.
                        // Find the left and right topmost vertices which have the current y coordinate:
                        let topleftvertexindex = topvertexindex;
                        while (true) {
                            let i = topleftvertexindex + 1;
                            if (i >= numvertices) {
                                i = 0;
                            }
                            if (vertices2d[i].y != ycoordinate) {
                                break;
                            }
                            if (i == topvertexindex) {
                                break;
                            } // should not happen, but just to prevent endless loops
                            topleftvertexindex = i;
                        }
                        let toprightvertexindex = topvertexindex;
                        while (true) {
                            let i = toprightvertexindex - 1;
                            if (i < 0) {
                                i = numvertices - 1;
                            }
                            if (vertices2d[i].y != ycoordinate) {
                                break;
                            }
                            if (i == topleftvertexindex) {
                                break;
                            } // should not happen, but just to prevent endless loops
                            toprightvertexindex = i;
                        }
                        let nextleftvertexindex = topleftvertexindex + 1;
                        if (nextleftvertexindex >= numvertices) {
                            nextleftvertexindex = 0;
                        }
                        let nextrightvertexindex = toprightvertexindex - 1;
                        if (nextrightvertexindex < 0) {
                            nextrightvertexindex = numvertices - 1;
                        }
                        let newactivepolygon = {
                            polygonindex,
                            leftvertexindex: topleftvertexindex,
                            rightvertexindex: toprightvertexindex,
                            topleft: vertices2d[topleftvertexindex],
                            topright: vertices2d[toprightvertexindex],
                            bottomleft: vertices2d[nextleftvertexindex],
                            bottomright: vertices2d[nextrightvertexindex],
                        };
                        insertSorted(activepolygons, newactivepolygon, (el1: any, el2: any) => {
                            let x1 = CSG.interpolateBetween2DPointsForY(
                                el1.topleft, el1.bottomleft, middleycoordinate);
                            let x2 = CSG.interpolateBetween2DPointsForY(
                                el2.topleft, el2.bottomleft, middleycoordinate);
                            if (x1 > x2) {
                                return 1;
                            }
                            if (x1 < x2) {
                                return -1;
                            }
                            return 0;
                        });
                    } // for(let polygonindex in startingpolygonindexes)
                } //  yindex < ycoordinates.length-1
                // if( (yindex == ycoordinates.length-1) || (nextycoordinate - ycoordinate > EPS) )
                if (true) {
                    // Now activepolygons is up to date
                    // Build the output polygons for the next row in newoutpolygonrow:
                    for (let activepolygon_key in activepolygons) {
                        let activepolygon = activepolygons[activepolygon_key];
                        let polygonindex = activepolygon.polygonindex;
                        let vertices2d = polygonvertices2d[polygonindex];
                        let numvertices = vertices2d.length;
                        let x = CSG.interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, ycoordinate);
                        let topleft = CSGVector2D.Create(x, ycoordinate);
                        x = CSG.interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, ycoordinate);
                        let topright = CSGVector2D.Create(x, ycoordinate);
                        x = CSG.interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, nextycoordinate);
                        let bottomleft = CSGVector2D.Create(x, nextycoordinate);
                        x = CSG.interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, nextycoordinate);
                        let bottomright = CSGVector2D.Create(x, nextycoordinate);
                        let outpolygon = {
                            topleft,
                            topright,
                            bottomleft,
                            bottomright,
                            leftline: CSGLine2D.fromPoints(topleft, bottomleft),
                            rightline: CSGLine2D.fromPoints(bottomright, topright),
                        };
                        if (newoutpolygonrow.length > 0) {
                            let prevoutpolygon = newoutpolygonrow[newoutpolygonrow.length - 1];
                            let d1 = outpolygon.topleft.distanceTo(prevoutpolygon.topright);
                            let d2 = outpolygon.bottomleft.distanceTo(prevoutpolygon.bottomright);
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
                        let prevcontinuedindexes: any = {};
                        let matchedindexes: any = {};
                        for (let i = 0; i < newoutpolygonrow.length; i++) {
                            let thispolygon = newoutpolygonrow[i];
                            for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
                                if (!matchedindexes[ii]) {
                                    // not already processed?
                                    // We have a match if the sidelines are equal or if the top coordinates
                                    // are on the sidelines of the previous polygon
                                    let prevpolygon = prevoutpolygonrow[ii];
                                    if (prevpolygon.bottomleft.distanceTo(thispolygon.topleft) < EPS) {
                                        if (prevpolygon.bottomright.distanceTo(thispolygon.topright) < EPS) {
                                            // Yes, the top of this polygon matches the bottom of the previous:
                                            matchedindexes[ii] = true;
                                            // Now check if the joined polygon would remain convex:
                                            let d1 = thispolygon.leftline.direction().x - prevpolygon.leftline.direction().x;
                                            let d2 = thispolygon.rightline.direction().x - prevpolygon.rightline.direction().x;
                                            let leftlinecontinues = Math.abs(d1) < EPS;
                                            let rightlinecontinues = Math.abs(d2) < EPS;
                                            let leftlineisconvex = leftlinecontinues || (d1 >= 0);
                                            let rightlineisconvex = rightlinecontinues || (d2 >= 0);
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
                        for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
                            if (!prevcontinuedindexes[ii]) {
                                // polygon ends here
                                // Finish the polygon with the last point(s):
                                let prevpolygon = prevoutpolygonrow[ii];
                                prevpolygon.outpolygon.rightpoints.push(prevpolygon.bottomright);
                                if (prevpolygon.bottomright.distanceTo(prevpolygon.bottomleft) > EPS) {
                                    // polygon ends with a horizontal line:
                                    prevpolygon.outpolygon.leftpoints.push(prevpolygon.bottomleft);
                                }
                                // reverse the left half so we get a counterclockwise circle:
                                prevpolygon.outpolygon.leftpoints.reverse();
                                let points2d = prevpolygon.outpolygon.rightpoints.concat(prevpolygon.outpolygon.leftpoints);
                                let vertices3d: any = [];
                                points2d.map((point2d: any) => {
                                    let point3d = orthobasis.to3D(point2d);
                                    let vertex3d = new CSGVertex(point3d);
                                    vertices3d.push(vertex3d);
                                });
                                let polygon = new CSGPolygon(vertices3d, shared, plane);
                                destpolygons.push(polygon);
                            }
                        }
                    } // if(yindex > 0)
                    for (let i = 0; i < newoutpolygonrow.length; i++) {
                        let thispolygon = newoutpolygonrow[i];
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
    }

    /**
     * 获取多边形
     */
    public toPolygons(): any[] {
        return this.polygons;
    }

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
    /**
     * 求并集
     * @param csg
     */
    public union(csg: CSG | any[]): CSG {
        let csgs;
        if (csg instanceof Array) {
            csgs = csg.slice(0);
            csgs.push(this);
        } else {
            csgs = [this, csg];
        }
        // combine csg pairs in a way that forms a balanced binary tree pattern
        let _i: number = 1;
        for (let i = 1; i < csgs.length; i += 2) {
            csgs.push(csgs[i - 1].unionSub(csgs[i]));
            _i = i;
        }
        return csgs[_i - 1].reTesselated().canonicalized();
    }

    /**
     * 联合子类型
     * @param csg
     * @param retesselate
     * @param canonicalize
     */
    public unionSub(csg: CSG, retesselate: boolean, canonicalize: boolean): CSG {
        if (!this.mayOverlap(csg)) {
            return this.unionForNonIntersecting(csg);
        } else {
            let a = new CSGTree(this.polygons);
            let b = new CSGTree(csg.polygons);
            a.clipTo(b, false);
            // b.clipTo(a, true); // ERROR: this doesn't work
            b.clipTo(a);
            b.invert();
            b.clipTo(a);
            b.invert();
            let newpolygons = a.allPolygons().concat(b.allPolygons());
            let result = CSG.fromPolygons(newpolygons);
            result.properties = this.properties._merge(csg.properties);
            if (retesselate) {
                result = result.reTesselated();
            }
            if (canonicalize) {
                result = result.canonicalized();
            }
            return result;
        }
    }

    // Like union, but when we know that the two solids are not intersecting
    // Do not use if you are not completely sure that the solids do not intersect!
    /**
     * 联合,但是两实体未相交
     * @param csg
     */
    public unionForNonIntersecting(csg: CSG): CSG {
        let newpolygons = this.polygons.concat(csg.polygons);
        let result = CSG.fromPolygons(newpolygons);
        result.properties = this.properties._merge(csg.properties);
        result.isCanonicalized = this.isCanonicalized && csg.isCanonicalized;
        result.isRetesselated = this.isRetesselated && csg.isRetesselated;
        return result;
    }

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
    /**
     * 减去
     * @param csg
     */
    public subtract(csg: CSG | CSG[]): CSG {
        let csgs;
        if (csg instanceof Array) {
            csgs = csg;
        } else {
            csgs = [csg];
        }
        let result: any = this;
        for (let i = 0; i < csgs.length; i++) {
            let islast = (i == (csgs.length - 1));
            result = result.subtractSub(csgs[i], islast, islast);
        }
        return result;
    }

    /**
     * 减去
     * @param csg
     * @param retesselate
     * @param canonicalize
     */
    public subtractSub(csg: CSG, retesselate: boolean, canonicalize: boolean): CSG {
        let a = new CSGTree(this.polygons);
        let b = new CSGTree(csg.polygons);
        a.invert();
        a.clipTo(b);
        b.clipTo(a, true);
        a.addPolygons(b.allPolygons());
        a.invert();
        let result = CSG.fromPolygons(a.allPolygons());
        result.properties = this.properties._merge(csg.properties);
        if (retesselate) {
            result = result.reTesselated();
        }
        if (canonicalize) {
            result = result.canonicalized();
        }
        return result;
    }

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
    /**
     * 求交
     * @param csg
     */
    public intersect(csg: CSG): any {
        let csgs;
        if (csg instanceof Array) {
            csgs = csg;
        } else {
            csgs = [csg];
        }
        let result: any = this;
        for (let i = 0; i < csgs.length; i++) {
            let islast = (i == (csgs.length - 1));
            result = result.intersectSub(csgs[i], islast, islast);
        }
        return result;
    }

    /**
     * 求交子对象
     * @param csg
     * @param retesselate
     * @param canonicalize
     */
    public intersectSub(csg: CSG, retesselate?: any, canonicalize?: any): CSG {
        let a = new CSGTree(this.polygons);
        let b = new CSGTree(csg.polygons);
        a.invert();
        b.clipTo(a);
        b.invert();
        a.clipTo(b);
        b.clipTo(a);
        a.addPolygons(b.allPolygons());
        a.invert();
        let result = CSG.fromPolygons(a.allPolygons());
        result.properties = this.properties._merge(csg.properties);
        if (retesselate) {
            result = result.reTesselated();
        }
        if (canonicalize) {
            result = result.canonicalized();
        }
        return result;
    }

    // Return a new CSG solid with solid and empty space switched. This solid is
    // not modified.
    /**
     * 返回一个新的CSG实体，其中已切换了实体空间和空白空间。
     */
    public invert(): CSG {
        let flippedpolygons = this.polygons.map((p) => p.flipped());
        return CSG.fromPolygons(flippedpolygons);
    }

    // Affine transformation of CSG object. Returns a new CSG object
    /**
     * CSG对象的仿射变换。返回一个新的CSG对象
     * @param matrix4x4
     */
    public transform1(matrix4x4: CSGMatrix4x4): CSG {
        let newpolygons = this.polygons.map((p) => p.transform(matrix4x4));
        let result = CSG.fromPolygons(newpolygons);
        result.properties = this.properties._transform(matrix4x4);
        result.isRetesselated = this.isRetesselated;
        return result;
    }

    /**
     * 转换
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSG {
        let ismirror = matrix4x4.isMirroring();
        let transformedvertices: any = {};
        let transformedplanes: any = {};
        let newpolygons = this.polygons.map((p) => {
            let newplane;
            let plane = p.plane;
            let planetag = plane.getTag();
            if (planetag in transformedplanes) {
                newplane = transformedplanes[planetag];
            } else {
                newplane = plane.transform(matrix4x4);
                transformedplanes[planetag] = newplane;
            }
            let newvertices = p.vertices.map((v: any) => {
                let newvertex;
                let vertextag = v.getTag();
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
        let result = CSG.fromPolygons(newpolygons);
        result.properties = this.properties._transform(matrix4x4);
        result.isRetesselated = this.isRetesselated;
        result.isCanonicalized = this.isCanonicalized;
        return result;
    }

    /**
     * 转为字符串
     */
    public toString(): string {
        let result = 'CSG solid:\n';
        this.polygons.map((p) => {
            result += p.toString();
        });
        return result;
    }

    // Expand the solid
    // resolution: number of points per 360 degree for the rounded corners
    /**
     * 挤出实体
     * @param radius
     * @param resolution
     */
    public expand(radius: number, resolution: number): CSG {
        let result = this.expandedShell(radius, resolution, true);
        result = result.reTesselated();
        result.properties = this.properties; // keep original properties
        return result;
    }

    // Contract the solid
    // resolution: number of points per 360 degree for the rounded corners
    /**
     * 收缩实体
     * @param radius
     * @param resolution
     */
    public contract(radius: number, resolution: number): CSG {
        let expandedshell = this.expandedShell(radius, resolution, false);
        let result = this.subtract(expandedshell);
        result = result.reTesselated();
        result.properties = this.properties; // keep original properties
        return result;
    }

    // cut the solid at a plane, and stretch the cross-section found along plane normal
    /**
     * 用平面切割实体
     * @param normal
     * @param point
     * @param length
     */
    public stretchAtPlane(normal: CSGVector3D | any[], point: CSGVector3D | any[], length: any): CSG {
        let plane = CSG.Plane.fromNormalAndPoint(normal, point);
        let onb = new CSGOrthoNormalBasis(plane);
        let crosssect = this.sectionCut(onb);
        let midpiece = crosssect.extrudeInOrthonormalBasis(onb, length);
        let piece1 = this.cutByPlane(plane);
        let piece2 = this.cutByPlane(plane.flipped());
        let result = piece1.union([midpiece, piece2.translate(plane.normal.times(length))]);
        return result;
    }

    // Create the expanded shell of the solid:
    // All faces are extruded to get a thickness of 2*radius
    // Cylinders are constructed around every side
    // Spheres are placed on every vertex
    // unionWithThis: if true, the resulting solid will be united with 'this' solid;
    //   the result is a true expansion of the solid
    //   If false, returns only the shell
    /**
     * 创建实体的扩充壳
     * @param radius
     * @param resolution
     * @param unionWithThis
     */
    public expandedShell(radius: number, resolution: number, unionWithThis: boolean): CSG {
        let csg = this.reTesselated();
        let result: any;
        if (unionWithThis) {
            result = csg;
        } else {
            result = new CSG();
        }

        // first extrude all polygons:
        csg.polygons.map((polygon) => {
            let extrudevector = polygon.plane.normal.unit().times(2 * radius);
            let translatedpolygon = polygon.translate(extrudevector.times(-0.5));
            let extrudedface = translatedpolygon.extrude(extrudevector);
            result = result.unionSub(extrudedface, false, false);
        });
        // Make a list of all unique vertex pairs (i.e. all sides of the solid)
        // For each vertex pair we collect the following:
        //   v1: first coordinate
        //   v2: second coordinate
        //   planenormals: array of normal vectors of all planes touching this side
        let vertexpairs: any = {}; // map of 'vertex pair tag' to {v1, v2, planenormals}
        csg.polygons.map((polygon) => {
            let numvertices = polygon.vertices.length;
            let prevvertex = polygon.vertices[numvertices - 1];
            let prevvertextag = prevvertex.getTag();
            for (let i = 0; i < numvertices; i++) {
                let vertex = polygon.vertices[i];
                let vertextag = vertex.getTag();
                let vertextagpair;
                if (vertextag < prevvertextag) {
                    vertextagpair = `${vertextag}-${prevvertextag}`;
                } else {
                    vertextagpair = `${prevvertextag}-${vertextag}`;
                }
                let obj;
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
        for (let vertextagpair in vertexpairs) {
            let vertexpair = vertexpairs[vertextagpair];
            let startpoint = vertexpair.v1.pos;
            let endpoint = vertexpair.v2.pos;
            // our x,y and z vectors:
            let zbase = endpoint.minus(startpoint).unit();
            let xbase = vertexpair.planenormals[0].unit();
            let ybase = xbase.cross(zbase);
            // make a list of angles that the cylinder should traverse:
            let angles = [];
            // first of all equally spaced around the cylinder:
            for (let i = 0; i < resolution; i++) {
                angles.push(i * Math.PI * 2 / resolution);
            }
            // and also at every normal of all touching planes:
            for (let i = 0, iMax = vertexpair.planenormals.length; i < iMax; i++) {
                let planenormal = vertexpair.planenormals[i];
                let si = ybase.dot(planenormal);
                let co = xbase.dot(planenormal);
                let angle = Math.atan2(si, co);
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
            let numangles = angles.length;
            let prevp1;
            let prevp2;
            let startfacevertices = [];
            let endfacevertices = [];
            let polygons = [];
            for (let i = -1; i < numangles; i++) {
                let angle = angles[(i < 0) ? (i + numangles) : i];
                let si = Math.sin(angle);
                let co = Math.cos(angle);
                let p = xbase.times(co * radius).plus(ybase.times(si * radius));
                let p1 = startpoint.plus(p);
                let p2 = endpoint.plus(p);
                let skip = false;
                if (i >= 0) {
                    if (p1.distanceTo(prevp1) < 1e-5) {
                        skip = true;
                    }
                }
                if (!skip) {
                    if (i >= 0) {
                        startfacevertices.push(new CSGVertex(p1));
                        endfacevertices.push(new CSGVertex(p2));
                        let polygonvertices = [
                            new CSGVertex(prevp2),
                            new CSGVertex(p2),
                            new CSGVertex(p1),
                            new CSGVertex(prevp1),
                        ];
                        let polygon = new CSGPolygon(polygonvertices);
                        polygons.push(polygon);
                    }
                    prevp1 = p1;
                    prevp2 = p2;
                }
            }
            endfacevertices.reverse();
            polygons.push(new CSGPolygon(startfacevertices));
            polygons.push(new CSGPolygon(endfacevertices));
            let cylinder = CSG.fromPolygons(polygons);
            result = result.unionSub(cylinder, false, false);
        }

        // make a list of all unique vertices
        // For each vertex we also collect the list of normals of the planes touching the vertices
        let vertexmap: any = {};
        csg.polygons.map((polygon) => {
            polygon.vertices.map((vertex: any) => {
                let vertextag = vertex.getTag();
                let obj;
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
        for (let vertextag in vertexmap) {
            let vertexobj = vertexmap[vertextag];
            // use the first normal to be the x axis of our sphere:
            let xaxis = vertexobj.normals[0].unit();
            // and find a suitable z axis. We will use the normal which is most perpendicular to the x axis:
            let bestzaxis = null;
            let bestzaxisorthogonality = 0;
            for (let i = 1; i < vertexobj.normals.length; i++) {
                let normal = vertexobj.normals[i].unit();
                let cross = xaxis.cross(normal);
                let crosslength = cross.length();
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
            let yaxis = xaxis.cross(bestzaxis).unit();
            let zaxis = yaxis.cross(xaxis);
            let sphere = CSG.sphere({
                center: vertexobj.pos,
                radius,
                resolution,
                axes: [xaxis, yaxis, zaxis],
            });
            result = result.unionSub(sphere, false, false);
        }
        return result;
    }

    /**
     * 规范化
     */
    public canonicalized(): CSG {
        if (this.isCanonicalized) {
            return this;
        } else {
            let factory = new CSGFuzzyCSGFactory();
            let result = factory.getCSG(this);
            result.isCanonicalized = true;
            result.isRetesselated = this.isRetesselated;
            result.properties = this.properties; // keep original properties
            return result;
        }
    }

    /**
     * 重新修饰
     */
    public reTesselated(): CSG {
        if (this.isRetesselated) {
            return this;
        } else {
            let csg = this;
            let polygonsPerPlane: any = {};
            let isCanonicalized = csg.isCanonicalized;
            let fuzzyfactory = new CSGFuzzyCSGFactory();
            csg.polygons.map((polygon) => {
                let plane = polygon.plane;
                let shared = polygon.shared;
                if (!isCanonicalized) {
                    // in order to identify to polygons having the same plane, we need to canonicalize the planes
                    // We don't have to do a full canonizalization (including vertices), to save time only do the planes and the shared data:
                    plane = fuzzyfactory.getPlane(plane);
                    shared = fuzzyfactory.getPolygonShared(shared);
                }
                let tag = `${plane.getTag()}/${shared.getTag()}`;
                if (!(tag in polygonsPerPlane)) {
                    polygonsPerPlane[tag] = [polygon];
                } else {
                    polygonsPerPlane[tag].push(polygon);
                }
            });
            let destpolygons: any = [];
            for (let planetag in polygonsPerPlane) {
                let sourcepolygons = polygonsPerPlane[planetag];
                if (sourcepolygons.length < 2) {
                    destpolygons = destpolygons.concat(sourcepolygons);
                } else {
                    let retesselayedpolygons: any = [];
                    CSG.reTesselateCoplanarPolygons(sourcepolygons, retesselayedpolygons);
                    destpolygons = destpolygons.concat(retesselayedpolygons);
                }
            }
            let result = CSG.fromPolygons(destpolygons);
            result.isRetesselated = true;
            // result = result.canonicalized();
            result.properties = this.properties; // keep original properties
            return result;
        }
    }

    // returns an array of two CSG.Vector3Ds (minimum coordinates and maximum coordinates)
    /**
     * 获取包围盒
     */
    public getBounds(): any {
        if (!this.cachedBoundingBox) {
            let minpoint = new CSGVector3D(0, 0, 0);
            let maxpoint = new CSGVector3D(0, 0, 0);
            let polygons = this.polygons;
            let numpolygons = polygons.length;
            for (let i = 0; i < numpolygons; i++) {
                let polygon = polygons[i];
                let bounds = polygon.boundingBox();
                if (i == 0) {
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
    }

    // returns true if there is a possibility that the two solids overlap
    // returns false if we can be sure that they do not overlap
    /**
     * 判断重叠状态
     * @param csg
     */
    public mayOverlap(csg: CSG): boolean {
        if ((this.polygons.length == 0) || (csg.polygons.length == 0)) {
            return false;
        } else {
            let mybounds = this.getBounds();
            let otherbounds = csg.getBounds();
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
    }

    // Cut the solid by a plane. Returns the solid on the back side of the plane
    /**
     * 用平面切割固体。返回平面背面的实体
     * @param plane
     */
    public cutByPlane(plane: CSGPlane): CSG {
        if (this.polygons.length == 0) {
            return new CSG();
        }
        // Ideally we would like to do an intersection with a polygon of inifinite size
        // but this is not supported by our implementation. As a workaround, we will create
        // a cube, with one face on the plane, and a size larger enough so that the entire
        // solid fits in the cube.
        // find the max distance of any vertex to the center of the plane:
        let planecenter = plane.normal.times(plane.w);
        let maxdistance = 0;
        this.polygons.map((polygon) => {
            polygon.vertices.map((vertex: any) => {
                let distance = vertex.pos.distanceToSquared(planecenter);
                if (distance > maxdistance) {
                    maxdistance = distance;
                }
            });
        });
        maxdistance = Math.sqrt(maxdistance);
        maxdistance *= 1.01; // make sure it's really larger
        // Now build a polygon on the plane, at any point farther than maxdistance from the plane center:
        let vertices = [];
        let orthobasis = new CSGOrthoNormalBasis(plane);
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(maxdistance, -maxdistance))));
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(-maxdistance, -maxdistance))));
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(-maxdistance, maxdistance))));
        vertices.push(new CSGVertex(orthobasis.to3D(new CSGVector2D(maxdistance, maxdistance))));
        let polygon = new CSGPolygon(vertices, null, plane.flipped());
        // and extrude the polygon into a cube, backwards of the plane:
        let cube = polygon.extrude(plane.normal.times(-maxdistance));
        // Now we can do the intersection:
        let result = this.intersect(cube);
        result.properties = this.properties; // keep original properties
        return result;
    }

    // Connect a solid to another solid, such that two CSG.Connectors become connected
    //   myConnector: a CSG.Connector of this solid
    //   otherConnector: a CSG.Connector to which myConnector should be connected
    //   mirror: false: the 'axis' vectors of the connectors should point in the same direction
    //           true: the 'axis' vectors of the connectors should point in opposite direction
    //   normalrotation: degrees of rotation between the 'normal' vectors of the two
    //                   connectors
    /**
     * 连接实体
     * @param myConnector
     * @param otherConnector
     * @param mirror
     * @param normalrotation
     */
    public connectTo(myConnector: CSGConnector, otherConnector: CSGConnector, mirror: boolean, normalrotation: number): CSG {
        let matrix = myConnector.getTransformationTo(otherConnector, mirror, normalrotation);
        return this.transform(matrix);
    }

    // set the .shared property of all polygons
    // Returns a new CSG solid, the original is unmodified!
    /**
     * 设置共享实体
     * @param shared
     */
    public setShared(shared: CSGPolygonShared): CSG {
        let polygons = this.polygons.map((p) => new CSGPolygon(p.vertices, shared, p.plane));
        let result = CSG.fromPolygons(polygons);
        result.properties = this.properties; // keep original properties
        result.isRetesselated = this.isRetesselated;
        result.isCanonicalized = this.isCanonicalized;
        return result;
    }

    /**
     * 设置颜色
     * @param args
     */
    public setColor(args: any): CSG {
        let newshared = CSGPolygonShared.fromColor.apply(this, arguments);
        return this.setShared(newshared);
    }

    /**
     * 压缩文件
     */
    public toCompactBinary(): any {
        let csg = this.canonicalized();
        let numpolygons = csg.polygons.length;
        let numpolygonvertices = 0;
        let numvertices = 0;
        let vertexmap: any = {};
        let vertices: any = [];
        let numplanes = 0;
        let planemap: any = {};
        let polygonindex = 0;
        let planes: any = [];
        let shareds: any = [];
        let sharedmap: any = {};
        let numshared = 0;
        // for (let i = 0, iMax = csg.polygons.length; i < iMax; i++) {
        //  let p = csg.polygons[i];
        //  for (let j = 0, jMax = p.length; j < jMax; j++) {
        //      ++numpolygonvertices;
        //      let vertextag = p[j].getTag();
        //      if(!(vertextag in vertexmap)) {
        //          vertexmap[vertextag] = numvertices++;
        //          vertices.push(p[j]);
        //      }
        //  }
        csg.polygons.map((p) => {
            p.vertices.map((v: any) => {
                ++numpolygonvertices;
                let vertextag = v.getTag();
                if (!(vertextag in vertexmap)) {
                    vertexmap[vertextag] = numvertices++;
                    vertices.push(v);
                }
            });
            let planetag = p.plane.getTag();
            if (!(planetag in planemap)) {
                planemap[planetag] = numplanes++;
                planes.push(p.plane);
            }
            let sharedtag = p.shared.getTag();
            if (!(sharedtag in sharedmap)) {
                sharedmap[sharedtag] = numshared++;
                shareds.push(p.shared);
            }
        });
        let numVerticesPerPolygon = new Uint32Array(numpolygons);
        let polygonSharedIndexes = new Uint32Array(numpolygons);
        let polygonVertices = new Uint32Array(numpolygonvertices);
        let polygonPlaneIndexes = new Uint32Array(numpolygons);
        let vertexData = new Float64Array(numvertices * 3);
        let planeData = new Float64Array(numplanes * 4);
        let polygonVerticesIndex = 0;
        for (let polygonindex = 0; polygonindex < numpolygons; ++polygonindex) {
            let p = csg.polygons[polygonindex];
            numVerticesPerPolygon[polygonindex] = p.vertices.length;
            p.vertices.map((v: any) => {
                let vertextag = v.getTag();
                let vertexindex = vertexmap[vertextag];
                polygonVertices[polygonVerticesIndex++] = vertexindex;
            });
            let planetag = p.plane.getTag();
            let planeindex = planemap[planetag];
            polygonPlaneIndexes[polygonindex] = planeindex;
            let sharedtag = p.shared.getTag();
            let sharedindex = sharedmap[sharedtag];
            polygonSharedIndexes[polygonindex] = sharedindex;
        }
        let verticesArrayIndex = 0;
        vertices.map((v: any) => {
            let pos = v.pos;
            vertexData[verticesArrayIndex++] = pos._x;
            vertexData[verticesArrayIndex++] = pos._y;
            vertexData[verticesArrayIndex++] = pos._z;
        });
        let planesArrayIndex = 0;
        planes.map((p: any) => {
            let normal = p.normal;
            planeData[planesArrayIndex++] = normal._x;
            planeData[planesArrayIndex++] = normal._y;
            planeData[planesArrayIndex++] = normal._z;
            planeData[planesArrayIndex++] = p.w;
        });
        let result = {
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
    }

    // For debugging
    // Creates a new solid with a tiny cube at every vertex of the source solid
    /**
     * 在源实体的每个顶点创建一个带有微小立方体的新实体
     * @param cuberadius
     */
    public toPointCloud(cuberadius: number): CSG {
        let csg = this.reTesselated();
        let result = new CSG();
        // make a list of all unique vertices
        // For each vertex we also collect the list of normals of the planes touching the vertices
        let vertexmap: any = {};
        csg.polygons.map((polygon) => {
            polygon.vertices.map((vertex: any) => {
                vertexmap[vertex.getTag()] = vertex.pos;
            });
        });
        for (let vertextag in vertexmap) {
            let pos = vertexmap[vertextag];
            let cube = CSG.cube({
                center: pos,
                radius: cuberadius,
            });
            result = result.unionSub(cube, false, false);
        }
        result = result.reTesselated();
        return result;
    }

    // Get the transformation that transforms this CSG such that it is lying on the z=0 plane,
    // as flat as possible (i.e. the least z-height).
    // So that it is in an orientation suitable for CNC milling
    /**
     *获得转换此CSG的转换，使其位于z = 0平面上
     */
    public getTransformationAndInverseTransformationToFlatLying(): any {
        if (this.polygons.length == 0) {
            return new CSGMatrix4x4(); // unity
        } else {
            // get a list of unique planes in the CSG:
            let csg = this.canonicalized();
            let planemap: any = {};
            csg.polygons.map((polygon) => {
                planemap[polygon.plane.getTag()] = polygon.plane;
            });
            // try each plane in the CSG and find the plane that, when we align it flat onto z=0,
            // gives the least height in z-direction.
            // If two planes give the same height, pick the plane that originally had a normal closest
            // to [0,0,-1].
            let xvector = new CSGVector3D(1, 0, 0);
            let yvector = new CSGVector3D(0, 1, 0);
            let zvector = new CSGVector3D(0, 0, 1);
            let z0connectorx = new CSGConnector([0, 0, 0], [0, 0, -1], xvector);
            let z0connectory = new CSGConnector([0, 0, 0], [0, 0, -1], yvector);
            let isfirst = true;
            let minheight = 0;
            let maxdotz = 0;
            let besttransformation;
            let
                bestinversetransformation;
            for (let planetag in planemap) {
                let plane = planemap[planetag];
                let pointonplane = plane.normal.times(plane.w);
                let transformation;
                let
                    inversetransformation;
                // We need a normal vecrtor for the transformation
                // determine which is more perpendicular to the plane normal: x or y?
                // we will align this as much as possible to the x or y axis vector
                let xorthogonality = plane.normal.cross(xvector).length();
                let yorthogonality = plane.normal.cross(yvector).length();
                if (xorthogonality > yorthogonality) {
                    // x is better:
                    let planeconnector = new CSGConnector(pointonplane, plane.normal, xvector);
                    transformation = planeconnector.getTransformationTo(z0connectorx, false, 0);
                    inversetransformation = z0connectorx.getTransformationTo(planeconnector, false, 0);
                } else {
                    // y is better:
                    let planeconnector = new CSGConnector(pointonplane, plane.normal, yvector);
                    transformation = planeconnector.getTransformationTo(z0connectory, false, 0);
                    inversetransformation = z0connectory.getTransformationTo(planeconnector, false, 0);
                }
                let transformedcsg = csg.transform(transformation);
                let dotz = -plane.normal.dot(zvector);
                let bounds = transformedcsg.getBounds();
                let zheight = bounds[1].z - bounds[0].z;
                let isbetter = isfirst;
                if (!isbetter) {
                    if (zheight < minheight) {
                        isbetter = true;
                    } else if (zheight == minheight) {
                        if (dotz > maxdotz) {
                            isbetter = true;
                        }
                    }
                }
                if (isbetter) {
                    // translate the transformation around the z-axis and onto the z plane:
                    let translation = new CSGVector3D([-0.5 * (bounds[1].x + bounds[0].x), -0.5 * (bounds[1].y + bounds[0].y), -bounds[0].z]);
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
    }

    /**
     * 暂无
     */
    public getTransformationToFlatLying(): any {
        let result: any = this.getTransformationAndInverseTransformationToFlatLying();
        return result[0];
    }

    /**
     * 平躺
     */
    public lieFlat(): CSG {
        let transformation = this.getTransformationToFlatLying();
        return this.transform(transformation);
    }

    // project the 3D CSG onto a plane
    // This returns a 2D CAG with the 'shadow' shape of the 3D solid when projected onto the
    // plane represented by the orthonormal basis
    /**
     * 将csg投影到平面
     * @param orthobasis
     */
    public projectToOrthoNormalBasis(orthobasis: any): CAG {
        let EPS = 1e-5;
        let cags: any = [];
        this.polygons.filter((p) =>
            // only return polys in plane, others may disturb result
            p.plane.normal.minus(orthobasis.plane.normal).lengthSquared() < EPS * EPS,
        )
            .map((polygon) => {
                let cag = polygon.projectToOrthoNormalBasis(orthobasis);
                if (cag.sides.length > 0) {
                    cags.push(cag);
                }
            });
        let result = new CAG().union(cags);
        return result;
    }

    /**
     * 剖面
     * @param orthobasis
     */
    public sectionCut(orthobasis: any): any {
        let EPS = 1e-5;
        let plane1 = orthobasis.plane;
        let plane2 = orthobasis.plane.flipped();
        plane1 = new CSGPlane(plane1.normal, plane1.w);
        plane2 = new CSGPlane(plane2.normal, plane2.w + 5 * EPS);
        let cut3d = this.cutByPlane(plane1);
        cut3d = cut3d.cutByPlane(plane2);
        return cut3d.projectToOrthoNormalBasis(orthobasis);
    }

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
    /**
     * 未知
     */
    public fixTJunctions(): CSG {
        // noinspection JSAnnotator
        function addSide(vertex0: any, vertex1: any, polygonindex: any) {
            let starttag = vertex0.getTag();
            let endtag = vertex1.getTag();
            if (starttag == endtag) {
                throw new Error('Assertion failed');
            }
            let newsidetag = `${starttag}/${endtag}`;
            let reversesidetag = `${endtag}/${starttag}`;
            if (reversesidetag in sidemap) {
                // we have a matching reverse oriented side.
                // Instead of adding the new side, cancel out the reverse side:
                // console.log("addSide("+newsidetag+") has reverse side:");
                deleteSide(vertex1, vertex0, null);
                return null;
            }
            //  console.log("addSide("+newsidetag+")");
            let newsideobj = {
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
        function deleteSide(vertex0: any, vertex1: any, polygonindex: any) {
            let starttag = vertex0.getTag();
            let endtag = vertex1.getTag();
            let sidetag = `${starttag}/${endtag}`;
            // console.log("deleteSide("+sidetag+")");
            if (!(sidetag in sidemap)) {
                throw new Error('Assertion failed');
            }
            let idx = -1;
            let sideobjs = sidemap[sidetag];
            for (let i = 0; i < sideobjs.length; i++) {
                let sideobj = sideobjs[i];
                if (sideobj.vertex0 != vertex0) {
                    continue;
                }
                if (sideobj.vertex1 != vertex1) {
                    continue;
                }
                if (polygonindex != null) {
                    if (sideobj.polygonindex != polygonindex) {
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
            if (sideobjs.length == 0) {
                delete sidemap[sidetag];
            }
            idx = vertextag2sidestart[starttag].indexOf(sidetag);
            if (idx < 0) {
                throw new Error('Assertion failed');
            }
            vertextag2sidestart[starttag].splice(idx, 1);
            if (vertextag2sidestart[starttag].length == 0) {
                delete vertextag2sidestart[starttag];
            }
            idx = vertextag2sideend[endtag].indexOf(sidetag);
            if (idx < 0) {
                throw new Error('Assertion failed');
            }
            vertextag2sideend[endtag].splice(idx, 1);
            if (vertextag2sideend[endtag].length == 0) {
                delete vertextag2sideend[endtag];
            }
        }

        let csg = this.canonicalized();
        let sidemap: any = {};
        for (let polygonindex = 0; polygonindex < csg.polygons.length; polygonindex++) {
            let polygon = csg.polygons[polygonindex];
            let numvertices = polygon.vertices.length;
            if (numvertices >= 3) {
                // should be true
                let vertex = polygon.vertices[0];
                let vertextag = vertex.getTag();
                for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
                    let nextvertexindex = vertexindex + 1;
                    if (nextvertexindex == numvertices) {
                        nextvertexindex = 0;
                    }
                    let nextvertex = polygon.vertices[nextvertexindex];
                    let nextvertextag = nextvertex.getTag();
                    let sidetag = `${vertextag}/${nextvertextag}`;
                    let reversesidetag = `${nextvertextag}/${vertextag}`;
                    if (reversesidetag in sidemap) {
                        // this side matches the same side in another polygon. Remove from sidemap:
                        let ar = sidemap[reversesidetag];
                        ar.splice(-1, 1);
                        if (ar.length == 0) {
                            delete sidemap[reversesidetag];
                        }
                    } else {
                        let sideobj = {
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
        let vertextag2sidestart: any = {};
        let vertextag2sideend: any = {};
        let sidestocheck: any = {};
        let sidemapisempty0 = true;
        for (let sidetag in sidemap) {
            sidemapisempty0 = false;
            sidestocheck[sidetag] = true;
            sidemap[sidetag].map((sideobj: any) => {
                let starttag = sideobj.vertex0.getTag();
                let endtag = sideobj.vertex1.getTag();
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
        if (!sidemapisempty0) {
            // make a copy of the polygons array, since we are going to modify it:
            let polygons = csg.polygons.slice(0);

            while (true) {
                let sidemapisempty1 = true;
                for (let sidetag in sidemap) {
                    sidemapisempty1 = false;
                    sidestocheck[sidetag] = true;
                }
                if (sidemapisempty1) {
                    break;
                }
                let donesomething = false;
                while (true) {
                    let sidetagtocheck: any = null;
                    let _sidetag: any = null;
                    for (let sidetag in sidestocheck) {
                        sidetagtocheck = sidetag;
                        _sidetag = sidetag;
                        break;
                    }
                    if (sidetagtocheck == null) {
                        break;
                    } // sidestocheck is empty, we're done!
                    let donewithside = true;
                    if (sidetagtocheck in sidemap) {
                        let sideobjs = sidemap[sidetagtocheck];
                        if (sideobjs.length == 0) {
                            throw new Error('Assertion failed');
                        }
                        let sideobj = sideobjs[0];
                        for (let directionindex = 0; directionindex < 2; directionindex++) {
                            let startvertex = (directionindex == 0) ? sideobj.vertex0 : sideobj.vertex1;
                            let endvertex = (directionindex == 0) ? sideobj.vertex1 : sideobj.vertex0;
                            let startvertextag = startvertex.getTag();
                            let endvertextag = endvertex.getTag();
                            let matchingsides = [];
                            if (directionindex == 0) {
                                if (startvertextag in vertextag2sideend) {
                                    matchingsides = vertextag2sideend[startvertextag];
                                }
                            } else {
                                if (startvertextag in vertextag2sidestart) {
                                    matchingsides = vertextag2sidestart[startvertextag];
                                }
                            }
                            for (let matchingsideindex = 0; matchingsideindex < matchingsides.length; matchingsideindex++) {
                                let matchingsidetag = matchingsides[matchingsideindex];
                                let matchingside = sidemap[matchingsidetag][0];
                                let matchingsidestartvertex = (directionindex == 0) ? matchingside.vertex0 : matchingside.vertex1;
                                let matchingsideendvertex = (directionindex == 0) ? matchingside.vertex1 : matchingside.vertex0;
                                let matchingsidestartvertextag = matchingsidestartvertex.getTag();
                                let matchingsideendvertextag = matchingsideendvertex.getTag();
                                if (matchingsideendvertextag != startvertextag) {
                                    throw new Error('Assertion failed');
                                }
                                if (matchingsidestartvertextag == endvertextag) {
                                    // matchingside cancels sidetagtocheck
                                    deleteSide(startvertex, endvertex, null);
                                    deleteSide(endvertex, startvertex, null);
                                    donewithside = false;
                                    directionindex = 2; // skip reverse direction check
                                    donesomething = true;
                                    break;
                                } else {
                                    let startpos = startvertex.pos;
                                    let endpos = endvertex.pos;
                                    let checkpos = matchingsidestartvertex.pos;
                                    let direction = checkpos.minus(startpos);
                                    // Now we need to check if endpos is on the line startpos-checkpos:
                                    let t = endpos.minus(startpos).dot(direction) / direction.dot(direction);
                                    if ((t > 0) && (t < 1)) {
                                        let closestpoint = startpos.plus(direction.times(t));
                                        let distancesquared = closestpoint.distanceToSquared(endpos);
                                        if (distancesquared < 1e-10) {
                                            // Yes it's a t-junction! We need to split matchingside in two:
                                            let polygonindex = matchingside.polygonindex;
                                            let polygon = polygons[polygonindex];
                                            // find the index of startvertextag in polygon:
                                            let insertionvertextag = matchingside.vertex1.getTag();
                                            let insertionvertextagindex = -1;
                                            for (let i = 0; i < polygon.vertices.length; i++) {
                                                if (polygon.vertices[i].getTag() == insertionvertextag) {
                                                    insertionvertextagindex = i;
                                                    break;
                                                }
                                            }
                                            if (insertionvertextagindex < 0) {
                                                throw new Error('Assertion failed');
                                            }
                                            // split the side by inserting the vertex:
                                            let newvertices = polygon.vertices.slice(0);
                                            newvertices.splice(insertionvertextagindex, 0, endvertex);
                                            let newpolygon = new CSGPolygon(newvertices, polygon.shared /* polygon.plane */);
                                            polygons[polygonindex] = newpolygon;
                                            // remove the original sides from our maps:
                                            // deleteSide(sideobj.vertex0, sideobj.vertex1, null);
                                            deleteSide(matchingside.vertex0, matchingside.vertex1, polygonindex);
                                            let newsidetag1 = addSide(matchingside.vertex0, endvertex, polygonindex);
                                            let newsidetag2 = addSide(endvertex, matchingside.vertex1, polygonindex);
                                            if (newsidetag1 != null) {
                                                sidestocheck[newsidetag1] = true;
                                            }
                                            if (newsidetag2 != null) {
                                                sidestocheck[newsidetag2] = true;
                                            }
                                            donewithside = false;
                                            directionindex = 2; // skip reverse direction check
                                            donesomething = true;
                                            break;
                                        } // if(distancesquared < 1e-10)
                                    } // if( (t > 0) && (t < 1) )
                                } // if(endingstidestartvertextag == endvertextag)
                            } // for matchingsideindex
                        } // for directionindex
                    } // if(sidetagtocheck in sidemap)
                    if (donewithside) {
                        delete sidestocheck[_sidetag];
                    }
                }
                if (!donesomething) {
                    break;
                }
            }
            let newcsg = CSG.fromPolygons(polygons);
            newcsg.properties = csg.properties;
            newcsg.isCanonicalized = true;
            newcsg.isRetesselated = true;
            csg = newcsg;
        } // if(!sidemapisempty)
        let sidemapisempty1 = true;
        for (let sidetag in sidemap) {
            sidemapisempty1 = false;
            break;
        }
        if (!sidemapisempty1) {
            console.log('!sidemapisempty1');
        }
        return csg;
    }

    /**
     * 转化为三角面
     */
    public toTriangles(): any[] {
        let polygons: any = [];
        this.polygons.forEach((poly) => {
            let firstVertex = poly.vertices[0];
            for (let i = poly.vertices.length - 3; i >= 0; i--) {
                polygons.push(new CSGPolygon([
                        firstVertex, poly.vertices[i + 1], poly.vertices[i + 2],
                    ],
                    poly.shared, poly.plane));
            }
        });
        return polygons;
    }

    // features: string, or array containing 1 or more strings of: 'volume', 'area'
    // more could be added here (Fourier coeff, moments)
    /**
     * 获取特征
     * @param features
     */
    public getFeatures(features: any): any {
        if (!(features instanceof Array)) {
            features = [features];
        }
        let result = this.toTriangles().map((triPoly: any) => triPoly.getTetraFeatures(features))
            .reduce((pv: any, v: any) => v.map((feat: any, i: any) => feat + (pv == 0 ? 0 : pv[i])), 0);
        return (result.length == 1) ? result[0] : result;
    }

    /**
     * 镜像
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSG {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CSG {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CSG {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CSG {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转换
     * @param v
     */
    public translate(v: any): CSG {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: InterfaceCSGVector3D): CSG {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CSG {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CSG {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CSG {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: CSGVector3D, rotationAxis: CSGVector3D, degrees: number): CSG {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: number, beta: number, gamma: number, position: CSGVector3D): CSG {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }

    /**
     * 中心点
     * @param cAxes
     */
    public center(cAxes: any): any {
        let axes = ['x', 'y', 'z'];

        cAxes = Array.prototype.map.call(arguments, (a: any) => a.toLowerCase());
        // no args: center on all axes
        if (!cAxes.length) {
            cAxes = axes.slice();
        }
        let b = this.getBounds();

        return this.translate(axes.map((a) => (cAxes.indexOf(a) > -1 ?
            -(b[0][a] + b[1][a]) / 2 : 0)));
    }
}
