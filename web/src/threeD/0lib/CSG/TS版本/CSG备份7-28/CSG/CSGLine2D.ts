import {CSGVector2D} from './CSGVector2D';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';
import {InterfaceCSGVector2D, InterfaceCSGVector3D} from './InterfaceCSG';

/**
 * 2D线段类
 */
export class CSGLine2D {
    /**
     * 向量
     */
    public normal: CSGVector2D;

    /**
     * 暂无
     */
    public w: number;

    /**
     * 构造函数
     * @param normal
     * @param w
     */
    constructor(normal: CSGVector2D, w: number) {
        const _w = w.toString();
        normal = new CSGVector2D(normal);
        w = parseFloat(_w);
        let l = normal.length();
        // normalize:
        w *= l;
        normal = normal.times(1.0 / l);
        this.normal = normal;
        this.w = w;
    }

    /**
     * 从点创建
     * @param p1
     * @param p2
     */
    static fromPoints(p1: InterfaceCSGVector2D, p2: InterfaceCSGVector2D) {
        let _p1 = new CSGVector2D(p1);
        let _p2 = new CSGVector2D(p2);
        let direction = _p2.minus(_p1);
        let normal = direction.normal().negated().unit();
        let w = _p1.dot(normal);
        return new CSGLine2D(normal, w);
    }

    /**
     * 反转
     */
    public reverse(): CSGLine2D {
        return new CSGLine2D(this.normal.negated(), -this.w);
    }

    /**
     * 判断相等
     * @param l
     */
    public equals(l: CSGLine2D): boolean {
        return (l.normal.equals(this.normal) && (l.w == this.w));
    }

    /**
     * 原点
     */
    public origin(): CSGVector2D {
        return this.normal.times(this.w);
    }

    /**
     * 方向
     */
    public direction(): CSGVector2D {
        return this.normal.normal();
    }

    /**
     * y点x坐标
     * @param y
     */
    public xAtY(y: number): number {
        // (py == y) && (normal * p == w)
        // -> px = (w - normal._y * y) / normal.x
        let x = (this.w - this.normal._y * y) / this.normal.x;
        return x;
    }

    /**
     * 到点的绝对距离
     * @param point
     */
    public absDistanceToPoint(point: CSGVector2D): number {
        point = new CSGVector2D(point);
        let point_projected = point.dot(this.normal);
        let distance = Math.abs(point_projected - this.w);
        return distance;
    }

    // intersection between two lines, returns point as Vector2D
    /**
     * 通过两线交点产生二维向量
     * @param line2d
     */
    public intersectWithLine(line2d: CSGLine2D): CSGVector2D {
        let point = CSG.solve2Linear(this.normal.x, this.normal.y, line2d.normal.x, line2d.normal.y, this.w, line2d.w);
        const _point = new CSGVector2D(point); // make  vector2d
        return _point;
    }

    /**
     * 根据矩阵转换
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSGLine2D {
        let origin = new CSGVector2D(0, 0);
        let pointOnPlane = this.normal.times(this.w);
        let neworigin = origin.multiply4x4(matrix4x4);
        let neworiginPlusNormal = this.normal.multiply4x4(matrix4x4);
        let newnormal = neworiginPlusNormal.minus(neworigin);
        let newpointOnPlane = pointOnPlane.multiply4x4(matrix4x4);
        let neww = newnormal.dot(newpointOnPlane);
        return new CSGLine2D(newnormal, neww);
    }

    /**
     * 镜像
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGLine2D {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CSGLine2D {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CSGLine2D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CSGLine2D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: InterfaceCSGVector3D): CSGLine2D {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: InterfaceCSGVector3D): CSGLine2D {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CSGLine2D {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CSGLine2D {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CSGLine2D {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: CSGVector3D, rotationAxis: CSGVector3D, degrees: number): CSGLine2D {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: number, beta: number, gamma: number, position: InterfaceCSGVector3D): CSGLine2D {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }

}
