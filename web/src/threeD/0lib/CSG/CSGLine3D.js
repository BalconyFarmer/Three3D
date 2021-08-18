import {CSGVector3D} from './CSGVector3D.js';
import {CSG} from './CSG.js';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';

var CSGLine3D = function (point, direction) {
    point = new CSGVector3D(point);
    direction = new CSGVector3D(direction);
    this.point = point;
    this.direction = direction.unit();
};

CSGLine3D.fromPoints = function (p1, p2) {
    p1 = new CSGVector3D(p1);
    p2 = new CSGVector3D(p2);
    var direction = p2.minus(p1);
    return new CSGLine3D(p1, direction);
};

CSGLine3D.fromPlanes = function (p1, p2) {
    var direction = p1.normal.cross(p2.normal);
    var l = direction.length();
    if (l < 1e-10) {
        throw new Error('Parallel planes');
    }
    direction = direction.times(1.0 / l);
    var mabsx = Math.abs(direction.x);
    var mabsy = Math.abs(direction.y);
    var mabsz = Math.abs(direction.z);
    var origin;
    if ((mabsx >= mabsy) && (mabsx >= mabsz)) {
        // direction vector is mostly pointing towards x
        // find a point p for which x is zero:
        var r = CSG.solve2Linear(p1.normal.y, p1.normal.z, p2.normal.y, p2.normal.z, p1.w, p2.w);
        origin = new CSGVector3D(0, r[0], r[1]);
    } else if ((mabsy >= mabsx) && (mabsy >= mabsz)) {
        // find a point p for which y is zero:
        var r = CSG.solve2Linear(p1.normal.x, p1.normal.z, p2.normal.x, p2.normal.z, p1.w, p2.w);
        origin = new CSGVector3D(r[0], 0, r[1]);
    } else {
        // find a point p for which z is zero:
        var r = CSG.solve2Linear(p1.normal.x, p1.normal.y, p2.normal.x, p2.normal.y, p1.w, p2.w);
        origin = new CSGVector3D(r[0], r[1], 0);
    }
    return new CSGLine3D(origin, direction);
};

Object.assign(CSGLine3D.prototype, {

    intersectWithPlane(plane) {
        // plane: plane.normal * p = plane.w
        // line: p=line.point + labda * line.direction
        var labda = (plane.w - plane.normal.dot(this.point)) / plane.normal.dot(this.direction);
        var point = this.point.plus(this.direction.times(labda));
        return point;
    },

    clone(line) {
        return new CSGLine3D(this.point.clone(), this.direction.clone());
    },

    reverse() {
        return new CSGLine3D(this.point.clone(), this.direction.negated());
    },

    transform(matrix4x4) {
        var newpoint = this.point.multiply4x4(matrix4x4);
        var pointPlusDirection = this.point.plus(this.direction);
        var newPointPlusDirection = pointPlusDirection.multiply4x4(matrix4x4);
        var newdirection = newPointPlusDirection.minus(newpoint);
        return new CSGLine3D(newpoint, newdirection);
    },

    closestPointOnLine(point) {
        point = new CSGVector3D(point);
        var t = point.minus(this.point).dot(this.direction) / this.direction.dot(this.direction);
        var closestpoint = this.point.plus(this.direction.times(t));
        return closestpoint;
    },

    distanceToPoint(point) {
        point = new CSGVector3D(point);
        var closestpoint = this.closestPointOnLine(point);
        var distancevector = point.minus(closestpoint);
        var distance = distancevector.length();
        return distance;
    },

    equals(line3d) {
        if (!this.direction.equals(line3d.direction)) {
            return false;
        }
        var distance = this.distanceToPoint(line3d.point);
        if (distance > 1e-8) {
            return false;
        }
        return true;
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

export {CSGLine3D};
