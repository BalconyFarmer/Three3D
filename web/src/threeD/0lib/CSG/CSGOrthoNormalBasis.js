import {CSGVector2D} from './CSGVector2D.js';
import {CSGVector3D} from './CSGVector3D.js';
import {CSGPlane} from './CSGPlane.js';
import {CSGLine3D} from './CSGLine3D.js';
import {CSGLine2D} from './CSGLine2D.js';
import {CSGMatrix4x4} from './CSGMatrix4x4.js';
import {CSG} from './CSG';

var CSGOrthoNormalBasis = function (plane, rightvector) {
    if (arguments.length < 2) {
        // choose an arbitrary right hand vector, making sure it is somewhat orthogonal to the plane normal:
        rightvector = plane.normal.randomNonParallelVector();
    } else {
        rightvector = new CSGVector3D(rightvector);
    }
    this.v = plane.normal.cross(rightvector).unit();
    this.u = this.v.cross(plane.normal);
    this.plane = plane;
    this.planeorigin = plane.normal.times(plane.w);
};

// Get an orthonormal basis for the standard XYZ planes.
// Parameters: the names of two 3D axes. The 2d x axis will map to the first given 3D axis, the 2d y
// axis will map to the second.
// Prepend the axis with a "-" to invert the direction of this axis.
// For example: CSG.OrthoNormalBasis.GetCartesian("-Y","Z")
//   will return an orthonormal basis where the 2d X axis maps to the 3D inverted Y axis, and
//   the 2d Y axis maps to the 3D Z axis.
CSGOrthoNormalBasis.GetCartesian = function (xaxisid, yaxisid) {
    var axisid = `${xaxisid}/${yaxisid}`;
    var planenormal;
    var
        rightvector;
    if (axisid === 'X/Y') {
        planenormal = [0, 0, 1];
        rightvector = [1, 0, 0];
    } else if (axisid === 'Y/-X') {
        planenormal = [0, 0, 1];
        rightvector = [0, 1, 0];
    } else if (axisid === '-X/-Y') {
        planenormal = [0, 0, 1];
        rightvector = [-1, 0, 0];
    } else if (axisid === '-Y/X') {
        planenormal = [0, 0, 1];
        rightvector = [0, -1, 0];
    } else if (axisid === '-X/Y') {
        planenormal = [0, 0, -1];
        rightvector = [-1, 0, 0];
    } else if (axisid === '-Y/-X') {
        planenormal = [0, 0, -1];
        rightvector = [0, -1, 0];
    } else if (axisid === 'X/-Y') {
        planenormal = [0, 0, -1];
        rightvector = [1, 0, 0];
    } else if (axisid === 'Y/X') {
        planenormal = [0, 0, -1];
        rightvector = [0, 1, 0];
    } else if (axisid === 'X/Z') {
        planenormal = [0, -1, 0];
        rightvector = [1, 0, 0];
    } else if (axisid === 'Z/-X') {
        planenormal = [0, -1, 0];
        rightvector = [0, 0, 1];
    } else if (axisid === '-X/-Z') {
        planenormal = [0, -1, 0];
        rightvector = [-1, 0, 0];
    } else if (axisid === '-Z/X') {
        planenormal = [0, -1, 0];
        rightvector = [0, 0, -1];
    } else if (axisid === '-X/Z') {
        planenormal = [0, 1, 0];
        rightvector = [-1, 0, 0];
    } else if (axisid === '-Z/-X') {
        planenormal = [0, 1, 0];
        rightvector = [0, 0, -1];
    } else if (axisid === 'X/-Z') {
        planenormal = [0, 1, 0];
        rightvector = [1, 0, 0];
    } else if (axisid === 'Z/X') {
        planenormal = [0, 1, 0];
        rightvector = [0, 0, 1];
    } else if (axisid === 'Y/Z') {
        planenormal = [1, 0, 0];
        rightvector = [0, 1, 0];
    } else if (axisid === 'Z/-Y') {
        planenormal = [1, 0, 0];
        rightvector = [0, 0, 1];
    } else if (axisid === '-Y/-Z') {
        planenormal = [1, 0, 0];
        rightvector = [0, -1, 0];
    } else if (axisid === '-Z/Y') {
        planenormal = [1, 0, 0];
        rightvector = [0, 0, -1];
    } else if (axisid === '-Y/Z') {
        planenormal = [-1, 0, 0];
        rightvector = [0, -1, 0];
    } else if (axisid === '-Z/-Y') {
        planenormal = [-1, 0, 0];
        rightvector = [0, 0, -1];
    } else if (axisid === 'Y/-Z') {
        planenormal = [-1, 0, 0];
        rightvector = [0, 1, 0];
    } else if (axisid === 'Z/Y') {
        planenormal = [-1, 0, 0];
        rightvector = [0, 0, 1];
    } else {
        throw new Error('CSG.OrthoNormalBasis.GetCartesian: invalid combination of axis identifiers. Should pass two string arguments from [X,Y,Z,-X,-Y,-Z], being two different axes.');
    }
    return new CSGOrthoNormalBasis(new CSGPlane(new CSGVector3D(planenormal), 0), new CSGVector3D(rightvector));
};

// The z=0 plane, with the 3D x and y vectors mapped to the 2D x and y vector
CSGOrthoNormalBasis.Z0Plane = function () {
    var plane = new CSGPlane(new CSGVector3D([0, 0, 1]), 0);
    return new CSGOrthoNormalBasis(plane, new CSGVector3D([1, 0, 0]));
};

Object.assign(CSGOrthoNormalBasis.prototype, {

    getProjectionMatrix() {
        return new CSGMatrix4x4([
            this.u.x, this.v.x, this.plane.normal.x, 0,
            this.u.y, this.v.y, this.plane.normal.y, 0,
            this.u.z, this.v.z, this.plane.normal.z, 0,
            0, 0, -this.plane.w, 1,
        ]);
    },

    getInverseProjectionMatrix() {
        var p = this.plane.normal.times(this.plane.w);
        return new CSGMatrix4x4([
            this.u.x, this.u.y, this.u.z, 0,
            this.v.x, this.v.y, this.v.z, 0,
            this.plane.normal.x, this.plane.normal.y, this.plane.normal.z, 0,
            p.x, p.y, p.z, 1,
        ]);
    },

    to2D(vec3) {
        return new CSGVector2D(vec3.dot(this.u), vec3.dot(this.v));
    },

    to3D(vec2) {
        return this.planeorigin.plus(this.u.times(vec2.x)).plus(this.v.times(vec2.y));
    },

    line3Dto2D(line3d) {
        var a = line3d.point;
        var b = line3d.direction.plus(a);
        var a2d = this.to2D(a);
        var b2d = this.to2D(b);
        return CSGLine2D.fromPoints(a2d, b2d);
    },

    line2Dto3D(line2d) {
        var a = line2d.origin();
        var b = line2d.direction().plus(a);
        var a3d = this.to3D(a);
        var b3d = this.to3D(b);
        return CSGLine3D.fromPoints(a3d, b3d);
    },

    transform(matrix4x4) {
        var newplane = this.plane.transform(matrix4x4);
        var rightpoint_transformed = this.u.transform(matrix4x4);
        var origin_transformed = new CSGVector3D(0, 0, 0).transform(matrix4x4);
        var newrighthandvector = rightpoint_transformed.minus(origin_transformed);
        var newbasis = new CSGOrthoNormalBasis(newplane, newrighthandvector);
        return newbasis;
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

export {CSGOrthoNormalBasis};
