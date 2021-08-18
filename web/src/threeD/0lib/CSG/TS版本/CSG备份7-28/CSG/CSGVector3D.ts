import {CSGVector2D} from './CSGVector2D';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {Nullable} from "../types";

/**
 * CSG三维向量
 */
export class CSGVector3D {
    /**
     * X值
     */
    public readonly _x: number;

    /**
     * Y值
     */
    public readonly _y: number;

    /**
     * Z值
     */
    public readonly _z: number;

    /**
     * 构造函数
     * @param x
     * @param y
     * @param z
     */
    constructor(x: Nullable<number | number[] | CSGVector3D | CSGVector2D | any> = null, y: Nullable<number | CSGVector2D | number[]> = null, z: Nullable<number | CSGVector2D | number[]> = null) {
        let xString: string;
        let yString: string;
        let zString: string;

        if (arguments.length == 3 && y != null && z != null) {
            xString = x.toString();
            yString = y.toString();
            zString = z.toString();
            this._x = parseFloat(xString);
            this._y = parseFloat(yString);
            this._z = parseFloat(zString);
        } else if (arguments.length == 2 && y != null) {
            xString = x.toString();
            yString = y.toString();
            this._x = parseFloat(xString);
            this._y = parseFloat(yString);
            this._z = 0;
        } else {
            let ok = true;
            if (arguments.length == 1) {
                if (typeof (x) == 'object') {
                    if (x instanceof CSGVector3D) {
                        this._x = x._x;
                        this._y = x._y;
                        this._z = x._z;
                    } else if (x instanceof CSGVector2D) {
                        this._x = x._x;
                        this._y = x._y;
                        this._z = 0;
                    } else if (x instanceof Array) {
                        if ((x.length < 2) || (x.length > 3)) {
                            ok = false;
                        } else {
                            this._x = parseFloat(x[0]);
                            this._y = parseFloat(x[1]);
                            if (x.length == 3) {
                                this._z = parseFloat(x[2]);
                            } else {
                                this._z = 0;
                            }
                        }
                    } else if (('x' in x) && ('y' in x)) {
                        this._x = parseFloat(x.x);
                        this._y = parseFloat(x.y);
                        if ('z' in x) {
                            this._z = parseFloat(x.z);
                        } else {
                            this._z = 0;
                        }
                    } else {
                        ok = false;
                    }
                } else {
                    let v = parseFloat(x);
                    this._x = v;
                    this._y = v;
                    this._z = v;
                }
            } else {
                ok = false;
            }
            if (ok) {
                if ((!CSG.IsFloat(this._x)) || (!CSG.IsFloat(this._y)) || (!CSG.IsFloat(this._z))) {
                    ok = false;
                }
            }
            if (!ok) {
                throw new Error('wrong arguments');
            }
        }
    }

    /**
     * 获取X值
     */
    public get x(): number {
        return this._x;
    }

    /**
     * 获取Y值
     */
    public get y(): number {
        return this._y;
    }

    /**
     * 获取Z值
     */
    public get z(): number {
        return this._z;
    }

    /**
     * 创建三维向量
     * @param x
     * @param y
     * @param z
     * @constructor
     */
    static Create(x: number, y: number, z: number): CSGVector3D {
        let result = Object.create(CSGVector3D.prototype);
        result._x = x;
        result._y = y;
        result._z = z;
        return result;
    }

    /**
     * 克隆
     */
    public clone(): CSGVector3D {
        return CSGVector3D.Create(this._x, this._y, this._z);
    }

    /**
     * 置反
     */
    public negated(): CSGVector3D {
        return CSGVector3D.Create(-this._x, -this._y, -this._z);
    }

    /**
     * 求绝对值
     */
    public abs(): CSGVector3D {
        return CSGVector3D.Create(Math.abs(this._x), Math.abs(this._y), Math.abs(this._z));
    }

    /**
     * 相加
     * @param a
     */
    public plus(a: CSGVector3D): CSGVector3D {
        return CSGVector3D.Create(this._x + a._x, this._y + a._y, this._z + a._z);
    }

