import {CSGVector2D} from './CSGVector2D.js';
import {CSGVector3D} from './CSGVector3D.js';
import {CSGPlane} from './CSGPlane.js';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis.js';

var CSGMatrix4x4 = function (elements) {
    if (arguments.length >= 1) {
        this.elements = elements;
    } else {
        // if no arguments passed: create unity matrix
        this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
};

CSGMatrix4x4.unity = function () {
    return new CSGMatrix4x4();
};

// Create a rotation matrix for rotating around the x axis
CSGMatrix4x4.rotationX = function (degrees) {
    var radians = degrees * Math.PI * (1.0 / 180.0);
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    var els = [
        1, 0, 0, 0, 0, cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1,
    ];
    return new CSGMatrix4x4(els);
};

// Create a rotation matrix for rotating around the y axis
CSGMatrix4x4.rotationY = function (degrees) {
    var radians = degrees * Math.PI * (1.0 / 180.0);
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    var els = [
        cos, 0, -sin, 0, 0, 1, 0, 0, sin, 0, cos, 0, 0, 0, 0, 1,
    ];
    return new CSGMatrix4x4(els);
};

// Create a rotation matrix for rotating around the z axis
CSGMatrix4x4.rotationZ = function (degrees) {
    var radians = degrees * Math.PI * (1.0 / 180.0);
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    var els = [
        cos, sin, 0, 0, -sin, cos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ];
    return new CSGMatrix4x4(els);
};

// Matrix for rotation about arbitrary point and axis
CSGMatrix4x4.rotation = function (rotationCenter, rotationAxis, degrees) {
    rotationCenter = new CSGVector3D(rotationCenter);
    rotationAxis = new CSGVector3D(rotationAxis);
    var rotationPlane = CSGPlane.fromNormalAndPoint(rotationAxis, rotationCenter);
    var orthobasis = new CSGOrthoNormalBasis(rotationPlane);
    var transformation = CSGMatrix4x4.translation(rotationCenter.negated());
    transformation = transformation.multiply(orthobasis.getProjectionMatrix());
    transformation = transformation.multiply(CSGMatrix4x4.rotationZ(degrees));
    transformation = transformation.multiply(orthobasis.getInverseProjectionMatrix());
    transformation = transformation.multiply(CSGMatrix4x4.translation(rotationCenter));
    return transformation;
};

// Create an affine matrix for translation:
CSGMatrix4x4.translation = function (v) {
    // parse as CSG.Vector3D, so we can pass an array or a CSG.Vector3D
    var vec = new CSGVector3D(v);
    var els = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, vec.x, vec.y, vec.z, 1];
    return new CSGMatrix4x4(els);
};

// Create an affine matrix for mirroring into an arbitrary plane:
CSGMatrix4x4.mirroring = function (plane) {
    var nx = plane.normal.x;
    var ny = plane.normal.y;
    var nz = plane.normal.z;
    var w = plane.w;
    var els = [
        (1.0 - 2.0 * nx * nx), (-2.0 * ny * nx), (-2.0 * nz * nx), 0, (-2.0 * nx * ny), (1.0 - 2.0 * ny * ny), (-2.0 * nz * ny), 0, (-2.0 * nx * nz), (-2.0 * ny * nz), (1.0 - 2.0 * nz * nz), 0, (2.0 * nx * w), (2.0 * ny * w), (2.0 * nz * w), 1,
    ];
    return new CSGMatrix4x4(els);
};

// Create an affine matrix for scaling:
CSGMatrix4x4.scaling = function (v) {
    // parse as CSG.Vector3D, so we can pass an array or a CSG.Vector3D
    var vec = new CSGVector3D(v);
    var els = [
        vec.x, 0, 0, 0, 0, vec.y, 0, 0, 0, 0, vec.z, 0, 0, 0, 0, 1,
    ];
    return new CSGMatrix4x4(els);
};

