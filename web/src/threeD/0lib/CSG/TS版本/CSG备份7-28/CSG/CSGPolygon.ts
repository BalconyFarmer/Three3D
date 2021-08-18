import {CAG} from './CAG';
import {CSGVector3D} from './CSGVector3D';
import {CSGVertex} from './CSGVertex';
import {CSGPlane} from './CSGPlane';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPolygonShared} from './CSGPolygonShared';
import {CSG} from './CSG';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis';
import {Nullable} from "../types";

function fnSortByIndex(a: any, b: any): any {
    return a.index - b.index;
}

/**
 * CSG多边形
 */
export class CSGPolygon {
    /**
     * 顶点
     */
    public vertices: any;

    /**
     * 默认分享
     */
    defaultShared: any = new CSGPolygonShared(null);

    /**
     * 分享状态
     */
    public shared: any;

    /**
     * 平面
     */
    public plane: any;

    /**
     * 缓存包围球
     */
    private cachedBoundingSphere: any;

    /**
     * 缓冲包围盒
     */
    private cachedBoundingBox: any;

    /**
     * 构造函数
     * @param vertices
     * @param shared
     * @param plane
     */
    constructor(vertices: any, shared?: Nullable<CSGPolygonShared>, plane?: any) {
        this.vertices = vertices;
        if (!shared) {
            shared = this.defaultShared;
        }
        this.shared = shared;
        // let numvertices = vertices.length;
        if (arguments.length >= 3) {
            this.plane = plane;
        } else {
            this.plane = CSGPlane.fromVector3Ds(vertices[0].pos, vertices[1].pos, vertices[2].pos);
        }
        /* if (_CSGDEBUG) {
                this.checkIfConvex()
            } */
        this.defaultShared = new CSGPolygonShared(null);
    }

    /**
     * 从对象创建
     * @param obj
     */
    static fromObject(obj: any) {
        let vertices = obj.vertices.map((v: any) => CSGVertex.fromObject(v));
        let shared = CSGPolygonShared.fromObject(obj.shared);
        let plane = CSGPlane.fromObject(obj.plane);
        return new CSGPolygon(vertices, shared, plane);
    }

    /**
     * 凸出顶点
     * @param vertices
     * @param planenormal
     */
    static verticesConvex(vertices: any[], planenormal: CSGOrthoNormalBasis) {
        let numvertices = vertices.length;
        if (numvertices > 2) {
            let prevprevpos = vertices[numvertices - 2].pos;
            let prevpos = vertices[numvertices - 1].pos;
            for (let i = 0; i < numvertices; i++) {
                let pos = vertices[i].pos;
                if (!CSGPolygon.isConvexPoint(prevprevpos, prevpos, pos, planenormal)) {
                    return false;
                }
                prevprevpos = prevpos;
                prevpos = pos;
            }
        }
        return true;
    }

    // Create a polygon from the given points\\
    /**
     * 从给定点创建多边形
     * @param points
     * @param shared
     * @param plane
     */
    static createFromPoints(points?: any, shared?: any, plane?: any) {
        let normal;
        if (arguments.length < 3) {
            // initially set a dummy vertex normal:
            normal = new CSGVector3D(0, 0, 0);
        } else {
            normal = plane.normal;
        }
        let vertices: CSGVertex[] = [];
        points.map((p: any) => {
            let vec = new CSGVector3D(p);
            let vertex = new CSGVertex(vec);
            vertices.push(vertex);
        });
        let polygon;
        if (arguments.length < 3) {
            polygon = new CSGPolygon(vertices, shared);
        } else {
            polygon = new CSGPolygon(vertices, shared, plane);
        }
        return polygon;
    }

    // calculate whether three points form a convex corner
    //  prevpoint, point, nextpoint: the 3 coordinates (CSG.Vector3D instances)
    //  normal: the normal vector of the plane
    /**
     * 判断凸出顶点
     * @param prevpoint
     * @param point
     * @param nextpoint
     * @param normal
     */
    static isConvexPoint(prevpoint: any, point: any, nextpoint: any, normal: any) {
        let crossproduct = point.minus(prevpoint).cross(nextpoint.minus(point));
        let crossdotnormal = crossproduct.dot(normal);
        return (crossdotnormal >= 0);
    }

    /**
     * 判断严格凸出顶点
     * @param prevpoint
     * @param point
     * @param nextpoint
     * @param normal
     */
    static isStrictlyConvexPoint(prevpoint: any, point: any, nextpoint: any, normal: any) {
        let crossproduct = point.minus(prevpoint).cross(nextpoint.minus(point));
        let crossdotnormal = crossproduct.dot(normal);
        return (crossdotnormal >= 1e-5);
    }

