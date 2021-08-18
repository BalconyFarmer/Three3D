import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';

var CSGVector2D = function (x, y) {
    if (arguments.length === 2) {
        this._x = parseFloat(x);
        this._y = parseFloat(y);
    } else {
        var ok = true;
        if (arguments.length === 1) {
            if (typeof (x) === 'object') {
                if (x instanceof CSGVector2D) {
                    this._x = x._x;
                    this._y = x._y;
                } else if (x instanceof Array) {
                    this._x = parseFloat(x[0]);
                    this._y = parseFloat(x[1]);
                } else if (('x' in x) && ('y' in x)) {
                    this._x = parseFloat(x.x);
                    this._y = parseFloat(x.y);
                } else {
                    ok = false;
                }
            } else {
                var v = parseFloat(x);
                this._x = v;
                this._y = v;
            }
        } else {
            ok = false;
        }
        if (ok) {
            if ((!CSG.IsFloat(this._x)) || (!CSG.IsFloat(this._y))) {
                ok = false;
            }
        }
        if (!ok) {
            throw new Error('wrong arguments');
        }
    }
};

CSGVector2D.fromAngle = function (radians) {
    return CSGVector2D.fromAngleRadians(radians);
};

CSGVector2D.fromAngleDegrees = function (degrees) {
    var radians = Math.PI * degrees / 180;
    return CSGVector2D.fromAngleRadians(radians);
};

CSGVector2D.fromAngleRadians = function (radians) {
    return CSGVector2D.Create(Math.cos(radians), Math.sin(radians));
};

// This does the same as new CSG.Vector2D(x,y) but it doesn't go through the constructor
// and the parameters are not validated. Is much faster.
CSGVector2D.Create = function (x, y) {
    var result = Object.create(CSGVector2D.prototype);
    result._x = x;
    result._y = y;
    return result;
};

Object.assign(CSGVector2D.prototype, {

    // extend to a 3D vector by adding a z coordinate:
    toVector3D(z) {
        return new CSGVector3D(this._x, this._y, z);
    },

    equals(a) {
        return (this._x === a._x) && (this._y === a._y);
    },

    clone() {
        return CSGVector2D.Create(this._x, this._y);
    },

    negated() {
        return CSGVector2D.Create(-this._x, -this._y);
    },

    plus(a) {
        return CSGVector2D.Create(this._x + a._x, this._y + a._y);
    },

    minus(a) {
        return CSGVector2D.Create(this._x - a._x, this._y - a._y);
    },

    times(a) {
        return CSGVector2D.Create(this._x * a, this._y * a);
    },

    dividedBy(a) {
        return CSGVector2D.Create(this._x / a, this._y / a);
    },

    dot(a) {
        return this._x * a._x + this._y * a._y;
    },

    lerp(a, t) {
        return this.plus(a.minus(this).times(t));
    },

    length() {
        return Math.sqrt(this.dot(this));
    },

    distanceTo(a) {
        return this.minus(a).length();
    },

    distanceToSquared(a) {
        return this.minus(a).lengthSquared();
    },

    lengthSquared() {
        return this.dot(this);
    },

    unit() {
        return this.dividedBy(this.length());
    },

    cross(a) {
        return this._x * a._y - this._y * a._x;
    },

    // returns the vector rotated by 90 degrees clockwise
    normal() {
        return CSGVector2D.Create(this._y, -this._x);
    },

    // Right multiply by a 4x4 matrix (the vector is interpreted as a row vector)
    // Returns a new CSG.Vector2D
    multiply4x4(matrix4x4) {
        return matrix4x4.leftMultiply1x2Vector(this);
    },

    transform(matrix4x4) {
        return matrix4x4.leftMultiply1x2Vector(this);
    },

    angle() {
        return this.angleRadians();
    },

    angleDegrees() {
        var radians = this.angleRadians();
        return 180 * radians / Math.PI;
    },

    angleRadians() {
        // y=sin, x=cos
        return Math.atan2(this._y, this._x);
    },

    min(p) {
        return CSGVector2D.Create(
            Math.min(this._x, p._x), Math.min(this._y, p._y));
    },

    max(p) {
        return CSGVector2D.Create(
            Math.max(this._x, p._x), Math.max(this._y, p._y));
    },

    toString() {
        return `(${this._x.toFixed(2)}, ${this._y.toFixed(2)})`;
    },

    abs() {
        return CSGVector2D.Create(Math.abs(this._x), Math.abs(this._y));
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

Object.defineProperty(CSGVector2D.prototype, 'x', {
    get() {
        return this._x;
    },
});

Object.defineProperty(CSGVector2D.prototype, 'y', {
    get() {
        return this._y;
    },
});

export {CSGVector2D};
