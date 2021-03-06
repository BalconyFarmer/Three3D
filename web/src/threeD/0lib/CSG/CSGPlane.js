import {CSGVector3D} from './CSGVector3D.js';
import {CSGVertex} from './CSGVertex.js';
import {CSGPolygon} from './CSGPolygon.js';
import {CSGLine3D} from './CSGLine3D.js';
import {CSG} from './CSG';
import {CSGMatrix4x4} from './CSGMatrix4x4';

var CSGPlane = function (normal, w) {
    this.normal = normal;
    this.w = w;
};

CSGPlane.fromObject = function (obj) {
    var normal = new CSGVector3D(obj.normal);
    var w = parseFloat(obj.w);
    return new CSGPlane(normal, w);
};

// `CSG.Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
// point is on the plane.
CSGPlane.EPSILON = 1e-5;

CSGPlane.fromVector3Ds = function (a, b, c) {
    var n = b.minus(a).cross(c.minus(a)).unit();
    return new CSGPlane(n, n.dot(a));
};

// like fromVector3Ds, but allow the vectors to be on one point or one line
// in such a case a random plane through the given points is constructed
CSGPlane.anyPlaneFromVector3Ds = function (a, b, c) {
    var v1 = b.minus(a);
    var v2 = c.minus(a);
    if (v1.length() < 1e-5) {
        v1 = v2.randomNonParallelVector();
    }
    if (v2.length() < 1e-5) {
        v2 = v1.randomNonParallelVector();
    }
    var normal = v1.cross(v2);
    if (normal.length() < 1e-5) {
        // this would mean that v1 === v2.negated()
        v2 = v1.randomNonParallelVector();
        normal = v1.cross(v2);
    }
    normal = normal.unit();
    return new CSGPlane(normal, normal.dot(a));
};

CSGPlane.fromPoints = function (a, b, c) {
    a = new CSGVector3D(a);
    b = new CSGVector3D(b);
    c = new CSGVector3D(c);
    return CSGPlane.fromVector3Ds(a, b, c);
};

CSGPlane.fromNormalAndPoint = function (normal, point) {
    normal = new CSGVector3D(normal);
    point = new CSGVector3D(point);
    normal = normal.unit();
    var w = point.dot(normal);
    return new CSGPlane(normal, w);
};

