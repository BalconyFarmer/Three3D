import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';
import {Nullable} from "../types";

/**
 * CSG二维向量
 */
export class CSGVector2D {
    /**
     * X坐标
     */
    public _x: number;

    /**
     * Y坐标
     */
    public _y: number;

    /**
     * 构造函数
     * @param x
     * @param y
     */
    constructor(x: Nullable<number | CSGVector2D | number[] | any> = null, y: Nullable<number | CSGVector2D | number[]> = null) {
        if (x != null && y != null) {
            const xString = x.toString();
            const yString = y.toString();
            this._x = parseFloat(xString);
            this._y = parseFloat(yString);
        } else {
            let ok = true;
            if (x != null) {
                if (typeof (x) == 'object') {
                    if (x instanceof CSGVector2D) {
                        this._x = x._x;
                        this._y = x._y;
                    } else if (x instanceof Array) {
                        const xString = x[0].toString();
                        const yString = x[1].toString();
                        this._x = parseFloat(xString);
                        this._y = parseFloat(yString);
                    } else if (('x' in x) && ('y' in x)) {
                        const xString = x.x.toString();
                        const yString = x.y.toString();
                        this._x = parseFloat(xString);
                        this._y = parseFloat(yString);
                    } else {
                        ok = false;
                    }
                } else {
                    const v = parseFloat(x);
                    this._x = v;
                    this._y = v;
                }
            } else {
                ok = false;
            }
            if (ok) {
                if ((!CSG.IsFloat(this._x)) || (!CSG.IsFloat(this._y))) {
                    ok = false;
                }
            }
            if (!ok) {
                throw new Error('wrong arguments');
            }
        }

        // this._x = null;
        // this._y = null;
    }

    /**
     * 获取X坐标
     */
    get x(): number {
        return this._x;
    }

    /**
     * 获取Y坐标
     */
    get y(): number {
        return this._y;
    }

    /**
     * 从角度创建
     * @param radians
     */
    static fromAngle(radians: number): CSGVector2D {
        return CSGVector2D.fromAngleRadians(radians);
    }

    /**
     * 从角度创建
     * @param degrees
     */
    static fromAngleDegrees(degrees: number): CSGVector2D {
        const radians = Math.PI * degrees / 180;
        return CSGVector2D.fromAngleRadians(radians);
    }

    /**
     * 从弧度创建
     * @param radians
     */
    static fromAngleRadians(radians: number): CSGVector2D {
        return CSGVector2D.Create(Math.cos(radians), Math.sin(radians));
    }

    /**
     * 创建二维向量
     * @param x
     * @param y
     * @constructor
     */
    static Create(x: number, y: number): CSGVector2D {
        const result = Object.create(CSGVector2D.prototype);
        result._x = x;
        result._y = y;
        return result;
    }

    /**
     * 拓展为三维向量
     * @param z
     */
    public toVector3D(z: number): CSGVector3D {
        return new CSGVector3D(this._x, this._y, z);
    }

    /**
     * 判断相等
     * @param a
     */
    public equals(a: CSGVector2D): boolean {
        return (this._x == a._x) && (this._y == a._y);
    }

    /**
     * 克隆
     */
    public clone(): CSGVector2D {
        return CSGVector2D.Create(this._x, this._y);
    }

    /**
     * 置反向量
     */
    public negated(): CSGVector2D {
        return CSGVector2D.Create(-this._x, -this._y);
    }

    /**
     * 相加
     * @param a
     */
    public plus(a: any): CSGVector2D {
        return CSGVector2D.Create(this._x + a._x, this._y + a._y);
    }

    /**
     * 相减
     * @param a
     */
    public minus(a: any): CSGVector2D {
        return CSGVector2D.Create(this._x - a._x, this._y - a._y);
    }

    /**
     * 相乘
     * @param a
     */
    public times(a: number): CSGVector2D {
        return CSGVector2D.Create(this._x * a, this._y * a);
    }

    /**
     * 分隔
     * @param a
     */
    public dividedBy(a: number): CSGVector2D {
        return CSGVector2D.Create(this._x / a, this._y / a);
    }

    /**
     * 点成
     * @param a
     */
    public dot(a: any): number {
        return this._x * a._x + this._y * a._y;
    }

    /**
     * 插值
     * @param a
     * @param t
     */
    public lerp(a: any, t: number): CSGVector2D {
        return this.plus(a.minus(this).times(t));
    }

    /**
     * 长度
     */
    public length(): number {
        return Math.sqrt(this.dot(this));
    }

    /**
     * 距离
     * @param a
     */
    public distanceTo(a: number): number {
        return this.minus(a).length();
    }

    /**
     * 距离平方
     * @param a
     */
    public distanceToSquared(a: number): number {
        return this.minus(a).lengthSquared();
    }

    /**
     * 长度平方
     */
    public lengthSquared(): number {
        return this.dot(this);
    }

    /**
     * 联合
     */
    public unit(): CSGVector2D {
        return this.dividedBy(this.length());
    }

    /**
     * 叉乘
     * @param a
     */
    public cross(a: any): number {
        return this._x * a._y - this._y * a._x;
    }

    /**
     * 返回顺时针旋转90度的向量
     */
    public normal(): CSGVector2D {
        return CSGVector2D.Create(this._y, -this._x);
    }

    /**
     * 乘以4X4向量
     * @param matrix4x4
     */
    public multiply4x4(matrix4x4: CSGMatrix4x4) {
        return matrix4x4.leftMultiply1x2Vector(this);
    }

    /**
     * 转换
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSGVector2D {
        return matrix4x4.leftMultiply1x2Vector(this);
    }

    /**
     * 返回角度
     */
    public angle(): number {
        return this.angleRadians();
    }

    /**
     * 返回角度
     */
    public angleDegrees(): number {
        const radians = this.angleRadians();
        return 180 * radians / Math.PI;
    }

    /**
     * 返回角度
     */
    public angleRadians(): number {
        // y=sin, x=cos
        return Math.atan2(this._y, this._x);
    }

    /**
     * 求最小值
     * @param p
     */
    public min(p: any): CSGVector2D {
        return CSGVector2D.Create(
            Math.min(this._x, p._x), Math.min(this._y, p._y));
    }

    /**
     * 求最大值
     * @param p
     */
    public max(p: any) {
        return CSGVector2D.Create(
            Math.max(this._x, p._x), Math.max(this._y, p._y));
    }

    /**
     * 转成字符串
     */
    public toString(): string {
        return `(${this._x.toFixed(2)}, ${this._y.toFixed(2)})`;
    }

    /**
     * 求绝对值
     */
    public abs(): CSGVector2D {
        return CSGVector2D.Create(Math.abs(this._x), Math.abs(this._y));
    }

    /**
     * 反射
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGVector2D {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CSGVector2D {
        const plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CSGVector2D {
        const plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CSGVector2D {
        const plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: any): CSGVector2D {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: any): CSGVector2D {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CSGVector2D {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CSGVector2D {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CSGVector2D {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: CSGVector3D, rotationAxis: CSGVector3D, degrees: number): CSGVector2D {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: number, beta: number, gamma: number, position: any): CSGVector2D {
        const _position = position || [0, 0, 0];
        const Rz1 = CSGMatrix4x4.rotationZ(alpha);
        const Rx = CSGMatrix4x4.rotationX(beta);
        const Rz2 = CSGMatrix4x4.rotationZ(gamma);
        const T = CSGMatrix4x4.translation(new CSGVector3D(_position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}
