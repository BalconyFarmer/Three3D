import {CSGVector3D} from './CSGVector3D';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {InterfaceCSGVector3D} from "./InterfaceCSG";

/**
 * 3D线段类
 */
export class CSGLine3D {
    /**
     * 起点
     */
    public point: CSGVector3D;

    /**
     * 方向
     */
    public direction: CSGVector3D;

    /**
     * 构造函数
     * @param point
     * @param direction
     */
    constructor(point: CSGVector3D, direction: CSGVector3D) {
        let _point: any = new CSGVector3D(point);
        direction = new CSGVector3D(direction);
        this.point = _point;
        this.direction = direction.unit();
    }

    /**
     * 从点创建
     * @param p1
     * @param p2
     */
    static fromPoints(p1: CSGVector3D, p2: CSGVector3D): CSGLine3D {
        const _p1 = new CSGVector3D(p1);
        const _p2 = new CSGVector3D(p2);
        let direction = p2.minus(p1);
        return new CSGLine3D(p1, direction);
    }

    /**
     * 从面创建
     * @param p1
     * @param p2
     */
    static fromPlanes(p1: CSGPlane, p2: CSGPlane): CSGLine3D {
        let direction = p1.normal.cross(p2.normal);
        let l = direction.length();
        if (l < 1e-10) {
            throw new Error('Parallel planes');
        }
        direction = direction.times(1.0 / l);
        let mabsx = Math.abs(direction.x);
        let mabsy = Math.abs(direction.y);
        let mabsz = Math.abs(direction.z);
        let origin;
        if ((mabsx >= mabsy) && (mabsx >= mabsz)) {
            // direction vector is mostly pointing towards x
            // find a point p for which x is zero:
            let r = CSG.solve2Linear(p1.normal.y, p1.normal.z, p2.normal.y, p2.normal.z, p1.w, p2.w);
            origin = new CSGVector3D(0, r[0], r[1]);
        } else if ((mabsy >= mabsx) && (mabsy >= mabsz)) {
            // find a point p for which y is zero:
            let r = CSG.solve2Linear(p1.normal.x, p1.normal.z, p2.normal.x, p2.normal.z, p1.w, p2.w);
            origin = new CSGVector3D(r[0], 0, r[1]);
        } else {
            // find a point p for which z is zero:
            let r = CSG.solve2Linear(p1.normal.x, p1.normal.y, p2.normal.x, p2.normal.y, p1.w, p2.w);
            origin = new CSGVector3D(r[0], r[1], 0);
        }
        return new CSGLine3D(origin, direction);
    }

    /**
     * 截面相交
     * @param plane
     */
    public intersectWithPlane(plane: CSGPlane): CSGVector3D {
        // plane: plane.normal * p = plane.w
        // line: p=line.point + labda * line.direction
        let labda = (plane.w - plane.normal.dot(this.point)) / plane.normal.dot(this.direction);
        let point = this.point.plus(this.direction.times(labda));
        return point;
    }

    /**
     * 克隆
     * @param line
     */
    public clone(line: CSGLine3D): CSGLine3D {
        return new CSGLine3D(this.point.clone(), this.direction.clone());
    }

    /**
     * 递归
     */
    public reverse(): CSGLine3D {
        return new CSGLine3D(this.point.clone(), this.direction.negated());
    }

    /**
     * 转换
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSGLine3D {
        let newpoint = this.point.multiply4x4(matrix4x4);
        let pointPlusDirection = this.point.plus(this.direction);
        let newPointPlusDirection = pointPlusDirection.multiply4x4(matrix4x4);
        let newdirection = newPointPlusDirection.minus(newpoint);
        return new CSGLine3D(newpoint, newdirection);
    }

    /**
     * 垂直交点
     * @param point
     */
    public closestPointOnLine(point: CSGVector3D): CSGVector3D {
        point = new CSGVector3D(point);
        let t = point.minus(this.point).dot(this.direction) / this.direction.dot(this.direction);
        let closestpoint = this.point.plus(this.direction.times(t));
        return closestpoint;
    }

    /**
     * 垂线长度
     * @param point
     */
    public distanceToPoint(point: CSGVector3D): number {
        point = new CSGVector3D(point);
        let closestpoint = this.closestPointOnLine(point);
        let distancevector = point.minus(closestpoint);
        let distance = distancevector.length();
        return distance;
    }

    /**
     * 判断相等
     * @param line3d
     */
    public equals(line3d: CSGLine3D): boolean {
        if (!this.direction.equals(line3d.direction)) {
            return false;
        }
        let distance = this.distanceToPoint(line3d.point);
        if (distance > 1e-8) {
            return false;
        }
        return true;
    }

    /**
     * 镜像平面
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGLine3D {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CSGLine3D {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CSGLine3D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CSGLine3D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: InterfaceCSGVector3D): CSGLine3D {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: InterfaceCSGVector3D): CSGLine3D {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CSGLine3D {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CSGLine3D {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CSGLine3D {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: CSGVector3D, rotationAxis: CSGVector3D, degrees: number): CSGLine3D {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: number, beta: number, gamma: number, position: InterfaceCSGVector3D) {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}

