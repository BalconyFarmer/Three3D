import {CSGVector3D} from './CSGVector3D';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';

/**
 * CSG顶点类
 */
export class CSGVertex {
    /**
     * 三维向量
     */
    private pos: CSGVector3D;

    /**
     * 分类号
     */
    private tag: number;

    /**
     * 构造函数
     * @param pos
     */
    constructor(pos: CSGVector3D) {
        this.pos = pos;
    }

    /**
     * 根据对象创造顶点对象
     * @param obj
     */
    static fromObject(obj: any): CSGVertex {
        let pos = new CSGVector3D(obj.pos);
        return new CSGVertex(pos);
    }

    // Return a vertex with all orientation-specific data (e.g. vertex normal) flipped. Called when the
    // orientation of a polygon is flipped.
    /**
     * 获取翻转对象
     */
    public flipped(): CSGVertex {
        return this;
    }

    /**
     * 获取分类号
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
     * 根据t参数在此顶点和other顶点创建一个新的顶点
     * @param other
     * @param t
     */
    public interpolate(other: CSGVertex, t: number): CSGVertex {
        let newpos = this.pos.lerp(other.pos, t);
        return new CSGVertex(newpos);
    }

    /**
     * 仿射几何
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSGVertex {
        let newpos = this.pos.multiply4x4(matrix4x4);
        return new CSGVertex(newpos);
    }

    /**
     * 字符串转换
     */
    public toString(): string {
        return this.pos.toString();
    }

    /**
     * 镜像
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGVertex {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X镜像
     */
    public mirroredX(): CSGVertex {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y镜像
     */
    public mirroredY(): CSGVertex {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z镜像
     */
    public mirroredZ(): CSGVertex {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 镜像顶点
     * @param v
     */
    public translate(v: any): CSGVertex {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放顶点
     * @param f
     */
    public scale(f: any): CSGVertex {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * 绕X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CSGVertex {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * 绕Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CSGVertex {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * 绕Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CSGVertex {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: any, rotationAxis: any, degrees: any): CSGVertex {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: any, beta: any, gamma: any, position: any): CSGVertex {
        const _position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(_position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}