Object.assign(CSGMatrix4x4.prototype, {

    plus(m) {
        var r = [];
        for (var i = 0; i < 16; i++) {
            r[i] = this.elements[i] + m.elements[i];
        }
        return new CSGMatrix4x4(r);
    },

    minus(m) {
        var r = [];
        for (var i = 0; i < 16; i++) {
            r[i] = this.elements[i] - m.elements[i];
        }
        return new CSGMatrix4x4(r);
    },

    // right multiply by another 4x4 matrix:
    multiply(m) {
        // cache elements in local variables, for speedup:
        var this0 = this.elements[0];
        var this1 = this.elements[1];
        var this2 = this.elements[2];
        var this3 = this.elements[3];
        var this4 = this.elements[4];
        var this5 = this.elements[5];
        var this6 = this.elements[6];
        var this7 = this.elements[7];
        var this8 = this.elements[8];
        var this9 = this.elements[9];
        var this10 = this.elements[10];
        var this11 = this.elements[11];
        var this12 = this.elements[12];
        var this13 = this.elements[13];
        var this14 = this.elements[14];
        var this15 = this.elements[15];
        var m0 = m.elements[0];
        var m1 = m.elements[1];
        var m2 = m.elements[2];
        var m3 = m.elements[3];
        var m4 = m.elements[4];
        var m5 = m.elements[5];
        var m6 = m.elements[6];
        var m7 = m.elements[7];
        var m8 = m.elements[8];
        var m9 = m.elements[9];
        var m10 = m.elements[10];
        var m11 = m.elements[11];
        var m12 = m.elements[12];
        var m13 = m.elements[13];
        var m14 = m.elements[14];
        var m15 = m.elements[15];
        var result = [];
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
    },

    clone() {
        var elements = this.elements.map(p => p);
        return new CSGMatrix4x4(elements);
    },

    // Right multiply the matrix by a CSG.Vector3D (interpreted as 3 row, 1 column)
    // (result = M*v)
    // Fourth element is taken as 1
    rightMultiply1x3Vector(v) {
        var v0 = v._x;
        var v1 = v._y;
        var v2 = v._z;
        var v3 = 1;
        var x = v0 * this.elements[0] + v1 * this.elements[1] + v2 * this.elements[2] + v3 * this.elements[3];
        var y = v0 * this.elements[4] + v1 * this.elements[5] + v2 * this.elements[6] + v3 * this.elements[7];
        var z = v0 * this.elements[8] + v1 * this.elements[9] + v2 * this.elements[10] + v3 * this.elements[11];
        var w = v0 * this.elements[12] + v1 * this.elements[13] + v2 * this.elements[14] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w !== 1) {
            var invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector3D(x, y, z);
    },

    // Multiply a CSG.Vector3D (interpreted as 3 column, 1 row) by this matrix
    // (result = v*M)
    // Fourth element is taken as 1
    leftMultiply1x3Vector(v) {
        var v0 = v._x;
        var v1 = v._y;
        var v2 = v._z;
        var v3 = 1;
        var x = v0 * this.elements[0] + v1 * this.elements[4] + v2 * this.elements[8] + v3 * this.elements[12];
        var y = v0 * this.elements[1] + v1 * this.elements[5] + v2 * this.elements[9] + v3 * this.elements[13];
        var z = v0 * this.elements[2] + v1 * this.elements[6] + v2 * this.elements[10] + v3 * this.elements[14];
        var w = v0 * this.elements[3] + v1 * this.elements[7] + v2 * this.elements[11] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w !== 1) {
            var invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector3D(x, y, z);
    },

    // Right multiply the matrix by a CSG.Vector2D (interpreted as 2 row, 1 column)
    // (result = M*v)
    // Fourth element is taken as 1
    rightMultiply1x2Vector(v) {
        var v0 = v.x;
        var v1 = v.y;
        var v2 = 0;
        var v3 = 1;
        var x = v0 * this.elements[0] + v1 * this.elements[1] + v2 * this.elements[2] + v3 * this.elements[3];
        var y = v0 * this.elements[4] + v1 * this.elements[5] + v2 * this.elements[6] + v3 * this.elements[7];
        var z = v0 * this.elements[8] + v1 * this.elements[9] + v2 * this.elements[10] + v3 * this.elements[11];
        var w = v0 * this.elements[12] + v1 * this.elements[13] + v2 * this.elements[14] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w !== 1) {
            var invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector2D(x, y);
    },

    // Multiply a CSG.Vector2D (interpreted as 2 column, 1 row) by this matrix
    // (result = v*M)
    // Fourth element is taken as 1
    leftMultiply1x2Vector(v) {
        var v0 = v.x;
        var v1 = v.y;
        var v2 = 0;
        var v3 = 1;
        var x = v0 * this.elements[0] + v1 * this.elements[4] + v2 * this.elements[8] + v3 * this.elements[12];
        var y = v0 * this.elements[1] + v1 * this.elements[5] + v2 * this.elements[9] + v3 * this.elements[13];
        var z = v0 * this.elements[2] + v1 * this.elements[6] + v2 * this.elements[10] + v3 * this.elements[14];
        var w = v0 * this.elements[3] + v1 * this.elements[7] + v2 * this.elements[11] + v3 * this.elements[15];
        // scale such that fourth element becomes 1:
        if (w !== 1) {
            var invw = 1.0 / w;
            x *= invw;
            y *= invw;
            z *= invw;
        }
        return new CSGVector2D(x, y);
    },

    // determine whether this matrix is a mirroring transformation
    isMirroring() {
        var u = new CSGVector3D(this.elements[0], this.elements[4], this.elements[8]);
        var v = new CSGVector3D(this.elements[1], this.elements[5], this.elements[9]);
        var w = new CSGVector3D(this.elements[2], this.elements[6], this.elements[10]);
        // for a true orthogonal, non-mirrored base, u.cross(v) === w
        // If they have an opposite direction then we are mirroring
        var mirrorvalue = u.cross(v).dot(w);
        var ismirror = (mirrorvalue < 0);
        return ismirror;
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

export {CSGMatrix4x4};