    // check whether the polygon is convex (it should be, otherwise we will get unexpected results)
    /**
     * 判断是否凸出
     */
    public checkIfConvex() {
        if (!CSGPolygon.verticesConvex(this.vertices, this.plane.normal)) {
            CSGPolygon.verticesConvex(this.vertices, this.plane.normal);
            throw new Error('Not convex!');
        }
    }

    /**
     * 设置颜色
     * @param args
     */
    public setColor(args: any) {
        let newshared = CSGPolygonShared.fromColor.apply(this, arguments);
        this.shared = newshared;
        return this;
    }

    /**
     * 获取签名值
     */
    public getSignedVolume(): any {
        let signedVolume = 0;
        for (let i = 0; i < this.vertices.length - 2; i++) {
            signedVolume += this.vertices[0].pos.dot(this.vertices[i + 1].pos
                .cross(this.vertices[i + 2].pos));
        }
        signedVolume /= 6;
        return signedVolume;
    }

    // Note: could calculate vectors only once to speed up
    /**
     * 获取区域
     */
    public getArea() {
        let polygonArea = 0;
        for (let i = 0; i < this.vertices.length - 2; i++) {
            polygonArea += this.vertices[i + 1].pos.minus(this.vertices[0].pos)
                .cross(this.vertices[i + 2].pos.minus(this.vertices[i + 1].pos)).length();
        }
        polygonArea /= 2;
        return polygonArea;
    }

    // accepts array of features to calculate
    // returns array of results
    /**
     * 获取特征
     * @param features
     */
    public getTetraFeatures(features: any) {
        let result: any[] = [];
        features.forEach(function (this: CSGPolygon, feature: any) {
            if (feature == 'volume') {
                result.push(this.getSignedVolume());
            } else if (feature == 'area') {
                result.push(this.getArea());
            }
        }, this);
        return result;
    }

    // Extrude a polygon into the direction offsetvector
    // Returns a CSG object
    /**
     * 将多边形拉伸到偏移向量的方向上
     * @param offsetvector
     */
    public extrude(offsetvector: any) {
        let newpolygons = [];
        let polygon1: any = this;
        let direction = polygon1.plane.normal.dot(offsetvector);
        if (direction > 0) {
            polygon1 = polygon1.flipped();
        }
        newpolygons.push(polygon1);
        let polygon2 = polygon1.translate(offsetvector);
        let numvertices = this.vertices.length;
        for (let i = 0; i < numvertices; i++) {
            let sidefacepoints = [];
            let nexti = (i < (numvertices - 1)) ? i + 1 : 0;
            sidefacepoints.push(polygon1.vertices[i].pos);
            sidefacepoints.push(polygon2.vertices[i].pos);
            sidefacepoints.push(polygon2.vertices[nexti].pos);
            sidefacepoints.push(polygon1.vertices[nexti].pos);
            let sidefacepolygon = CSGPolygon.createFromPoints(sidefacepoints, this.shared);
            newpolygons.push(sidefacepolygon);
        }
        polygon2 = polygon2.flipped();
        newpolygons.push(polygon2);
        return CSG.fromPolygons(newpolygons);
    }

    // returns an array with a CSG.Vector3D (center point) and a radius
    /**
     * 返回带有CSG.Vector3D（中心点）和半径的数组
     */
    public boundingSphere() {
        if (!this.cachedBoundingSphere) {
            let box = this.boundingBox();
            let middle = box[0].plus(box[1]).times(0.5);
            let radius3 = box[1].minus(middle);
            let radius = radius3.length();
            this.cachedBoundingSphere = [middle, radius];
        }
        return this.cachedBoundingSphere;
    }

    // returns an array of two CSG.Vector3Ds (minimum coordinates and maximum coordinates)
    /**
     * 获取包围盒
     */
    public boundingBox() {
        if (!this.cachedBoundingBox) {
            let minpoint;
            let
                maxpoint;
            let vertices = this.vertices;
            let numvertices = vertices.length;
            if (numvertices == 0) {
                minpoint = new CSGVector3D(0, 0, 0);
            } else {
                minpoint = vertices[0].pos;
            }
            maxpoint = minpoint;
            for (let i = 1; i < numvertices; i++) {
                let point = vertices[i].pos;
                minpoint = minpoint.min(point);
                maxpoint = maxpoint.max(point);
            }
            this.cachedBoundingBox = [minpoint, maxpoint];
        }
        return this.cachedBoundingBox;
    }

    /**
     * 变址浮点运算
     */
    public flipped() {
        let newvertices = this.vertices.map((v: CSGVertex) => v.flipped());
        newvertices.reverse();
        let newplane = this.plane.flipped();
        return new CSGPolygon(newvertices, this.shared, newplane);
    }

