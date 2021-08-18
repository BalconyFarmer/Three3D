import {CSGVector3D} from './CSGVector3D';
import {CSGVertex} from './CSGVertex';
import {CSGPolygon} from './CSGPolygon';
import {CSGLine3D} from './CSGLine3D';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {InterfaceCSGVector3D} from './InterfaceCSG';

export class CSGPlane {
    /**
     * 向量
     */
    public normal: any;

    public w: any;

    static EPSILON: number = 1e-5;

    /**
     * 类型符
     */
    public tag: any;

    /**
     * 构造函数
     * @param normal
     * @param w
     */
    constructor(normal: any, w: any) {
        this.normal = normal;
        this.w = w;
        // `CSG.Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
        // point is on the plane.
    }

    /**
     * 从对象生成平面
     * @param obj
     */
    static fromObject(obj: any) {
        let normal = new CSGVector3D(obj.normal);
        let w = parseFloat(obj.w);
        return new CSGPlane(normal, w);
    }

    /**
     * 从三维向量生成平面
     * @param a
     * @param b
     * @param c
     */
    static fromVector3Ds(a: any, b: any, c: any) {
        let n = b.minus(a).cross(c.minus(a)).unit();
        return new CSGPlane(n, n.dot(a));
    }

    // like fromVector3Ds, but allow the vectors to be on one point or one line
    // in such a case a random plane through the given points is constructed
    /**
     * 通过给顶点创建随机平面
     * @param a
     * @param b
     * @param c
     */
    static anyPlaneFromVector3Ds(a: any, b: any, c: any) {
        let v1 = b.minus(a);
        let v2 = c.minus(a);
        if (v1.length() < 1e-5) {
            v1 = v2.randomNonParallelVector();
        }
        if (v2.length() < 1e-5) {
            v2 = v1.randomNonParallelVector();
        }
        let normal = v1.cross(v2);
        if (normal.length() < 1e-5) {
            // this would mean that v1 == v2.negated()
            v2 = v1.randomNonParallelVector();
            normal = v1.cross(v2);
        }
        normal = normal.unit();
        return new CSGPlane(normal, normal.dot(a));
    }

    /**
     * 通过点创建平面
     * @param a
     * @param b
     * @param c
     */
    static fromPoints(a: any, b: any, c: any) {
        a = new CSGVector3D(a);
        b = new CSGVector3D(b);
        c = new CSGVector3D(c);
        return CSGPlane.fromVector3Ds(a, b, c);
    }

    /**
     * 通过向量和点创建平面
     * @param normal
     * @param point
     */
    static fromNormalAndPoint(normal: CSGVector3D | any[], point: CSGVector3D | any[]) {
        normal = new CSGVector3D(normal);
        point = new CSGVector3D(point);
        normal = normal.unit();
        let w = point.dot(normal);
        return new CSGPlane(normal, w);
    }

    /**
     * 生成反向平面
     */
    public flipped() {
        return new CSGPlane(this.normal.negated(), -this.w);
    }

    /**
     * 获取类型符
     */
    public getTag() {
        let result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    }

    /**
     * 判断相等
     * @param n
     */
    public equals(n: any) {
        return this.normal.equals(n.normal) && this.w == n.w;
    }

    /**
     * 移动
     * @param matrix4x4
     */
    public transform(matrix4x4: any) {
        let ismirror = matrix4x4.isMirroring();
        // get two vectors in the plane:
        let r = this.normal.randomNonParallelVector();
        let u = this.normal.cross(r);
        let v = this.normal.cross(u);
        // get 3 points in the plane:
        let point1 = this.normal.times(this.w);
        let point2 = point1.plus(u);
        let point3 = point1.plus(v);
        // transform the points:
        point1 = point1.multiply4x4(matrix4x4);
        point2 = point2.multiply4x4(matrix4x4);
        point3 = point3.multiply4x4(matrix4x4);
        // and create a new plane from the transformed points:
        let newplane = CSGPlane.fromVector3Ds(point1, point2, point3);
        if (ismirror) {
            // the transform is mirroring
            // We should mirror the plane:
            newplane = newplane.flipped();
        }
        return newplane;
    }