Object.assign(CSGPlane.prototype, {

    flipped() {
        return new CSGPlane(this.normal.negated(), -this.w);
    },

    getTag() {
        var result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    },

    equals(n) {
        return this.normal.equals(n.normal) && this.w === n.w;
    },

    transform(matrix4x4) {
        var ismirror = matrix4x4.isMirroring();
        // get two vectors in the plane:
        var r = this.normal.randomNonParallelVector();
        var u = this.normal.cross(r);
        var v = this.normal.cross(u);
        // get 3 points in the plane:
        var point1 = this.normal.times(this.w);
        var point2 = point1.plus(u);
        var point3 = point1.plus(v);
        // transform the points:
        point1 = point1.multiply4x4(matrix4x4);
        point2 = point2.multiply4x4(matrix4x4);
        point3 = point3.multiply4x4(matrix4x4);
        // and create a new plane from the transformed points:
        var newplane = CSGPlane.fromVector3Ds(point1, point2, point3);
        if (ismirror) {
            // the transform is mirroring
            // We should mirror the plane:
            newplane = newplane.flipped();
        }
        return newplane;
    },

    // Returns object:
    // .type:
    //   0: coplanar-front
    //   1: coplanar-back
    //   2: front
    //   3: back
    //   4: spanning
    // In case the polygon is spanning, returns:
    // .front: a CSG.Polygon of the front part
    // .back: a CSG.Polygon of the back part
    splitPolygon(polygon) {
        var result = {
            type: null,
            front: null,
            back: null,
        };
        // cache in local vars (speedup):
        var planenormal = this.normal;
        var vertices = polygon.vertices;
        var numvertices = vertices.length;
        if (polygon.plane.equals(this)) {
            result.type = 0;
        } else {
            var EPS = CSGPlane.EPSILON;
            var thisw = this.w;
            var hasfront = false;
            var hasback = false;
            var vertexIsBack = [];
            var MINEPS = -EPS;
            for (var i = 0; i < numvertices; i++) {
                var t = planenormal.dot(vertices[i].pos) - thisw;
                var isback = (t < 0);
                vertexIsBack.push(isback);
                if (t > EPS) {
                    hasfront = true;
                }
                if (t < MINEPS) {
                    hasback = true;
                }
            }
            if ((!hasfront) && (!hasback)) {
                // all points coplanar
                var t = planenormal.dot(polygon.plane.normal);
                result.type = (t >= 0) ? 0 : 1;
            } else if (!hasback) {
                result.type = 2;
            } else if (!hasfront) {
                result.type = 3;
            } else {
                // spanning
                result.type = 4;
                var frontvertices = [];
                var backvertices = [];
                var isback = vertexIsBack[0];
                for (var vertexindex = 0; vertexindex < numvertices; vertexindex++) {
                    var vertex = vertices[vertexindex];
                    var nextvertexindex = vertexindex + 1;
                    if (nextvertexindex >= numvertices) {
                        nextvertexindex = 0;
                    }
                    var nextisback = vertexIsBack[nextvertexindex];
                    if (isback === nextisback) {
                        // line segment is on one side of the plane:
                        if (isback) {
                            backvertices.push(vertex);
                        } else {
                            frontvertices.push(vertex);
                        }
                    } else {
                        // line segment intersects plane:
                        var point = vertex.pos;
                        var nextpoint = vertices[nextvertexindex].pos;
                        var intersectionpoint = this.splitLineBetweenPoints(point, nextpoint);
                        var intersectionvertex = new CSGVertex(intersectionpoint);
                        if (isback) {
                            backvertices.push(vertex);
                            backvertices.push(intersectionvertex);
                            frontvertices.push(intersectionvertex);
                        } else {
                            frontvertices.push(vertex);
                            frontvertices.push(intersectionvertex);
                            backvertices.push(intersectionvertex);
                        }
                    }
                    isback = nextisback;
                } // for vertexindex
                // remove duplicate vertices:
                var EPS_SQUARED = CSGPlane.EPSILON * CSGPlane.EPSILON;
                if (backvertices.length >= 3) {
                    var prevvertex = backvertices[backvertices.length - 1];
                    for (var vertexindex = 0; vertexindex < backvertices.length; vertexindex++) {
                        var vertex = backvertices[vertexindex];
                        if (vertex.pos.distanceToSquared(prevvertex.pos) < EPS_SQUARED) {
                            backvertices.splice(vertexindex, 1);
                            vertexindex--;
                        }
                        prevvertex = vertex;
                    }
                }
                if (frontvertices.length >= 3) {
                    var prevvertex = frontvertices[frontvertices.length - 1];
                    for (var vertexindex = 0; vertexindex < frontvertices.length; vertexindex++) {
                        var vertex = frontvertices[vertexindex];
                        if (vertex.pos.distanceToSquared(prevvertex.pos) < EPS_SQUARED) {
                            frontvertices.splice(vertexindex, 1);
                            vertexindex--;
                        }
                        prevvertex = vertex;
                    }
                }
                if (frontvertices.length >= 3) {
                    result.front = new CSGPolygon(frontvertices, polygon.shared, polygon.plane);
                }
                if (backvertices.length >= 3) {
                    result.back = new CSGPolygon(backvertices, polygon.shared, polygon.plane);
                }
            }
        }
        return result;
    },

    // robust splitting of a line by a plane
    // will work even if the line is parallel to the plane
    splitLineBetweenPoints(p1, p2) {
        var direction = p2.minus(p1);
        var labda = (this.w - this.normal.dot(p1)) / this.normal.dot(direction);
        if (isNaN(labda)) {
            labda = 0;
        }
        if (labda > 1) {
            labda = 1;
        }
        if (labda < 0) {
            labda = 0;
        }
        var result = p1.plus(direction.times(labda));
        return result;
    },

    // returns CSG.Vector3D
    intersectWithLine(line3d) {
        return line3d.intersectWithPlane(this);
    },

    // intersection of two planes
    intersectWithPlane(plane) {
        return CSGLine3D.fromPlanes(this, plane);
    },

    signedDistanceToPoint(point) {
        var t = this.normal.dot(point) - this.w;
        return t;
    },

    toString() {
        return `[normal: ${this.normal.toString()}, w: ${this.w}]`;
    },

    mirrorPoint(point3d) {
        var distance = this.signedDistanceToPoint(point3d);
        var mirrored = point3d.minus(this.normal.times(distance * 2.0));
        return mirrored;
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

export {CSGPlane};
