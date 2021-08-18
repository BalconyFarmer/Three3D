import {CSGVector3D} from './CSGVector3D.js';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';

var CSGVertex = function (pos) {
    this.pos = pos;
};

CSGVertex.fromObject = function (obj) {
    var pos = new CSGVector3D(obj.pos);
    return new CSGVertex(pos);
};

Object.assign(CSGVertex.prototype, {

    // Return a vertex with all orientation-specific data (e.g. vertex normal) flipped. Called when the
    // orientation of a polygon is flipped.
    flipped() {
        return this;
    },

    getTag() {
        var result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    },

    // Create a new vertex between this vertex and `other` by linearly
    // interpolating all properties using a parameter of `t`. Subclasses should
    // override this to interpolate additional properties.
    interpolate(other, t) {
        var newpos = this.pos.lerp(other.pos, t);
        return new CSGVertex(newpos);
    },

    // Affine transformation of vertex. Returns a new CSG.Vertex
    transform(matrix4x4) {
        var newpos = this.pos.multiply4x4(matrix4x4);
        return new CSGVertex(newpos);
    },

    toString() {
        return this.pos.toString();
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

export {CSGVertex};
