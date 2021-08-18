import {CSGVector3D} from './CSGVector3D';
import {CSGPlane} from './CSGPlane';
import {CSGLine3D} from './CSGLine3D';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSG} from './CSG';
import {InterfaceCSGVector3D} from './InterfaceCSG';

/**
 * CSG连接点类
 */
export class CSGConnector {
    /**
     * 链接点
     */
    public point: CSGVector3D;

    /**
     * 坐标轴向量
     */
    public axisvector: CSGVector3D;

    /**
     * 法线向量
     */
    public normalvector: CSGVector3D;

    /**
     * 构造函数
     * @param point
     * @param axisvector
     * @param normalvector
     */
    constructor(point: InterfaceCSGVector3D | number[], axisvector: InterfaceCSGVector3D | number[], normalvector: InterfaceCSGVector3D | number[]) {
        this.point = new CSGVector3D(point);
        this.axisvector = new CSGVector3D(axisvector).unit();
        this.normalvector = new CSGVector3D(normalvector).unit();
    }

    /**
     * 标准化
     */
    public normalized(): CSGConnector {
        let axisvector = this.axisvector.unit();
        // make the normal vector truly normal:
        let n = this.normalvector.cross(axisvector).unit();
        let normalvector = axisvector.cross(n);
        return new CSGConnector(this.point, axisvector, normalvector);
    }

    /**
     * 转化
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4): CSGConnector {
        let point = this.point.multiply4x4(matrix4x4);
        let axisvector = this.point.plus(this.axisvector).multiply4x4(matrix4x4).minus(point);
        let normalvector = this.point.plus(this.normalvector).multiply4x4(matrix4x4).minus(point);
        return new CSGConnector(point, axisvector, normalvector);
    }

    // Get the transformation matrix to connect this Connector to another connector
    //   other: a CSG.Connector to which this connector should be connected
    //   mirror: false: the 'axis' vectors of the connectors should point in the same direction
    //           true: the 'axis' vectors of the connectors should point in opposite direction
    //   normalrotation: degrees of rotation between the 'normal' vectors of the two
    //                   connectors
    /**
     * 获取转换矩阵以将此连接器连接到另一个连接器
     * @param other
     * @param mirror
     * @param normalrotation
     */
    public getTransformationTo(other: CSGConnector, mirror: boolean, normalrotation: number): CSGMatrix4x4 {
        mirror = !!mirror;
        normalrotation = normalrotation ? Number(normalrotation) : 0;
        let us = this.normalized();
        other = other.normalized();
        // shift to the origin:
        let transformation = CSGMatrix4x4.translation(this.point.negated());
        // construct the plane crossing through the origin and the two axes:
        let axesplane = CSGPlane.anyPlaneFromVector3Ds(
            new CSGVector3D(0, 0, 0), us.axisvector, other.axisvector);
        let axesbasis = new CSGOrthoNormalBasis(axesplane);
        let angle1 = axesbasis.to2D(us.axisvector).angle();
        let angle2 = axesbasis.to2D(other.axisvector).angle();
        let rotation = 180.0 * (angle2 - angle1) / Math.PI;
        if (mirror) {
            rotation += 180.0;
        }
        transformation = transformation.multiply(axesbasis.getProjectionMatrix());
        transformation = transformation.multiply(CSG.Matrix4x4.rotationZ(rotation));
        transformation = transformation.multiply(axesbasis.getInverseProjectionMatrix());
        let usAxesAligned = us.transform(transformation);
        // Now we have done the transformation for aligning the axes.
        // We still need to align the normals:
        let normalsplane = CSGPlane.fromNormalAndPoint(other.axisvector, new CSGVector3D(0, 0, 0));
        let normalsbasis = new CSGOrthoNormalBasis(normalsplane);
        angle1 = normalsbasis.to2D(usAxesAligned.normalvector).angle();
        angle2 = normalsbasis.to2D(other.normalvector).angle();
        rotation = 180.0 * (angle2 - angle1) / Math.PI;
        rotation += normalrotation;
        transformation = transformation.multiply(normalsbasis.getProjectionMatrix());
        transformation = transformation.multiply(CSGMatrix4x4.rotationZ(rotation));
        transformation = transformation.multiply(normalsbasis.getInverseProjectionMatrix());
        // and translate to the destination point:
        transformation = transformation.multiply(CSGMatrix4x4.translation(other.point));
        // let usAligned = us.transform(transformation);
        return transformation;
    }

    /**
     * 获取坐标轴线
     */
    public axisLine(): CSGLine3D {
        return new CSGLine3D(this.point, this.axisvector);
    }

    // creates a new Connector, with the connection point moved in the direction of the axisvector
    /**
     * 创建一个连接器
     * @param distance
     */
    public extend(distance: number): CSGConnector {
        let newpoint = this.point.plus(this.axisvector.unit().times(distance));
        return new CSGConnector(newpoint, this.axisvector, this.normalvector);
    }

    /**
     * 镜像
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGConnector {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CSGConnector {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CSGConnector {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CSGConnector {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: InterfaceCSGVector3D): CSGConnector {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: InterfaceCSGVector3D): CSGConnector {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: number): CSGConnector {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: number): CSGConnector {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: number): CSGConnector {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param deg
     */
    public rotate(rotationCenter: CSGVector3D, rotationAxis: CSGVector3D, degrees: number): CSGConnector {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: number, beta: number, gamma: number, position: CSGVector3D): CSGConnector {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}
