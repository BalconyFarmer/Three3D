import {CSGVector2D} from './CSGVector2D';
import {CSGVector3D} from './CSGVector3D';
import {CSGPlane} from './CSGPlane';
import {CSGLine3D} from './CSGLine3D';
import {CSGLine2D} from './CSGLine2D';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSG} from './CSG';

/**
 * 垂直向量基础类
 */
export class CSGOrthoNormalBasis {
    /**
     * 垂直轴
     */
    public v: CSGVector3D;

    /**
     * 水平轴
     */
    public u: CSGVector3D;

    /**
     * 平面
     */
    public plane: CSGPlane;

    /**
     * 平面起点
     */
    public planeorigin: CSGVector3D;

    /**
     * 构造函数
     * @param plane
     * @param rightvector
     */
    constructor(plane: CSGPlane, rightvector?: CSGVector3D) {
        if (arguments.length < 2) {
            // choose an arbitrary right hand vector, making sure it is somewhat orthogonal to the plane normal:
            rightvector = plane.normal.randomNonParallelVector();
        } else {
            rightvector = new CSGVector3D(rightvector);
        }
        this.v = plane.normal.cross(rightvector).unit();
        this.u = this.v.cross(plane.normal);
        this.plane = plane;
        this.planeorigin = plane.normal.times(plane.w);
    }

    // Get an orthonormal basis for the standard XYZ planes.
    // Parameters: the names of two 3D axes. The 2d x axis will map to the first given 3D axis, the 2d y
    // axis will map to the second.
    // Prepend the axis with a "-" to invert the direction of this axis.
    // For example: CSG.OrthoNormalBasis.GetCartesian("-Y","Z")
    //   will return an orthonormal basis where the 2d X axis maps to the 3D inverted Y axis, and
    //   the 2d Y axis maps to the 3D Z axis.
    /**
     * 获取标准XYZ平面的正交基准
     * @param xaxisid
     * @param yaxisid
     * @constructor
     */
    static GetCartesian(xaxisid: any, yaxisid: any): CSGOrthoNormalBasis {
        let axisid = `${xaxisid}/${yaxisid}`;
        let planenormal;
        let
            rightvector;
        if (axisid == 'X/Y') {
            planenormal = [0, 0, 1];
            rightvector = [1, 0, 0];
        } else if (axisid == 'Y/-X') {
            planenormal = [0, 0, 1];
            rightvector = [0, 1, 0];
        } else if (axisid == '-X/-Y') {
            planenormal = [0, 0, 1];
            rightvector = [-1, 0, 0];
        } else if (axisid == '-Y/X') {
            planenormal = [0, 0, 1];
            rightvector = [0, -1, 0];
        } else if (axisid == '-X/Y') {
            planenormal = [0, 0, -1];
            rightvector = [-1, 0, 0];
        } else if (axisid == '-Y/-X') {
            planenormal = [0, 0, -1];
            rightvector = [0, -1, 0];
        } else if (axisid == 'X/-Y') {
            planenormal = [0, 0, -1];
            rightvector = [1, 0, 0];
        } else if (axisid == 'Y/X') {
            planenormal = [0, 0, -1];
            rightvector = [0, 1, 0];
        } else if (axisid == 'X/Z') {
            planenormal = [0, -1, 0];
            rightvector = [1, 0, 0];
        } else if (axisid == 'Z/-X') {
            planenormal = [0, -1, 0];
            rightvector = [0, 0, 1];
        } else if (axisid == '-X/-Z') {
            planenormal = [0, -1, 0];
            rightvector = [-1, 0, 0];
        } else if (axisid == '-Z/X') {
            planenormal = [0, -1, 0];
            rightvector = [0, 0, -1];
        } else if (axisid == '-X/Z') {
            planenormal = [0, 1, 0];
            rightvector = [-1, 0, 0];
        } else if (axisid == '-Z/-X') {
            planenormal = [0, 1, 0];
            rightvector = [0, 0, -1];
        } else if (axisid == 'X/-Z') {
            planenormal = [0, 1, 0];
            rightvector = [1, 0, 0];
        } else if (axisid == 'Z/X') {
            planenormal = [0, 1, 0];
            rightvector = [0, 0, 1];
        } else if (axisid == 'Y/Z') {
            planenormal = [1, 0, 0];
            rightvector = [0, 1, 0];
        } else if (axisid == 'Z/-Y') {
            planenormal = [1, 0, 0];
            rightvector = [0, 0, 1];
        } else if (axisid == '-Y/-Z') {
            planenormal = [1, 0, 0];
            rightvector = [0, -1, 0];
        } else if (axisid == '-Z/Y') {
            planenormal = [1, 0, 0];
            rightvector = [0, 0, -1];
        } else if (axisid == '-Y/Z') {
            planenormal = [-1, 0, 0];
            rightvector = [0, -1, 0];
        } else if (axisid == '-Z/-Y') {
            planenormal = [-1, 0, 0];
            rightvector = [0, 0, -1];
        } else if (axisid == 'Y/-Z') {
            planenormal = [-1, 0, 0];
            rightvector = [0, 1, 0];
        } else if (axisid == 'Z/Y') {
            planenormal = [-1, 0, 0];
            rightvector = [0, 0, 1];
        } else {
            throw new Error('CSG.OrthoNormalBasis.GetCartesian: invalid combination of axis identifiers. Should pass two string arguments from [X,Y,Z,-X,-Y,-Z], being two different axes.');
        }
        return new CSGOrthoNormalBasis(new CSGPlane(new CSGVector3D(planenormal), 0), new CSGVector3D(rightvector));
    }