    /**
     * 求差
     * @param a
     */
    public minus(a: CSGVector3D): CSGVector3D {
        return CSGVector3D.Create(this._x - a._x, this._y - a._y, this._z - a._z);
    }

    /**
     * 叉乘
     * @param a
     */
    public times(a: number): CSGVector3D {
        return CSGVector3D.Create(this._x * a, this._y * a, this._z * a);
    }

    /**
     * 分割
     * @param a
     */
    public dividedBy(a: number): CSGVector3D {
        return CSGVector3D.Create(this._x / a, this._y / a, this._z / a);
    }

    /**
     * 点成
     * @param a
     */
    public dot(a: CSGVector3D): number {
        return this._x * a._x + this._y * a._y + this._z * a._z;
    }

    /**
     * 插值
     * @param a
     * @param t
     */
    public lerp(a: CSGVector3D, t: number): CSGVector3D {
        return this.plus(a.minus(this).times(t));
    }

    /**
     * 求平方
     */
    public lengthSquared(): number {
        return this.dot(this);
    }

    /**
     * 长度
     */
    public length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    /**
     * 联合
     */
    public unit(): CSGVector3D {
        return this.dividedBy(this.length());
    }

    /**
     * 叉乘
     * @param a
     */
    public cross(a: any): CSGVector3D {
        return CSGVector3D.Create(
            this._y * a._z - this._z * a._y, this._z * a._x - this._x * a._z, this._x * a._y - this._y * a._x);
    }

    /**
     * 求距离
     * @param a
     */
    public distanceTo(a: CSGVector3D): number {
        return this.minus(a).length();
    }

    /**
     * 距离平方
     * @param a
     */
    public distanceToSquared(a: CSGVector3D): number {
        return this.minus(a).lengthSquared();
    }

    /**
     * 相等
     * @param a
     */
    public equals(a: CSGVector3D): boolean {
        return (this._x == a._x) && (this._y == a._y) && (this._z == a._z);
    }

    /**
     * 乘以4X4矩阵
     * @param matrix4x4
     */
    public multiply4x4(matrix4x4: CSGMatrix4x4): CSGVector3D {
        return matrix4x4.leftMultiply1x3Vector(this);
    }

    /**
     * 改变
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSGVector3D {
        return matrix4x4.leftMultiply1x3Vector(this);
    }

    /**
     * 转成字符串
     */
    public toString(): string {
        return `(${this._x.toFixed(2)}, ${this._y.toFixed(2)}, ${this._z.toFixed(2)})`;
    }

    /**
     * 找到一个与此向量垂直的向量
     */
    public randomNonParallelVector(): CSGVector3D {
        let abs = this.abs();
        if ((abs._x <= abs._y) && (abs._x <= abs._z)) {
            return CSGVector3D.Create(1, 0, 0);
        } else if ((abs._y <= abs._x) && (abs._y <= abs._z)) {
            return CSGVector3D.Create(0, 1, 0);
        } else {
            return CSGVector3D.Create(0, 0, 1);
        }
    }

    /**
     * 求最小值
     * @param p
     */
    public min(p: any): CSGVector3D {
        return CSGVector3D.Create(
            Math.min(this._x, p._x), Math.min(this._y, p._y), Math.min(this._z, p._z));
    }

    /**
     * 求最大值
     * @param p
     */
    public max(p: CSGVector3D): CSGVector3D {
        return CSGVector3D.Create(
            Math.max(this._x, p._x), Math.max(this._y, p._y), Math.max(this._z, p._z));
    }

    /**
     * 反射
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGVector3D {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴反射
     */
    public mirroredX(): CSGVector3D {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴反射
     */
    public mirroredY(): CSGVector3D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴反射
     */
    public mirroredZ(): CSGVector3D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: any): CSGVector3D {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: any): CSGVector3D {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CSGVector3D {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CSGVector3D {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CSGVector3D {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: any, rotationAxis: any, degrees: any): CSGVector3D {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转角度
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: any, beta: any, gamma: any, position: any): CSGVector3D {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}
