import {CSGVector2D} from './CSGVector2D';
import {CSGVector3D} from './CSGVector3D';
import {CSGPlane} from './CSGPlane';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis';
import {InterfaceCSGVector3D} from "./InterfaceCSG";

/**
 * CSG四维矩阵
 */
export class CSGMatrix4x4 {
    /**
     * 元素
     */
    public elements: number[];

    /**
     * 构造函数
     * @param elements
     */
    constructor(elements?: number[]) {
        if (arguments.length >= 1) {
            const _elements: any = elements;
            this.elements = _elements;
        } else {
            // if no arguments passed: create unity matrix
            this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        }
    }

    /**
     * 联合
     */
    static unity(): CSGMatrix4x4 {
        return new CSGMatrix4x4();
    }

    // Create a rotation matrix for rotating around the x axis
    /**
     * 创建X轴旋转矩阵
     * @param degrees
     */
    static rotationX(degrees: number): CSGMatrix4x4 {
        let radians = degrees * Math.PI * (1.0 / 180.0);
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        let els = [
            1, 0, 0, 0, 0, cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1,
        ];
        return new CSGMatrix4x4(els);
    }

    // Create a rotation matrix for rotating around the y axis
    /**
     * 创建Y轴旋转矩阵
     * @param degrees
     */
    static rotationY(degrees: number): CSGMatrix4x4 {
        let radians = degrees * Math.PI * (1.0 / 180.0);
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        let els = [
            cos, 0, -sin, 0, 0, 1, 0, 0, sin, 0, cos, 0, 0, 0, 0, 1,
        ];
        return new CSGMatrix4x4(els);
    }

    // Create a rotation matrix for rotating around the z axis
    /**
     * 创建Z轴旋转矩阵
     * @param degrees
     */
    static rotationZ(degrees: number): CSGMatrix4x4 {
        let radians = degrees * Math.PI * (1.0 / 180.0);
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        let els = [
            cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
        ];
        return new CSGMatrix4x4(els);
    }