    // Affine transformation of polygon. Returns a new CSG.Polygon
    /**
     * 多边形的仿射变换
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4) {
        let newvertices = this.vertices.map((v: CSGVertex) => v.transform(matrix4x4));
        let newplane = this.plane.transform(matrix4x4);
        if (matrix4x4.isMirroring()) {
            // need to reverse the vertex order
            // in order to preserve the inside/outside orientation:
            newvertices.reverse();
        }
        return new CSGPolygon(newvertices, this.shared, newplane);
    }

    /**
     * 转字符串
     */
    public toString() {
        let result = `Polygon plane: ${this.plane.toString()}\n`;
        this.vertices.map((vertex: CSGVertex) => {
            result += `  ${vertex.toString()}\n`;
        });
        return result;
    }

    // project the 3D polygon onto a plane
    /**
     * 将3D多边形投影到平面上
     * @param orthobasis
     */
    public projectToOrthoNormalBasis(orthobasis: any) {
        let points2d = this.vertices.map((vertex: any) => orthobasis.to2D(vertex.pos));
        let result = CAG.fromPointsNoCheck(points2d);
        let area = result.area();
        if (Math.abs(area) < 1e-5) {
            // the polygon was perpendicular to the orthnormal plane. The resulting 2D polygon would be degenerate
            // return an empty area instead:
            result = new CAG();
        } else if (area < 0) {
            result = result.flipped();
        }
        return result;
    }

    /**
     * Creates solid from slices (CSG.Polygon) by generating walls
     * @param {Object} options Solid generating options
     *  - numslices {Number} Number of slices to be generated
     *  - callback(t, slice) {Function} Callback function generating slices.
     *          arguments: t = [0..1], slice = [0..numslices - 1]
     *          return: CSG.Polygon or null to skip
     *  - loop {Boolean} no flats, only walls, it's used to generate solids like a tor
     */

