import {CAGVertex} from './CAGVertex.js';
import {CSGVector2D} from './CSGVector2D.js';
import {CSGVertex} from './CSGVertex.js';
import {CSGPolygon} from './CSGPolygon.js';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';

var CAGSide = function (vertex0, vertex1) {
    if (!(vertex0 instanceof CAGVertex)) {
        throw new Error('Assertion failed');
    }
    if (!(vertex1 instanceof CAGVertex)) {
        throw new Error('Assertion failed');
    }
    this.vertex0 = vertex0;
    this.vertex1 = vertex1;
};

CAGSide._fromFakePolygon = function (polygon) {
    polygon.vertices.forEach((v) => {
        if (!((v.pos.z >= -1.001) && (v.pos.z < -0.999)) && !((v.pos.z >= 0.999) && (v.pos.z < 1.001))) {
            throw ('Assertion failed: _fromFakePolygon expects abs z values of 1');
        }
    });
    // this can happen based on union, seems to be residuals -
    // return null and handle in caller
    if (polygon.vertices.length < 4) {
        return null;
    }
    var reverse = false;
    var vert1Indices = [];
    var pts2d = polygon.vertices.filter((v, i) => {
        if (v.pos.z > 0) {
            vert1Indices.push(i);
            return true;
        }
    })
        .map(v => new CSGVector2D(v.pos.x, v.pos.y));
    if (pts2d.length !== 2) {
        throw ('Assertion failed: _fromFakePolygon: not enough points found');
    }
    var d = vert1Indices[1] - vert1Indices[0];
    if (d === 1 || d === 3) {
        if (d === 1) {
            pts2d.reverse();
        }
    } else {
        throw ('Assertion failed: _fromFakePolygon: unknown index ordering');
    }
    var result = new CAGSide(new CAGVertex(pts2d[0]), new CAGVertex(pts2d[1]));
    return result;
};

Object.assign(CAGSide.prototype, {

    toString() {
        return `${this.vertex0} -> ${this.vertex1}`;
    },

    toPolygon3D(z0, z1) {
        var vertices = [
            new CSGVertex(this.vertex0.pos.toVector3D(z0)),
            new CSGVertex(this.vertex1.pos.toVector3D(z0)),
            new CSGVertex(this.vertex1.pos.toVector3D(z1)),
            new CSGVertex(this.vertex0.pos.toVector3D(z1)),
        ];
        return new CSGPolygon(vertices);
    },

    transform(matrix4x4) {
        var newp1 = this.vertex0.pos.transform(matrix4x4);
        var newp2 = this.vertex1.pos.transform(matrix4x4);
        return new CAGSide(new CAGVertex(newp1), new CAGVertex(newp2));
    },

    flipped() {
        return new CAGSide(this.vertex1, this.vertex0);
    },

    direction() {
        return this.vertex1.pos.minus(this.vertex0.pos);
    },

    getTag() {
        var result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    },

    lengthSquared() {
        var x = this.vertex1.pos.x - this.vertex0.pos.x;
        var y = this.vertex1.pos.y - this.vertex0.pos.y;
        return x * x + y * y;
    },

    length() {
        return Math.sqrt(this.lengthSquared());
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


export {CAGSide};