    // The z=0 plane, with the 3D x and y vectors mapped to the 2D x and y vector
    /**
     * Z平面
     * @constructor
     */
    static Z0Plane() {
        let plane = new CSGPlane(new CSGVector3D([0, 0, 1]), 0);
        return new CSGOrthoNormalBasis(plane, new CSGVector3D([1, 0, 0]));
    }

    /**
     * 获取投影矩阵
     */
    public getProjectionMatrix() {
        return new CSGMatrix4x4([
            this.u.x, this.v.x, this.plane.normal.x, 0,
            this.u.y, this.v.y, this.plane.normal.y, 0,
            this.u.z, this.v.z, this.plane.normal.z, 0,
            0, 0, -this.plane.w, 1,
        ]);
    }

    /**
     * 获取翻转投影矩阵
     */
    public getInverseProjectionMatrix() {
        let p = this.plane.normal.times(this.plane.w);
        return new CSGMatrix4x4([
            this.u.x, this.u.y, this.u.z, 0,
            this.v.x, this.v.y, this.v.z, 0,
            this.plane.normal.x, this.plane.normal.y, this.plane.normal.z, 0,
            p.x, p.y, p.z, 1,
        ]);
    }

    /**
     * 转为2D
     * @param vec3
     */
    public to2D(vec3: CSGVector3D) {
        return new CSGVector2D(vec3.dot(this.u), vec3.dot(this.v));
    }

    /**
     * 转为3D
     * @param vec2
     */
    public to3D(vec2: any): CSGVector3D {
        return this.planeorigin.plus(this.u.times(vec2.x)).plus(this.v.times(vec2.y));
    }

    /**
     * 3D线段转2D线段
     * @param line3d
     */
    public line3Dto2D(line3d: CSGLine3D): CSGLine2D {
        let a = line3d.point;
        let b = line3d.direction.plus(a);
        let a2d = this.to2D(a);
        let b2d = this.to2D(b);
        return CSGLine2D.fromPoints(a2d, b2d);
    }

    /**
     * 2D线段转3D线段
     * @param line2d
     */
    public line2Dto3D(line2d: CSGLine2D): CSGLine3D {
        let a = line2d.origin();
        let b = line2d.direction().plus(a);
        let a3d = this.to3D(a);
        let b3d = this.to3D(b);
        return CSGLine3D.fromPoints(a3d, b3d);
    }

    /**
     * 转换
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSGOrthoNormalBasis {
        let newplane = this.plane.transform(matrix4x4);
        let rightpoint_transformed = this.u.transform(matrix4x4);
        let origin_transformed = new CSGVector3D(0, 0, 0).transform(matrix4x4);
        let newrighthandvector = rightpoint_transformed.minus(origin_transformed);
        let newbasis = new CSGOrthoNormalBasis(newplane, newrighthandvector);
        return newbasis;
    }

    /**
     * 镜像
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGOrthoNormalBasis {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CSGOrthoNormalBasis {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CSGOrthoNormalBasis {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CSGOrthoNormalBasis {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: any): CSGOrthoNormalBasis {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: any): CSGOrthoNormalBasis {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: any): CSGOrthoNormalBasis {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: any): CSGOrthoNormalBasis {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: any): CSGOrthoNormalBasis {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: any, rotationAxis: any, degrees: number): CSGOrthoNormalBasis {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: number, beta: number, gamma: number, position: any): CSGOrthoNormalBasis {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}
