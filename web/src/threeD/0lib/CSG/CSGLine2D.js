import {CSGVector2D} from './CSGVector2D.js';
import {CSG} from './CSG.js';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';

var CSGLine2D = function (normal, w) {
    normal = new CSGVector2D(normal);
    w = parseFloat(w);
    var l = normal.length();
    // normalize:
    w *= l;
    normal = normal.times(1.0 / l);
    this.normal = normal;
    this.w = w;
};

CSGLine2D.fromPoints = function (p1, p2) {
    p1 = new CSGVector2D(p1);
    p2 = new CSGVector2D(p2);
    var direction = p2.minus(p1);
    var normal = direction.normal().negated().unit();
    var w = p1.dot(normal);
    return new CSGLine2D(normal, w);
};

Object.assign(CSGLine2D.prototype, {

    reverse() {
        return new CSGLine2D(this.normal.negated(), -this.w);
    },

    equals(l) {
        return (l.normal.equals(this.normal) && (l.w === this.w));
    },

    origin() {
        return this.normal.times(this.w);
    },

    direction() {
        return this.normal.normal();
    },

    xAtY(y) {
        // (py === y) && (normal * p === w)
        // -> px = (w - normal._y * y) / normal.x
        var x = (this.w - this.normal._y * y) / this.normal.x;
        return x;
    },

    absDistanceToPoint(point) {
        point = new CSGVector2D(point);
        var point_projected = point.dot(this.normal);
        var distance = Math.abs(point_projected - this.w);
        return distance;
    },

    // intersection between two lines, returns point as Vector2D
    intersectWithLine(line2d) {
        var point = CSG.solve2Linear(this.normal.x, this.normal.y, line2d.normal.x, line2d.normal.y, this.w, line2d.w);
        point = new CSGVector2D(point); // make  vector2d
        return point;
    },

    transform(matrix4x4) {
        var origin = new CSGVector2D(0, 0);
        var pointOnPlane = this.normal.times(this.w);
        var neworigin = origin.multiply4x4(matrix4x4);
        var neworiginPlusNormal = this.normal.multiply4x4(matrix4x4);
        var newnormal = neworiginPlusNormal.minus(neworigin);
        var newpointOnPlane = pointOnPlane.multiply4x4(matrix4x4);
        var neww = newnormal.dot(newpointOnPlane);
        return new CSGLine2D(newnormal, neww);
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

export {CSGLine2D};
