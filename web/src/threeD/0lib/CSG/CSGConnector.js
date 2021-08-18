import {CSGVector3D} from './CSGVector3D.js';
import {CSGPlane} from './CSGPlane.js';
import {CSGLine3D} from './CSGLine3D.js';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis.js';
import {CSGMatrix4x4} from './CSGMatrix4x4.js';
import {CSG} from './CSG';

var CSGConnector = function (point, axisvector, normalvector) {
    this.point = new CSGVector3D(point);
    this.axisvector = new CSGVector3D(axisvector).unit();
    this.normalvector = new CSGVector3D(normalvector).unit();
};

Object.assign(CSGConnector.prototype, {

    normalized() {
        var axisvector = this.axisvector.unit();
        // make the normal vector truly normal:
        var n = this.normalvector.cross(axisvector).unit();
        var normalvector = axisvector.cross(n);
        return new CSGConnector(this.point, axisvector, normalvector);
    },

    transform(matrix4x4) {
        var point = this.point.multiply4x4(matrix4x4);
        var axisvector = this.point.plus(this.axisvector).multiply4x4(matrix4x4).minus(point);
        var normalvector = this.point.plus(this.normalvector).multiply4x4(matrix4x4).minus(point);
        return new CSGConnector(point, axisvector, normalvector);
    },

    // Get the transformation matrix to connect this Connector to another connector
    //   other: a CSG.Connector to which this connector should be connected
    //   mirror: false: the 'axis' vectors of the connectors should point in the same direction
    //           true: the 'axis' vectors of the connectors should point in opposite direction
    //   normalrotation: degrees of rotation between the 'normal' vectors of the two
    //                   connectors
    getTransformationTo(other, mirror, normalrotation) {
        mirror = !!mirror;
        normalrotation = normalrotation ? Number(normalrotation) : 0;
        var us = this.normalized();
        other = other.normalized();
        // shift to the origin:
        var transformation = CSGMatrix4x4.translation(this.point.negated());
        // construct the plane crossing through the origin and the two axes:
        var axesplane = CSGPlane.anyPlaneFromVector3Ds(
            new CSGVector3D(0, 0, 0), us.axisvector, other.axisvector);
        var axesbasis = new CSGOrthoNormalBasis(axesplane);
        var angle1 = axesbasis.to2D(us.axisvector).angle();
        var angle2 = axesbasis.to2D(other.axisvector).angle();
        var rotation = 180.0 * (angle2 - angle1) / Math.PI;
        if (mirror) {
            rotation += 180.0;
        }
        transformation = transformation.multiply(axesbasis.getProjectionMatrix());
        transformation = transformation.multiply(CSG.Matrix4x4.rotationZ(rotation));
        transformation = transformation.multiply(axesbasis.getInverseProjectionMatrix());
        var usAxesAligned = us.transform(transformation);
        // Now we have done the transformation for aligning the axes.
        // We still need to align the normals:
        var normalsplane = CSGPlane.fromNormalAndPoint(other.axisvector, new CSGVector3D(0, 0, 0));
        var normalsbasis = new CSGOrthoNormalBasis(normalsplane);
        angle1 = normalsbasis.to2D(usAxesAligned.normalvector).angle();
        angle2 = normalsbasis.to2D(other.normalvector).angle();
        rotation = 180.0 * (angle2 - angle1) / Math.PI;
        rotation += normalrotation;
        transformation = transformation.multiply(normalsbasis.getProjectionMatrix());
        transformation = transformation.multiply(CSGMatrix4x4.rotationZ(rotation));
        transformation = transformation.multiply(normalsbasis.getInverseProjectionMatrix());
        // and translate to the destination point:
        transformation = transformation.multiply(CSGMatrix4x4.translation(other.point));
        // var usAligned = us.transform(transformation);
        return transformation;
    },

    axisLine() {
        return new CSGLine3D(this.point, this.axisvector);
    },

    // creates a new Connector, with the connection point moved in the direction of the axisvector
    extend(distance) {
        var newpoint = this.point.plus(this.axisvector.unit().times(distance));
        return new CSGConnector(newpoint, this.axisvector, this.normalvector);
    },

    mirrored(plane) {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    },

    mirroredX() {
        var plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    },

    mirroredY() {
        var plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    },

    mirroredZ() {
        var plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    },

    translate(v) {
        return this.transform(CSGMatrix4x4.translation(v));
    },

    scale(f) {
        return this.transform(CSGMatrix4x4.scaling(f));
    },

    rotateX(deg) {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    },

    rotateY(deg) {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    },

    rotateZ(deg) {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    },

    rotate(rotationCenter, rotationAxis, degrees) {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    },

    rotateEulerAngles(alpha, beta, gamma, position) {
        position = position || [0, 0, 0];
        var Rz1 = CSGMatrix4x4.rotationZ(alpha);
        var Rx = CSGMatrix4x4.rotationX(beta);
        var Rz2 = CSGMatrix4x4.rotationZ(gamma);
        var T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    },
});


export {CSGConnector};