    // Matrix for rotation about arbitrary point and axis
    /**
     * 创建旋转矩阵
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    static rotation(rotationCenter: CSGVector3D, rotationAxis: CSGVector3D, degrees: number): CSGMatrix4x4 {
        rotationCenter = new CSGVector3D(rotationCenter);
        rotationAxis = new CSGVector3D(rotationAxis);
        let rotationPlane = CSGPlane.fromNormalAndPoint(rotationAxis, rotationCenter);
        let orthobasis = new CSGOrthoNormalBasis(rotationPlane);
        let transformation = CSGMatrix4x4.translation(rotationCenter.negated());
        transformation = transformation.multiply(orthobasis.getProjectionMatrix());
        transformation = transformation.multiply(CSGMatrix4x4.rotationZ(degrees));
        transformation = transformation.multiply(orthobasis.getInverseProjectionMatrix());
        transformation = transformation.multiply(CSGMatrix4x4.translation(rotationCenter));
        return transformation;
    }

    // Create an affine matrix for translation:
    /**
     * 创建转化仿射矩阵
     * @param v
     */
    static translation(v: InterfaceCSGVector3D): CSGMatrix4x4 {
        // parse as CSG.Vector3D, so we can pass an array or a CSG.Vector3D
        let vec = new CSGVector3D(v);
        let els = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, vec.x, vec.y, vec.z, 1];
        return new CSGMatrix4x4(els);
    }

    // Create an affine matrix for mirroring into an arbitrary plane:
    /**
     * 根据平面镜像
     * @param plane
     */
    static mirroring(plane: CSGPlane): CSGMatrix4x4 {
        let nx = plane.normal.x;
        let ny = plane.normal.y;
        let nz = plane.normal.z;
        let w = plane.w;
        let els = [
            (1.0 - 2.0 * nx * nx), (-2.0 * ny * nx), (-2.0 * nz * nx), 0, (-2.0 * nx * ny), (1.0 - 2.0 * ny * ny), (-2.0 * nz * ny), 0, (-2.0 * nx * nz), (-2.0 * ny * nz), (1.0 - 2.0 * nz * nz), 0, (2.0 * nx * w), (2.0 * ny * w), (2.0 * nz * w), 1,
        ];
        return new CSGMatrix4x4(els);
    }

    // Create an affine matrix for scaling:
    /**
     * 缩放
     * @param v
     */
    static scaling(v: any): CSGMatrix4x4 {
        // parse as CSG.Vector3D, so we can pass an array or a CSG.Vector3D
        let vec = new CSGVector3D(v);
        let els = [
            vec.x, 0, 0, 0, 0, vec.y, 0, 0, 0, 0, vec.z, 0, 0, 0, 0, 1,
        ];
        return new CSGMatrix4x4(els);
    }

    /**
     * 求和
     * @param m
     */
    public plus(m: CSGMatrix4x4): CSGMatrix4x4 {
        let r = [];
        for (let i = 0; i < 16; i++) {
            r[i] = this.elements[i] + m.elements[i];
        }
        return new CSGMatrix4x4(r);
    }

    /**
     * 求差
     * @param m
     */
    public minus(m: CSGMatrix4x4): CSGMatrix4x4 {
        let r = [];
        for (let i = 0; i < 16; i++) {
            r[i] = this.elements[i] - m.elements[i];
        }
        return new CSGMatrix4x4(r);
    }

    // right multiply by another 4x4 matrix:
    /**
     * 乘以4X4矩阵
     * @param m
     */
    public multiply(m: CSGMatrix4x4): CSGMatrix4x4 {
        // cache elements in local variables, for speedup:
        let this0 = this.elements[0];
        let this1 = this.elements[1];
        let this2 = this.elements[2];
        let this3 = this.elements[3];
        let this4 = this.elements[4];
        let this5 = this.elements[5];
        let this6 = this.elements[6];
        let this7 = this.elements[7];
        let this8 = this.elements[8];
        let this9 = this.elements[9];
        let this10 = this.elements[10];
        let this11 = this.elements[11];
        let this12 = this.elements[12];
        let this13 = this.elements[13];
        let this14 = this.elements[14];
        let this15 = this.elements[15];
        let m0 = m.elements[0];
        let m1 = m.elements[1];
        let m2 = m.elements[2];
        let m3 = m.elements[3];
        let m4 = m.elements[4];
        let m5 = m.elements[5];
        let m6 = m.elements[6];
        let m7 = m.elements[7];
        let m8 = m.elements[8];
        let m9 = m.elements[9];
        let m10 = m.elements[10];
        let m11 = m.elements[11];
        let m12 = m.elements[12];
        let m13 = m.elements[13];
        let m14 = m.elements[14];
        let m15 = m.elements[15];
        let result = [];
        result[0] = this0 * m0 + this1 * m4 + this2 * m8 + this3 * m12;
        result[1] = this0 * m1 + this1 * m5 + this2 * m9 + this3 * m13;
        result[2] = this0 * m2 + this1 * m6 + this2 * m10 + this3 * m14;
        result[3] = this0 * m3 + this1 * m7 + this2 * m11 + this3 * m15;
        result[4] = this4 * m0 + this5 * m4 + this6 * m8 + this7 * m12;
        result[5] = this4 * m1 + this5 * m5 + this6 * m9 + this7 * m13;
        result[6] = this4 * m2 + this5 * m6 + this6 * m10 + this7 * m14;
        result[7] = this4 * m3 + this5 * m7 + this6 * m11 + this7 * m15;
        result[8] = this8 * m0 + this9 * m4 + this10 * m8 + this11 * m12;
        result[9] = this8 * m1 + this9 * m5 + this10 * m9 + this11 * m13;
        result[10] = this8 * m2 + this9 * m6 + this10 * m10 + this11 * m14;
        result[11] = this8 * m3 + this9 * m7 + this10 * m11 + this11 * m15;
        result[12] = this12 * m0 + this13 * m4 + this14 * m8 + this15 * m12;
        result[13] = this12 * m1 + this13 * m5 + this14 * m9 + this15 * m13;
        result[14] = this12 * m2 + this13 * m6 + this14 * m10 + this15 * m14;
        result[15] = this12 * m3 + this13 * m7 + this14 * m11 + this15 * m15;
        return new CSGMatrix4x4(result);
    }

    /**
     * 克隆
     */
    public clone(): CSGMatrix4x4 {
        let elements = this.elements.map((p: any) => p);
        return new CSGMatrix4x4(elements);
    }

    // Right multiply the matrix by a CSG.Vector3D (interpreted as 3 row, 1 column)
    // (result = M*v)
    // Fourth element is taken as 1
    /**
     * 右乘三维向量
     * @param v
     */
    public rightMultiply1x3Vector(v: CSGVector3D): CSGVector3D {
        let v0 = v._x;
        let v1 = v._y;
        let v2 = v._z;
        let v3 = 1;
        let x = v0 * this.elements[0] + v1 * this.elements[1] + v2 * this.elements[2] + v3 * this.elements[3];
        let y = v0 * this.elements[4] + v1 * this.elements[5] + v2 * this.elements[6] + v3 * this.elements[7];
        let z = v0 * this.elements[8] + v1 * this.elements[9] + v2 * this.elements[10] + v3 * this.elements[11];
        let w = v0 * this.elements[12] + v1 * this.elements[13] + v2 * this.elements[14] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w != 1) {
            let invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector3D(x, y, z);
    }

    // Multiply a CSG.Vector3D (interpreted as 3 column, 1 row) by this matrix
    // (result = v*M)
    // Fourth element is taken as 1
    /**
     * 左乘三维向量
     * @param v
     */
    public leftMultiply1x3Vector(v: CSGVector3D): CSGVector3D {
        let v0 = v._x;
        let v1 = v._y;
        let v2 = v._z;
        let v3 = 1;
        let x = v0 * this.elements[0] + v1 * this.elements[4] + v2 * this.elements[8] + v3 * this.elements[12];
        let y = v0 * this.elements[1] + v1 * this.elements[5] + v2 * this.elements[9] + v3 * this.elements[13];
        let z = v0 * this.elements[2] + v1 * this.elements[6] + v2 * this.elements[10] + v3 * this.elements[14];
        let w = v0 * this.elements[3] + v1 * this.elements[7] + v2 * this.elements[11] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w != 1) {
            let invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector3D(x, y, z);
    }

    // Right multiply the matrix by a CSG.Vector2D (interpreted as 2 row, 1 column)
    // (result = M*v)
    // Fourth element is taken as 1
    /**
     * 右乘二维向量
     * @param v
     */
    public rightMultiply1x2Vector(v: CSGVector2D): CSGVector2D {
        let v0 = v.x;
        let v1 = v.y;
        let v2 = 0;
        let v3 = 1;
        let x = v0 * this.elements[0] + v1 * this.elements[1] + v2 * this.elements[2] + v3 * this.elements[3];
        let y = v0 * this.elements[4] + v1 * this.elements[5] + v2 * this.elements[6] + v3 * this.elements[7];
        let z = v0 * this.elements[8] + v1 * this.elements[9] + v2 * this.elements[10] + v3 * this.elements[11];
        let w = v0 * this.elements[12] + v1 * this.elements[13] + v2 * this.elements[14] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w != 1) {
            let invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector2D(x, y);
    }

    // Multiply a CSG.Vector2D (interpreted as 2 column, 1 row) by this matrix
    // (result = v*M)
    // Fourth element is taken as 1
    /**
     * 左乘二维向量
     * @param v
     */
    public leftMultiply1x2Vector(v: CSGVector2D): CSGVector2D {
        let v0 = v.x;
        let v1 = v.y;
        let v2 = 0;
        let v3 = 1;
        let x = v0 * this.elements[0] + v1 * this.elements[4] + v2 * this.elements[8] + v3 * this.elements[12];
        let y = v0 * this.elements[1] + v1 * this.elements[5] + v2 * this.elements[9] + v3 * this.elements[13];
        let z = v0 * this.elements[2] + v1 * this.elements[6] + v2 * this.elements[10] + v3 * this.elements[14];
        let w = v0 * this.elements[3] + v1 * this.elements[7] + v2 * this.elements[11] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w != 1) {
            let invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector2D(x, y);
    }

    // determine whether this matrix is a mirroring transformation\
    /**
     * 确定此矩阵是否为二维变换
     */
    public isMirroring(): boolean {
        let u = new CSGVector3D(this.elements[0], this.elements[4], this.elements[8]);
        let v = new CSGVector3D(this.elements[1], this.elements[5], this.elements[9]);
        let w = new CSGVector3D(this.elements[2], this.elements[6], this.elements[10]);
        // for a true orthogonal, non-mirrored base, u.cross(v) == w
        // If they have an opposite direction then we are mirroring
        let mirrorvalue = u.cross(v).dot(w);
        let ismirror = (mirrorvalue < 0);
        return ismirror;
    }

}