    /**
     * 从片生成实体
     * @param options
     */
    public solidFromSlices(options: any) {
        let polygons: any[] = [];
        let csg = null;
        let prev = null;
        let bottom: any;
        let top: any = null;
        let numSlices = 2;
        let bLoop = false;
        let fnCallback;
        let flipped = null;
        if (options) {
            bLoop = Boolean(options.loop);
            if (options.numslices) {
                numSlices = options.numslices;
            }
            if (options.callback) {
                fnCallback = options.callback;
            }
        }
        if (!fnCallback) {
            let square = CSGPolygon.createFromPoints([
                [0, 0, 0],
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0],
            ]);
            fnCallback = function (t: number, slice: any) {
                return t == 0 || t == 1 ? square.translate([0, 0, t]) : null;
            };
        }
        for (let i = 0, iMax = numSlices - 1; i <= iMax; i++) {
            csg = fnCallback.call(this, i / iMax, i);
            if (csg) {
                if (!(csg instanceof CSGPolygon)) {
                    throw new Error('CSG.Polygon.solidFromSlices callback error: CSG.Polygon expected');
                }
                csg.checkIfConvex();
                if (prev) { // generate walls
                    if (flipped == null) { // not generated yet
                        flipped = prev.plane.signedDistanceToPoint(csg.vertices[0].pos) < 0;
                    }
                    this._addWalls(polygons, prev, csg, flipped);
                } else { // the first - will be a bottom
                    bottom = csg;
                }
                prev = csg;
            } // callback can return null to skip that slice
        }
        top = csg;
        if (bLoop) {
            let bSameTopBottom = bottom.vertices.length == top.vertices.length &&
                bottom.vertices.every((v: any, index: any) => v.pos.equals(top.vertices[index].pos));
            // if top and bottom are not the same -
            // generate walls between them
            if (!bSameTopBottom) {
                this._addWalls(polygons, top, bottom, flipped);
            } // else - already generated
        } else {
            // save top and bottom
            // TODO: flip if necessary
            let result: any;
            if (flipped) {
                result = bottom;
            } else {
                result = bottom.flipped();
            }
            polygons.unshift(result);
            polygons.push(flipped ? top.flipped() : top);
        }
        return CSG.fromPolygons(polygons);
    }

    /**
     * 添加墙多边形数组
     * @param walls Array of wall polygons
     * @param bottom Bottom polygon
     * @param top Top polygon
     */
    private _addWalls(walls: any, bottom: any, top: any, bFlipped: any) {
        let bottomPoints = bottom.vertices.slice(0); // make a copy
        let topPoints = top.vertices.slice(0); // make a copy
        let color = top.shared || null;
        // check if bottom perimeter is closed
        if (!bottomPoints[0].pos.equals(bottomPoints[bottomPoints.length - 1].pos)) {
            bottomPoints.push(bottomPoints[0]);
        }
        // check if top perimeter is closed
        if (!topPoints[0].pos.equals(topPoints[topPoints.length - 1].pos)) {
            topPoints.push(topPoints[0]);
        }
        if (bFlipped) {
            bottomPoints = bottomPoints.reverse();
            topPoints = topPoints.reverse();
        }
        let iTopLen = topPoints.length - 1;
        let iBotLen = bottomPoints.length - 1;
        let iExtra = iTopLen - iBotLen; // how many extra triangles we need
        let bMoreTops = iExtra > 0;
        let bMoreBottoms = iExtra < 0;
        let aMin = []; // indexes to start extra triangles (polygon with minimal square)
        // addGraphic - we need exactly /iExtra/ small triangles
        for (let i = Math.abs(iExtra); i > 0; i--) {
            aMin.push({
                len: Infinity,
                index: -1,
            });
        }
        let len;
        if (bMoreBottoms) {
            for (let i = 0; i < iBotLen; i++) {
                len = bottomPoints[i].pos.distanceToSquared(bottomPoints[i + 1].pos);
                // find the element to replace
                for (let j = aMin.length - 1; j >= 0; j--) {
                    if (aMin[j].len > len) {
                        aMin[j].len = len;
                        aMin[j].index = j;
                        break;
                    }
                } // for
            }
        } else if (bMoreTops) {
            for (let i = 0; i < iTopLen; i++) {
                len = topPoints[i].pos.distanceToSquared(topPoints[i + 1].pos);
                // find the element to replace
                for (let j = aMin.length - 1; j >= 0; j--) {
                    if (aMin[j].len > len) {
                        aMin[j].len = len;
                        aMin[j].index = j;
                        break;
                    }
                } // for
            }
        } // if
        // sort by index
        aMin.sort(fnSortByIndex);
        let getTriangle = function addWallsPutTriangle(pointA: any, pointB: any, pointC: any, color: any) {
            return new CSGPolygon([pointA, pointB, pointC], color);
            // return bFlipped ? triangle.flipped() : triangle;
        };
        let bpoint = bottomPoints[0];
        let tpoint = topPoints[0];
        let secondPoint;
        let nBotFacet;
        let
            nTopFacet; // length of triangle facet side
        for (let iB = 0, iT = 0, iMax = iTopLen + iBotLen; iB + iT < iMax;) {
            if (aMin.length) {
                if (bMoreTops && iT == aMin[0].index) { // one vertex is on the bottom, 2 - on the top
                    secondPoint = topPoints[++iT];
                    // console.log('<<< extra top: ' + secondPoint + ', ' + tpoint + ', bottom: ' + bpoint);
                    walls.push(getTriangle(
                        secondPoint, tpoint, bpoint, color,
                    ));
                    tpoint = secondPoint;
                    aMin.shift();
                    continue;
                } else if (bMoreBottoms && iB == aMin[0].index) {
                    secondPoint = bottomPoints[++iB];
                    walls.push(getTriangle(
                        tpoint, bpoint, secondPoint, color,
                    ));
                    bpoint = secondPoint;
                    aMin.shift();
                    continue;
                }
            }
            // choose the shortest path
            if (iB < iBotLen) { // one vertex is on the top, 2 - on the bottom
                nBotFacet = tpoint.pos.distanceToSquared(bottomPoints[iB + 1].pos);
            } else {
                nBotFacet = Infinity;
            }
            if (iT < iTopLen) { // one vertex is on the bottom, 2 - on the top
                nTopFacet = bpoint.pos.distanceToSquared(topPoints[iT + 1].pos);
            } else {
                nTopFacet = Infinity;
            }
            if (nBotFacet <= nTopFacet) {
                secondPoint = bottomPoints[++iB];
                walls.push(getTriangle(
                    tpoint, bpoint, secondPoint, color,
                ));
                bpoint = secondPoint;
            } else if (iT < iTopLen) { // nTopFacet < Infinity
                secondPoint = topPoints[++iT];
                // console.log('<<< top: ' + secondPoint + ', ' + tpoint + ', bottom: ' + bpoint);
                walls.push(getTriangle(
                    secondPoint, tpoint, bpoint, color,
                ));
                tpoint = secondPoint;
            }
        }
        return walls;
    }

    /**
     * 镜像平面
     * @param plane
     */
    private mirrored(plane: CSGPlane) {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    private mirroredX() {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    private mirroredY() {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    private mirroredZ() {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    private translate(v: any) {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    private scale(f: any) {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    private rotateX(deg: any) {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    private rotateY(deg: any) {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    private rotateZ(deg: any) {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    private rotate(rotationCenter: any, rotationAxis: any, degrees: any) {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    private rotateEulerAngles(alpha: any, beta: any, gamma: any, position: any) {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}
