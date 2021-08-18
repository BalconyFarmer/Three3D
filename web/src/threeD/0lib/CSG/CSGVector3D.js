import {CSGVector2D} from './CSGVector2D.js';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';

var CSGVector3D = function (x, y, z) {
    if (arguments.length === 3) {
        this._x = parseFloat(x);
        this._y = parseFloat(y);
        this._z = parseFloat(z);
    } else if (arguments.length === 2) {
        this._x = parseFloat(x);
        this._y = parseFloat(y);
        this._z = 0;
    } else {
        var ok = true;
        if (arguments.length === 1) {
            if (typeof (x) === 'object') {
                if (x instanceof CSGVector3D) {
                    this._x = x._x;
                    this._y = x._y;
                    this._z = x._z;
                } else if (x instanceof CSGVector2D) {
                    this._x = x._x;
                    this._y = x._y;
                    this._z = 0;
                } else if (x instanceof Array) {
                    if ((x.length < 2) || (x.length > 3)) {
                        ok = false;
                    } else {
                        this._x = parseFloat(x[0]);
                        this._y = parseFloat(x[1]);
                        if (x.length === 3) {
                            this._z = parseFloat(x[2]);
                        } else {
                            this._z = 0;
                        }
                    }
                } else if (('x' in x) && ('y' in x)) {
                    this._x = parseFloat(x.x);
                    this._y = parseFloat(x.y);
                    if ('z' in x) {
                        this._z = parseFloat(x.z);
                    } else {
                        this._z = 0;
                    }
                } else {
                    ok = false;
                }
            } else {
                var v = parseFloat(x);
                this._x = v;
                this._y = v;
                this._z = v;
            }
        } else {
            ok = false;
        }
        if (ok) {
            if ((!CSG.IsFloat(this._x)) || (!CSG.IsFloat(this._y)) || (!CSG.IsFloat(this._z))) {
                ok = false;
            }
        }
        if (!ok) {
            throw new Error('wrong arguments');
        }
    }
};

CSGVector3D.Create = function (x, y, z) {
    var result = Object.create(CSGVector3D.prototype);
    result._x = x;
    result._y = y;
    result._z = z;
    return result;
};

Object.assign(CSGVector3D.prototype, {

    clone() {
        return CSGVector3D.Create(this._x, this._y, this._z);
    },
    negated() {
        return CSGVector3D.Create(-this._x, -this._y, -this._z);
    },
    abs() {
        return CSGVector3D.Create(Math.abs(this._x), Math.abs(this._y), Math.abs(this._z));
    },
    plus(a) {
        return CSGVector3D.Create(this._x + a._x, this._y + a._y, this._z + a._z);
    },
    minus(a) {
        return CSGVector3D.Create(this._x - a._x, this._y - a._y, this._z - a._z);
    },
    times(a) {
        return CSGVector3D.Create(this._x * a, this._y * a, this._z * a);
    },
    dividedBy(a) {
        return CSGVector3D.Create(this._x / a, this._y / a, this._z / a);
    },
    dot(a) {
        return this._x * a._x + this._y * a._y + this._z * a._z;
    },
    lerp(a, t) {
        return this.plus(a.minus(this).times(t));
    },
    lengthSquared() {
        return this.dot(this);
    },
    length() {
        return Math.sqrt(this.lengthSquared());
    },
    unit() {
        return this.dividedBy(this.length());
    },
    cross(a) {
        return CSGVector3D.Create(
            this._y * a._z - this._z * a._y, this._z * a._x - this._x * a._z, this._x * a._y - this._y * a._x);
    },
    distanceTo(a) {
        return this.minus(a).length();
    },
    distanceToSquared(a) {
        return this.minus(a).lengthSquared();
    },
    equals(a) {
        return (this._x === a._x) && (this._y === a._y) && (this._z === a._z);
    },
    // Right multiply by a 4x4 matrix (the vector is interpreted as a row vector)
    // Returns a new CSG.Vector3D
    multiply4x4(matrix4x4) {
        return matrix4x4.leftMultiply1x3Vector(this);
    },
    transform(matrix4x4) {
        return matrix4x4.leftMultiply1x3Vector(this);
    },
    toString() {
        return `(${this._x.toFixed(2)}, ${this._y.toFixed(2)}, ${this._z.toFixed(2)})`;
    },
    // find a vector that is somewhat perpendicular to this one
    randomNonParallelVector() {
        var abs = this.abs();
        if ((abs._x <= abs._y) && (abs._x <= abs._z)) {
            return CSGVector3D.Create(1, 0, 0);
        } else if ((abs._y <= abs._x) && (abs._y <= abs._z)) {
            return CSGVector3D.Create(0, 1, 0);
        } else {
            return CSGVector3D.Create(0, 0, 1);
        }
    },
    min(p) {
        return CSGVector3D.Create(
            Math.min(this._x, p._x), Math.min(this._y, p._y), Math.min(this._z, p._z));
    },
    max(p) {
        return CSGVector3D.Create(
            Math.max(this._x, p._x), Math.max(this._y, p._y), Math.max(this._z, p._z));
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

Object.defineProperty(CSGVector3D.prototype, 'x', {
    get() {
        return this._x;
    },
});

Object.defineProperty(CSGVector3D.prototype, 'y', {
    get() {
        return this._y;
    },
});

Object.defineProperty(CSGVector3D.prototype, 'z', {
    get() {
        return this._z;
    },
});

export {CSGVector3D};