    // Returns object:
    // .type:
    //   0: coplanar-front
    //   1: coplanar-back
    //   2: front
    //   3: back
    //   4: spanning
    // In case the polygon is spanning, returns:
    // .front: a CSG.Polygon of the front part
    // .back: a CSG.Polygon of the back part
    /**
     * 划分多边形
     * @param polygon
     */
    public splitPolygon(polygon: any) {
        let result: any = {
            type: null,
            front: null,
            back: null,
        };
        // cache in local lets (speedup):
        let planenormal = this.normal;
        let vertices = polygon.vertices;
        let numvertices = vertices.length;
        if (polygon.plane.equals(this)) {
            result.type = 0;
        } else {
            let EPS = CSGPlane.EPSILON;
            let thisw = this.w;
            let hasfront = false;
            let hasback = false;
            let vertexIsBack = [];
            let MINEPS = -EPS;
            for (let i = 0; i < numvertices; i++) {
                let t = planenormal.dot(vertices[i].pos) - thisw;
                let isback = (t < 0);
                vertexIsBack.push(isback);
                if (t > EPS) {
                    hasfront = true;
                }
                if (t < MINEPS) {
                    hasback = true;
                }
            }
            if ((!hasfront) && (!hasback)) {
                // all points coplanar
                let t = planenormal.dot(polygon.plane.normal);
                result.type = (t >= 0) ? 0 : 1;
            } else if (!hasback) {
                result.type = 2;
            } else if (!hasfront) {
                result.type = 3;
            } else {
                // spanning
                result.type = 4;
                let frontvertices = [];
                let backvertices = [];
                let isback = vertexIsBack[0];
                for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
                    let vertex = vertices[vertexindex];
                    let nextvertexindex = vertexindex + 1;
                    if (nextvertexindex >= numvertices) {
                        nextvertexindex = 0;
                    }
                    let nextisback = vertexIsBack[nextvertexindex];
                    if (isback == nextisback) {
                        // line segment is on one side of the plane:
                        if (isback) {
                            backvertices.push(vertex);
                        } else {
                            frontvertices.push(vertex);
                        }
                    } else {
                        // line segment intersects plane:
                        let point = vertex.pos;
                        let nextpoint = vertices[nextvertexindex].pos;
                        let intersectionpoint = this.splitLineBetweenPoints(point, nextpoint);
                        let intersectionvertex = new CSGVertex(intersectionpoint);
                        if (isback) {
                            backvertices.push(vertex);
                            backvertices.push(intersectionvertex);
                            frontvertices.push(intersectionvertex);
                        } else {
                            frontvertices.push(vertex);
                            frontvertices.push(intersectionvertex);
                            backvertices.push(intersectionvertex);
                        }
                    }
                    isback = nextisback;
                } // for vertexindex
                // remove duplicate vertices:
                let EPS_SQUARED = CSGPlane.EPSILON * CSGPlane.EPSILON;
                if (backvertices.length >= 3) {
                    let prevvertex = backvertices[backvertices.length - 1];
                    for (let vertexindex = 0; vertexindex < backvertices.length; vertexindex++) {
                        let vertex = backvertices[vertexindex];
                        if (vertex.pos.distanceToSquared(prevvertex.pos) < EPS_SQUARED) {
                            backvertices.splice(vertexindex, 1);
                            vertexindex--;
                        }
                        prevvertex = vertex;
                    }
                }
                if (frontvertices.length >= 3) {
                    let prevvertex = frontvertices[frontvertices.length - 1];
                    for (let vertexindex = 0; vertexindex < frontvertices.length; vertexindex++) {
                        let vertex = frontvertices[vertexindex];
                        if (vertex.pos.distanceToSquared(prevvertex.pos) < EPS_SQUARED) {
                            frontvertices.splice(vertexindex, 1);
                            vertexindex--;
                        }
                        prevvertex = vertex;
                    }
                }
                if (frontvertices.length >= 3) {
                    result.front = new CSGPolygon(frontvertices, polygon.shared, polygon.plane);
                }
                if (backvertices.length >= 3) {
                    result.back = new CSGPolygon(backvertices, polygon.shared, polygon.plane);
                }
            }
        }
        return result;
    }

    // robust splitting of a line by a plane
    // will work even if the line is parallel to the plane
    /**
     * 通过两点分割线段
     * @param p1
     * @param p2
     */
    public splitLineBetweenPoints(p1: any, p2: any) {
        let direction = p2.minus(p1);
        let labda = (this.w - this.normal.dot(p1)) / this.normal.dot(direction);
        if (isNaN(labda)) {
            labda = 0;
        }
        if (labda > 1) {
            labda = 1;
        }
        if (labda < 0) {
            labda = 0;
        }
        let result = p1.plus(direction.times(labda));
        return result;
    }

    // returns CSG.Vector3D
    /**
     * 用线分割
     * @param line3d
     */
    public intersectWithLine(line3d: any) {
        return line3d.intersectWithPlane(this);
    }

    // intersection of two planes
    /**
     * 两面交线
     * @param plane
     */
    public intersectWithPlane(plane: any) {
        return CSGLine3D.fromPlanes(this, plane);
    }

    /**
     * 距离点的距离
     * @param point
     */
    public signedDistanceToPoint(point: any) {
        let t = this.normal.dot(point) - this.w;
        return t;
    }

    /**
     * 转成字符串
     */
    public toString() {
        return `[normal: ${this.normal.toString()}, w: ${this.w}]`;
    }

    /**
     * 镜像点
     * @param point3d
     */
    public mirrorPoint(point3d: any) {
        let distance = this.signedDistanceToPoint(point3d);
        let mirrored = point3d.minus(this.normal.times(distance * 2.0));
        return mirrored;
    }

    /**
     * 镜像平面
     * @param plane
     */
    public mirrored(plane: any) {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX() {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY() {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ() {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 移动
     * @param v
     */
    public translate(v: any) {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: any) {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: any) {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: any) {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: any) {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: any, rotationAxis: any, degrees: any) {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: any, beta: any, gamma: any, position: any) {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}

