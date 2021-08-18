import {CAGVertex} from './CAGVertex';
import {CSGVector2D} from './CSGVector2D';
import {CSGVertex} from './CSGVertex';
import {CSGPolygon} from './CSGPolygon';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';
import {InterfaceCSGVector3D} from './InterfaceCSG';

/**
 * CSG边类
 */
export class CAGSide {
    /**
     * 顶点0
     */
    public vertex0: CAGVertex;

    /**
     * 顶点1
     */
    public vertex1: CAGVertex;

    /**
     * 分类符
     */
    public tag: any;

    /**
     * 构造函数
     * @param vertex0
     * @param vertex1
     */
    constructor(vertex0: CAGVertex, vertex1: CAGVertex) {
        if (!(vertex0 instanceof CAGVertex)) {
            throw new Error('Assertion failed');
        }
        if (!(vertex1 instanceof CAGVertex)) {
            throw new Error('Assertion failed');
        }
        this.vertex0 = vertex0;
        this.vertex1 = vertex1;
    }

    /**
     * 从模拟多边形创建
     * @param polygon
     * @private
     */
    static _fromFakePolygon(polygon: CSGPolygon): CAGSide | null {
        polygon.vertices.forEach((v: any) => {
            if (!((v.pos.z >= -1.001) && (v.pos.z < -0.999)) && !((v.pos.z >= 0.999) && (v.pos.z < 1.001))) {
                throw ('Assertion failed: _fromFakePolygon expects abs z values of 1');
            }
        });
        // this can happen based on union, seems to be residuals -
        // return null and handle in caller
        if (polygon.vertices.length < 4) {
            return null;
        }
        let reverse = false;
        let vert1Indices: any[] = [];
        let pts2d = polygon.vertices.filter((v: any, i: any): boolean | void => {
            if (v.pos.z > 0) {
                vert1Indices.push(i);
                return true;
            }
        })
            .map((v: any) => new CSGVector2D(v.pos.x, v.pos.y));
        if (pts2d.length != 2) {
            throw ('Assertion failed: _fromFakePolygon: not enough points found');
        }
        let d = vert1Indices[1] - vert1Indices[0];
        if (d == 1 || d == 3) {
            if (d == 1) {
                pts2d.reverse();
            }
        } else {
            throw ('Assertion failed: _fromFakePolygon: unknown index ordering');
        }
        let result = new CAGSide(new CAGVertex(pts2d[0]), new CAGVertex(pts2d[1]));
        return result;
    }

    /**
     * 转为字符串
     */
    public toString(): string {
        return `${this.vertex0} -> ${this.vertex1}`;
    }

    /**
     * 转为三维多边形
     * @param z0
     * @param z1
     */
    public toPolygon3D(z0: number, z1: number) {
        let vertices = [
            new CSGVertex(this.vertex0.pos.toVector3D(z0)),
            new CSGVertex(this.vertex1.pos.toVector3D(z0)),
            new CSGVertex(this.vertex1.pos.toVector3D(z1)),
            new CSGVertex(this.vertex0.pos.toVector3D(z1)),
        ];
        return new CSGPolygon(vertices);
    }

    /**
     * 转化
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CAGSide {
        let newp1 = this.vertex0.pos.transform(matrix4x4);
        let newp2 = this.vertex1.pos.transform(matrix4x4);
        return new CAGSide(new CAGVertex(newp1), new CAGVertex(newp2));
    }

    /**
     * 获取新对象
     */
    public flipped(): CAGSide {
        return new CAGSide(this.vertex1, this.vertex0);
    }

    /**
     * 获取方向
     */
    public direction(): CSGVector2D {
        return this.vertex1.pos.minus(this.vertex0.pos);
    }

    /**
     * 获取分类符
     */
    public getTag(): number {
        let result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    }

    /**
     * 获取长度平方
     */
    public lengthSquared(): number {
        let x = this.vertex1.pos.x - this.vertex0.pos.x;
        let y = this.vertex1.pos.y - this.vertex0.pos.y;
        return x * x + y * y;
    }

    /**
     * 长度
     */
    public length(): number {
        return Math.sqrt(this.lengthSquared());
    }

    /**
     * 镜像
     * @param plane
     */
    public mirrored(plane: CSGPlane): CAGSide {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CAGSide {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CAGSide {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CAGSide {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: InterfaceCSGVector3D): CAGSide {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: InterfaceCSGVector3D): CAGSide {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CAGSide {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CAGSide {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CAGSide {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: CSGVector3D, rotationAxis: CSGVector3D, degrees: number) {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: number, beta: number, gamma: number, position: CSGVector3D) {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}

