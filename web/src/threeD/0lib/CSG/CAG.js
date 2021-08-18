import {CSGVector2D} from './CSGVector2D.js';
import {CAGVertex} from './CAGVertex.js';
import {CAGSide} from './CAGSide.js';
import {CSG} from './CSG.js';
import {CSGConnector} from './CSGConnector.js';
import {CSGVector3D} from './CSGVector3D.js';
import {CSGPolygon} from './CSGPolygon.js';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis.js';
import {CSGVertex} from './CSGVertex.js';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CAGFuzzyFactory} from './CAGFuzzyFactory.js';
import {CSGPath2D} from './CSGPath2D.js';

var CAG = function () {
    this.sides = [];
};

CAG.fromSides = function (sides) {
    var cag = new CAG();
    cag.sides = sides;
    return cag;
};

// Construct a CAG from a list of points (a polygon)
// Rotation direction of the points is not relevant. Points can be a convex or concave polygon.
// Polygon must not self intersect
CAG.fromPoints = function (points) {
    var numpoints = points.length;
    if (numpoints < 3) {
        throw new Error('CAG shape needs at least 3 points');
    }
    var sides = [];
    var prevpoint = new CSGVector2D(points[numpoints - 1]);
    var prevvertex = new CAGVertex(prevpoint);
    points.map((p) => {
        var point = new CSGVector2D(p);
        var vertex = new CAGVertex(point);
        var side = new CAGSide(prevvertex, vertex);
        sides.push(side);
        prevvertex = vertex;
    });
    var result = CAG.fromSides(sides);
    if (result.isSelfIntersecting()) {
        throw new Error('Polygon is self intersecting!');
    }
    var area = result.area();
    if (Math.abs(area) < 1e-5) {
        throw new Error('Degenerate polygon!');
    }
    if (area < 0) {
        result = result.flipped();
    }
    result = result.canonicalized();
    return result;
};

// Like CAG.fromPoints but does not check if it's a valid polygon.
// Points should rotate counter clockwise
CAG.fromPointsNoCheck = function (points) {
    var sides = [];
    var prevpoint = new CSGVector2D(points[points.length - 1]);
    var prevvertex = new CAGVertex(prevpoint);
    points.map((p) => {
        var point = new CSGVector2D(p);
        var vertex = new CAGVertex(point);
        var side = new CAGSide(prevvertex, vertex);
        sides.push(side);
        prevvertex = vertex;
    });
    return CAG.fromSides(sides);
};

// Converts a CSG to a CAG. The CSG must consist of polygons with only z coordinates +1 and -1
// as constructed by CAG._toCSGWall(-1, 1). This is so we can use the 3D union(), intersect() etc
CAG.fromFakeCSG = function (csg) {
    var sides = csg.polygons.map(p => CAGSide._fromFakePolygon(p))
        .filter(s => s !== null);
    return CAG.fromSides(sides);
};

// see if the line between p0start and p0end intersects with the line between p1start and p1end
// returns true if the lines strictly intersect, the end points are not counted!
CAG.linesIntersect = function (p0start, p0end, p1start, p1end) {
    if (p0end.equals(p1start) || p1end.equals(p0start)) {
        var d = p1end.minus(p1start).unit().plus(p0end.minus(p0start).unit()).length();
        if (d < 1e-5) {
            return true;
        }
    } else {
        var d0 = p0end.minus(p0start);
        var d1 = p1end.minus(p1start);
        if (Math.abs(d0.cross(d1)) < 1e-9) {
            return false;
        } // lines are parallel
        var alphas = CSG.solve2Linear(-d0.x, d1.x, -d0.y, d1.y, p0start.x - p1start.x, p0start.y - p1start.y);
        if ((alphas[0] > 1e-6) && (alphas[0] < 0.999999) && (alphas[1] > 1e-5) && (alphas[1] < 0.999999)) {
            return true;
        }
        //    if( (alphas[0] >= 0) && (alphas[0] <= 1) && (alphas[1] >= 0) && (alphas[1] <= 1) ) return true;
    }
    return false;
};

/* Construct a circle
    options:
      center: a 2D center point
      radius: a scalar
      resolution: number of sides per 360 degree rotation
    returns a CAG object
    */
CAG.circle = function (options) {
    options = options || {};
    var center = CSG.parseOptionAs2DVector(options, 'center', [0, 0]);
    var radius = CSG.parseOptionAsFloat(options, 'radius', 1);
    var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
    var sides = [];
    var prevvertex;
    for (var i = 0; i <= resolution; i++) {
        var radians = 2 * Math.PI * i / resolution;
        var point = CSGVector2D.fromAngleRadians(radians).times(radius).plus(center);
        var vertex = new CAGVertex(point);
        if (i > 0) {
            sides.push(new CAGSide(prevvertex, vertex));
        }
        prevvertex = vertex;
    }
    return CAG.fromSides(sides);
};

/* Construct a rectangle
    options:
      center: a 2D center point
      radius: a 2D vector with width and height
      returns a CAG object
    */
CAG.rectangle = function (options) {
    options = options || {};
    var c;
    var
        r;
    if (('corner1' in options) || ('corner2' in options)) {
        if (('center' in options) || ('radius' in options)) {
            throw new Error('rectangle: should either give a radius and center parameter, or a corner1 and corner2 parameter');
        }
        var corner1 = CSG.parseOptionAs2DVector(options, 'corner1', [0, 0]);
        var corner2 = CSG.parseOptionAs2DVector(options, 'corner2', [1, 1]);
        c = corner1.plus(corner2).times(0.5);
        r = corner2.minus(corner1).times(0.5);
    } else {
        c = CSG.parseOptionAs2DVector(options, 'center', [0, 0]);
        r = CSG.parseOptionAs2DVector(options, 'radius', [1, 1]);
    }
    r = r.abs(); // negative radii make no sense
    var rswap = new CSGVector2D(r.x, -r.y);
    var points = [
        c.plus(r), c.plus(rswap), c.minus(r), c.minus(rswap),
    ];
    return CAG.fromPoints(points);
};

//     var r = CSG.roundedRectangle({
//       center: [0, 0],
//       radius: [2, 1],
//       roundradius: 0.2,
//       resolution: 8,
//     });
CAG.roundedRectangle = function (options) {
    options = options || {};
    var center;
    var
        radius;
    if (('corner1' in options) || ('corner2' in options)) {
        if (('center' in options) || ('radius' in options)) {
            throw new Error('roundedRectangle: should either give a radius and center parameter, or a corner1 and corner2 parameter');
        }
        var corner1 = CSG.parseOptionAs2DVector(options, 'corner1', [0, 0]);
        var corner2 = CSG.parseOptionAs2DVector(options, 'corner2', [1, 1]);
        center = corner1.plus(corner2).times(0.5);
        radius = corner2.minus(corner1).times(0.5);
    } else {
        center = CSG.parseOptionAs2DVector(options, 'center', [0, 0]);
        radius = CSG.parseOptionAs2DVector(options, 'radius', [1, 1]);
    }
    radius = radius.abs(); // negative radii make no sense
    var roundradius = CSG.parseOptionAsFloat(options, 'roundradius', 0.2);
    var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
    var maxroundradius = Math.min(radius.x, radius.y);
    maxroundradius -= 0.1;
    roundradius = Math.min(roundradius, maxroundradius);
    roundradius = Math.max(0, roundradius);
    radius = new CSGVector2D(radius.x - roundradius, radius.y - roundradius);
    var rect = CAG.rectangle({
        center,
        radius,
    });
    if (roundradius > 0) {
        rect = rect.expand(roundradius, resolution);
    }
    return rect;
};

// Reconstruct a CAG from the output of toCompactBinary()
CAG.fromCompactBinary = function (bin) {
    if (bin.class !== 'CAG') {
        throw new Error('Not a CAG');
    }
    var vertices = [];
    var vertexData = bin.vertexData;
    var numvertices = vertexData.length / 2;
    var arrayindex = 0;
    for (var vertexindex = 0; vertexindex < numvertices; vertexindex++) {
        var x = vertexData[arrayindex++];
        var y = vertexData[arrayindex++];
        var pos = new CSGVector2D(x, y);
        var vertex = new CAGVertex(pos);
        vertices.push(vertex);
    }
    var sides = [];
    var numsides = bin.sideVertexIndices.length / 2;
    arrayindex = 0;
    for (var sideindex = 0; sideindex < numsides; sideindex++) {
        var vertexindex0 = bin.sideVertexIndices[arrayindex++];
        var vertexindex1 = bin.sideVertexIndices[arrayindex++];
        var side = new CAGSide(vertices[vertexindex0], vertices[vertexindex1]);
        sides.push(side);
    }
    var cag = CAG.fromSides(sides);
    cag.isCanonicalized = true;
    return cag;
};

Object.assign(CAG.prototype, {

    toString() {
        var result = `CAG (${this.sides.length} sides):\n`;
        this.sides.map((side) => {
            result += `  ${side.toString()}\n`;
        });
        return result;
    },

    _toCSGWall(z0, z1) {
        var polygons = this.sides.map(side => side.toPolygon3D(z0, z1));
        return CSG.fromPolygons(polygons);
    },

    _toVector3DPairs(m) {
        // transform m
        var pairs = this.sides.map((side) => {
            var p0 = side.vertex0.pos;
            var p1 = side.vertex1.pos;
            return [
                CSGVector3D.Create(p0.x, p0.y, 0),
                CSGVector3D.Create(p1.x, p1.y, 0),
            ];
        });
        if (typeof m !== 'undefined') {
            pairs = pairs.map(pair => pair.map(v => v.transform(m)));
        }
        return pairs;
    },

    /*
         * transform a cag into the polygons of a corresponding 3d plane, positioned per options
         * Accepts a connector for plane positioning, or optionally
         * single translation, axisVector, normalVector arguments
         * (toConnector has precedence over single arguments if provided)
         */
    _toPlanePolygons(options) {
        var flipped = options.flipped || false;
        // reference connector for transformation
        var origin = [0, 0, 0];
        var defaultAxis = [0, 0, 1];
        var defaultNormal = [0, 1, 0];
        var thisConnector = new CSGConnector(origin, defaultAxis, defaultNormal);
        // translated connector per options
        var translation = options.translation || origin;
        var axisVector = options.axisVector || defaultAxis;
        var normalVector = options.normalVector || defaultNormal;
        // will override above if options has toConnector
        var toConnector = options.toConnector ||
            new CSGConnector(translation, axisVector, normalVector);
        // resulting transform
        var m = thisConnector.getTransformationTo(toConnector, false, 0);
        // create plane as a (partial non-closed) CSG in XY plane
        var bounds = this.getBounds();
        bounds[0] = bounds[0].minus(new CSGVector2D(1, 1));
        bounds[1] = bounds[1].plus(new CSGVector2D(1, 1));
        var csgshell = this._toCSGWall(-1, 1);
        var csgplane = CSG.fromPolygons([new CSGPolygon([
            new CSGVertex(new CSGVector3D(bounds[0].x, bounds[0].y, 0)),
            new CSGVertex(new CSGVector3D(bounds[1].x, bounds[0].y, 0)),
            new CSGVertex(new CSGVector3D(bounds[1].x, bounds[1].y, 0)),
            new CSGVertex(new CSGVector3D(bounds[0].x, bounds[1].y, 0)),
        ])]);
        if (flipped) {
            csgplane = csgplane.invert();
        }
        // intersectSub -> prevent premature retesselate/canonicalize
        csgplane = csgplane.intersectSub(csgshell);
        // only keep the polygons in the z plane:
        var polys = csgplane.polygons.filter(polygon => Math.abs(polygon.plane.normal.z) > 0.99);
        // finally, position the plane per passed transformations
        return polys.map(poly => poly.transform(m));
    },

    /*
         * given 2 connectors, this returns all polygons of a "wall" between 2
         * copies of this cag, positioned in 3d space as "bottom" and
         * "top" plane per connectors toConnector1, and toConnector2, respectively
         */
    _toWallPolygons(options) {
        // normals are going to be correct as long as toConn2.point - toConn1.point
        // points into cag normal direction (check in caller)
        // arguments: options.toConnector1, options.toConnector2, options.cag
        //     walls go from toConnector1 to toConnector2
        //     optionally, target cag to point to - cag needs to have same number of sides as this!
        var origin = [0, 0, 0];
        var defaultAxis = [0, 0, 1];
        var defaultNormal = [0, 1, 0];
        var thisConnector = new CSGConnector(origin, defaultAxis, defaultNormal);
        // arguments:
        var toConnector1 = options.toConnector1;
        // var toConnector2 = new CSGConnector([0, 0, -30], defaultAxis, defaultNormal);
        var toConnector2 = options.toConnector2;
        if (!(toConnector1 instanceof CSGConnector && toConnector2 instanceof CSGConnector)) {
            throw ('could not parse CSG.Connector arguments toConnector1 or toConnector2');
        }
        if (options.cag) {
            if (options.cag.sides.length !== this.sides.length) {
                throw ('target cag needs same sides count as start cag');
            }
        }
        // target cag is same as this unless specified
        var toCag = options.cag || this;
        var m1 = thisConnector.getTransformationTo(toConnector1, false, 0);
        var m2 = thisConnector.getTransformationTo(toConnector2, false, 0);
        var vps1 = this._toVector3DPairs(m1);
        var vps2 = toCag._toVector3DPairs(m2);
        var polygons = [];
        vps1.forEach((vp1, i) => {
            polygons.push(new CSGPolygon([
                new CSGVertex(vps2[i][1]), new CSGVertex(vps2[i][0]), new CSGVertex(vp1[0]),
            ]));
            polygons.push(new CSGPolygon([
                new CSGVertex(vps2[i][1]), new CSGVertex(vp1[0]), new CSGVertex(vp1[1]),
            ]));
        });
        return polygons;
    },

    union(cag) {
        var cags;
        if (cag instanceof Array) {
            cags = cag;
        } else {
            cags = [cag];
        }
        var r = this._toCSGWall(-1, 1);
        var r = r.union(
            cags.map(cag => cag._toCSGWall(-1, 1).reTesselated()), false, false);
        return CAG.fromFakeCSG(r).canonicalized();
    },

    subtract(cag) {
        var cags;
        if (cag instanceof Array) {
            cags = cag;
        } else {
            cags = [cag];
        }
        var r = this._toCSGWall(-1, 1);
        cags.map((cag) => {
            r = r.subtractSub(cag._toCSGWall(-1, 1), false, false);
        });
        r = r.reTesselated();
        r = r.canonicalized();
        r = CAG.fromFakeCSG(r);
        r = r.canonicalized();
        return r;
    },

    intersect(cag) {
        var cags;
        if (cag instanceof Array) {
            cags = cag;
        } else {
            cags = [cag];
        }
        var r = this._toCSGWall(-1, 1);
        cags.map((cag) => {
            r = r.intersectSub(cag._toCSGWall(-1, 1), false, false);
        });
        r = r.reTesselated();
        r = r.canonicalized();
        r = CAG.fromFakeCSG(r);
        r = r.canonicalized();
        return r;
    },

    transform(matrix4x4) {
        var ismirror = matrix4x4.isMirroring();
        var newsides = this.sides.map(side => side.transform(matrix4x4));
        var result = CAG.fromSides(newsides);
        if (ismirror) {
            result = result.flipped();
        }
        return result;
    },

    // see http://local.wasp.uwa.edu.au/~pbourke/geometry/polyarea/ :
    // Area of the polygon. For a counter clockwise rotating polygon the area is positive, otherwise negative
    // Note(bebbi): this looks wrong. See polygon getArea()
    area() {
        var polygonArea = 0;
        this.sides.map((side) => {
            polygonArea += side.vertex0.pos.cross(side.vertex1.pos);
        });
        polygonArea *= 0.5;
        return polygonArea;
    },

    flipped() {
        var newsides = this.sides.map(side => side.flipped());
        newsides.reverse();
        return CAG.fromSides(newsides);
    },

    getBounds() {
        var minpoint;
        if (this.sides.length === 0) {
            minpoint = new CSGVector2D(0, 0);
        } else {
            minpoint = this.sides[0].vertex0.pos;
        }
        var maxpoint = minpoint;
        this.sides.map((side) => {
            minpoint = minpoint.min(side.vertex0.pos);
            minpoint = minpoint.min(side.vertex1.pos);
            maxpoint = maxpoint.max(side.vertex0.pos);
            maxpoint = maxpoint.max(side.vertex1.pos);
        });
        return [minpoint, maxpoint];
    },

    isSelfIntersecting(debug) {
        var numsides = this.sides.length;
        for (var i = 0; i < numsides; i++) {
            var side0 = this.sides[i];
            for (var ii = i + 1; ii < numsides; ii++) {
                var side1 = this.sides[ii];
                if (CAG.linesIntersect(side0.vertex0.pos, side0.vertex1.pos, side1.vertex0.pos, side1.vertex1.pos)) {
                    if (debug) {
                        console.log(side0);
                        console.log(side1);
                    }
                    return true;
                }
            }
        }
        return false;
    },

    expandedShell(radius, resolution) {
        resolution = resolution || 8;
        if (resolution < 4) {
            resolution = 4;
        }
        var cags = [];
        var pointmap = {};
        var cag = this.canonicalized();
        cag.sides.map((side) => {
            var d = side.vertex1.pos.minus(side.vertex0.pos);
            var dl = d.length();
            if (dl > 1e-5) {
                d = d.times(1.0 / dl);
                var normal = d.normal().times(radius);
                var shellpoints = [
                    side.vertex1.pos.plus(normal),
                    side.vertex1.pos.minus(normal),
                    side.vertex0.pos.minus(normal),
                    side.vertex0.pos.plus(normal),
                ];
                //      var newcag = CAG.fromPointsNoCheck(shellpoints);
                var newcag = CAG.fromPoints(shellpoints);
                cags.push(newcag);
                for (var step = 0; step < 2; step++) {
                    var p1 = (step === 0) ? side.vertex0.pos : side.vertex1.pos;
                    var p2 = (step === 0) ? side.vertex1.pos : side.vertex0.pos;
                    var tag = `${p1.x} ${p1.y}`;
                    if (!(tag in pointmap)) {
                        pointmap[tag] = [];
                    }
                    pointmap[tag].push({
                        p1,
                        p2,
                    });
                }
            }
        });
        for (var tag in pointmap) {
            var m = pointmap[tag];
            var angle1;
            var
                angle2;
            var pcenter = m[0].p1;
            if (m.length === 2) {
                var end1 = m[0].p2;
                var end2 = m[1].p2;
                angle1 = end1.minus(pcenter).angleDegrees();
                angle2 = end2.minus(pcenter).angleDegrees();
                if (angle2 < angle1) {
                    angle2 += 360;
                }
                if (angle2 >= (angle1 + 360)) {
                    angle2 -= 360;
                }
                if (angle2 < angle1 + 180) {
                    var t = angle2;
                    angle2 = angle1 + 360;
                    angle1 = t;
                }
                angle1 += 90;
                angle2 -= 90;
            } else {
                angle1 = 0;
                angle2 = 360;
            }
            var fullcircle = (angle2 > angle1 + 359.999);
            if (fullcircle) {
                angle1 = 0;
                angle2 = 360;
            }
            if (angle2 > (angle1 + 1e-5)) {
                var points = [];
                if (!fullcircle) {
                    points.push(pcenter);
                }
                var numsteps = Math.round(resolution * (angle2 - angle1) / 360);
                if (numsteps < 1) {
                    numsteps = 1;
                }
                for (var step = 0; step <= numsteps; step++) {
                    var angle = angle1 + step / numsteps * (angle2 - angle1);
                    if (step === numsteps) {
                        angle = angle2;
                    } // prevent rounding errors
                    var point = pcenter.plus(CSGVector2D.fromAngleDegrees(angle).times(radius));
                    if ((!fullcircle) || (step > 0)) {
                        points.push(point);
                    }
                }
                var newcag = CAG.fromPointsNoCheck(points);
                cags.push(newcag);
            }
        }
        var result = new CAG();
        result = result.union(cags);
        return result;
    },

    expand(radius, resolution) {
        var result = this.union(this.expandedShell(radius, resolution));
        return result;
    },

    contract(radius, resolution) {
        var result = this.subtract(this.expandedShell(radius, resolution));
        return result;
    },

    // extrude the CAG in a certain plane.
    // Giving just a plane is not enough, multiple different extrusions in the same plane would be possible
    // by rotating around the plane's origin. An additional right-hand vector should be specified as well,
    // and this is exactly a CSG.OrthoNormalBasis.
    // orthonormalbasis: characterizes the plane in which to extrude
    // depth: thickness of the extruded shape. Extrusion is done from the plane towards above (unless
    // symmetrical option is set, see below)
    //
    // options:
    //   {symmetrical: true}  // extrude symmetrically in two directions about the plane
    extrudeInOrthonormalBasis(orthonormalbasis, depth, options) {
        // first extrude in the regular Z plane:
        if (!(orthonormalbasis instanceof CSGOrthoNormalBasis)) {
            throw new Error('extrudeInPlane: the first parameter should be a CSG.OrthoNormalBasis');
        }
        var extruded = this.extrude({
            offset: [0, 0, depth],
        });
        if (CSG.parseOptionAsBool(options, 'symmetrical', false)) {
            extruded = extruded.translate([0, 0, -depth / 2]);
        }
        var matrix = orthonormalbasis.getInverseProjectionMatrix();
        extruded = extruded.transform(matrix);
        return extruded;
    },

    // Extrude in a standard cartesian plane, specified by two axis identifiers. Each identifier can be
    // one of ["X","Y","Z","-X","-Y","-Z"]
    // The 2d x axis will map to the first given 3D axis, the 2d y axis will map to the second.
    // See CSG.OrthoNormalBasis.GetCartesian for details.
    extrudeInPlane(axis1, axis2, depth, options) {
        return this.extrudeInOrthonormalBasis(CSGOrthoNormalBasis.GetCartesian(axis1, axis2), depth, options);
    },

    // extruded=cag.extrude({offset: [0,0,10], twistangle: 360, twiststeps: 100});
    // linear extrusion of 2D shape, with optional twist
    // The 2d shape is placed in in z=0 plane and extruded into direction <offset> (a CSG.Vector3D)
    // The final face is rotated <twistangle> degrees. Rotation is done around the origin of the 2d shape (i.e. x=0, y=0)
    // twiststeps determines the resolution of the twist (should be >= 1)
    // returns a CSG object
    extrude(options) {
        if (this.sides.length === 0) {
            // empty!
            return new CSG();
        }
        var offsetVector = CSG.parseOptionAs3DVector(options, 'offset', [0, 0, 1]);
        var twistangle = CSG.parseOptionAsFloat(options, 'twistangle', 0);
        var twiststeps = CSG.parseOptionAsInt(options, 'twiststeps', CSG.defaultResolution3D);
        if (offsetVector.z === 0) {
            throw ('offset cannot be orthogonal to Z axis');
        }
        if (twistangle === 0 || twiststeps < 1) {
            twiststeps = 1;
        }
        var normalVector = CSGVector3D.Create(0, 1, 0);
        var polygons = [];
        // bottom and top
        polygons = polygons.concat(this._toPlanePolygons({
            translation: [0, 0, 0],
            normalVector,
            flipped: !(offsetVector.z < 0),
        }));
        polygons = polygons.concat(this._toPlanePolygons({
            translation: offsetVector,
            normalVector: normalVector.rotateZ(twistangle),
            flipped: offsetVector.z < 0,
        }));
        // walls
        for (var i = 0; i < twiststeps; i++) {
            var c1 = new CSGConnector(offsetVector.times(i / twiststeps), [0, 0, offsetVector.z],
                normalVector.rotateZ(i * twistangle / twiststeps));
            var c2 = new CSGConnector(offsetVector.times((i + 1) / twiststeps), [0, 0, offsetVector.z],
                normalVector.rotateZ((i + 1) * twistangle / twiststeps));
            polygons = polygons.concat(this._toWallPolygons({
                toConnector1: c1,
                toConnector2: c2,
            }));
        }
        return CSG.fromPolygons(polygons);
    },

    /*
         * extrude CAG to 3d object by rotating the origin around the y axis
         * (and turning everything into XY plane)
         * arguments: options dict with angle and resolution, both optional
         */
    rotateExtrude(options) {
        var alpha = CSG.parseOptionAsFloat(options, 'angle', 360);
        var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
        var EPS = 1e-5;
        alpha = alpha > 360 ? alpha % 360 : alpha;
        var origin = [0, 0, 0];
        var axisV = CSGVector3D.Create(0, 1, 0);
        var normalV = [0, 0, 1];
        var polygons = [];
        // planes only needed if alpha > 0
        var connS = new CSGConnector(origin, axisV, normalV);
        if (alpha > 0 && alpha < 360) {
            // we need to rotate negative to satisfy wall function condition of
            // building in the direction of axis vector
            var connE = new CSGConnector(origin, axisV.rotateZ(-alpha), normalV);
            polygons = polygons.concat(
                this._toPlanePolygons({
                    toConnector: connS,
                    flipped: true,
                }));
            polygons = polygons.concat(
                this._toPlanePolygons({
                    toConnector: connE,
                }));
        }
        var connT1 = connS;
        var connT2;
        var step = alpha / resolution;
        for (var a = step; a <= alpha + EPS; a += step) {
            connT2 = new CSGConnector(origin, axisV.rotateZ(-a), normalV);
            polygons = polygons.concat(this._toWallPolygons({
                toConnector1: connT1,
                toConnector2: connT2,
            }));
            connT1 = connT2;
        }
        return CSG.fromPolygons(polygons).reTesselated();
    },

    // check if we are a valid CAG (for debugging)
    // NOTE(bebbi) uneven side count doesn't work because rounding with EPS isn't taken into account
    check() {
        var EPS = 1e-5;
        var errors = [];
        if (this.isSelfIntersecting(true)) {
            errors.push('Self intersects');
        }
        var pointcount = {};
        this.sides.map((side) => {
            function mappoint(p) {
                var tag = `${p.x} ${p.y}`;
                if (!(tag in pointcount)) {
                    pointcount[tag] = 0;
                }
                pointcount[tag]++;
            }

            mappoint(side.vertex0.pos);
            mappoint(side.vertex1.pos);
        });
        for (var tag in pointcount) {
            var count = pointcount[tag];
            if (count & 1) {
                errors.push(`Uneven number of sides (${count}) for point ${tag}`);
            }
        }
        var area = this.area();
        if (area < EPS * EPS) {
            errors.push(`Area is ${area}`);
        }
        if (errors.length > 0) {
            var ertxt = '';
            errors.map((err) => {
                ertxt += `${err}\n`;
            });
            throw new Error(ertxt);
        }
    },

    canonicalized() {
        if (this.isCanonicalized) {
            return this;
        } else {
            var factory = new CAGFuzzyFactory();
            var result = factory.getCAG(this);
            result.isCanonicalized = true;
            return result;
        }
    },

    toCompactBinary() {
        var cag = this.canonicalized();
        var numsides = cag.sides.length;
        var vertexmap = {};
        var vertices = [];
        var numvertices = 0;
        var sideVertexIndices = new Uint32Array(2 * numsides);
        var sidevertexindicesindex = 0;
        cag.sides.map((side) => {
            [side.vertex0, side.vertex1].map((v) => {
                var vertextag = v.getTag();
                var vertexindex;
                if (!(vertextag in vertexmap)) {
                    vertexindex = numvertices++;
                    vertexmap[vertextag] = vertexindex;
                    vertices.push(v);
                } else {
                    vertexindex = vertexmap[vertextag];
                }
                sideVertexIndices[sidevertexindicesindex++] = vertexindex;
            });
        });
        var vertexData = new Float64Array(numvertices * 2);
        var verticesArrayIndex = 0;
        vertices.map((v) => {
            var pos = v.pos;
            vertexData[verticesArrayIndex++] = pos._x;
            vertexData[verticesArrayIndex++] = pos._y;
        });
        var result = {
            class: 'CAG',
            sideVertexIndices,
            vertexData,
        };
        return result;
    },

    getOutlinePaths() {
        var cag = this.canonicalized();
        var sideTagToSideMap = {};
        var startVertexTagToSideTagMap = {};
        cag.sides.map((side) => {
            var sidetag = side.getTag();
            sideTagToSideMap[sidetag] = side;
            var startvertextag = side.vertex0.getTag();
            if (!(startvertextag in startVertexTagToSideTagMap)) {
                startVertexTagToSideTagMap[startvertextag] = [];
            }
            startVertexTagToSideTagMap[startvertextag].push(sidetag);
        });
        var paths = [];
        while (true) {
            var startsidetag = null;
            for (var aVertexTag in startVertexTagToSideTagMap) {
                var sidesForThisVertex = startVertexTagToSideTagMap[aVertexTag];
                startsidetag = sidesForThisVertex[0];
                sidesForThisVertex.splice(0, 1);
                if (sidesForThisVertex.length === 0) {
                    delete startVertexTagToSideTagMap[aVertexTag];
                }
                break;
            }
            if (startsidetag === null) {
                break;
            } // we've had all sides
            var connectedVertexPoints = [];
            var sidetag = startsidetag;
            var thisside = sideTagToSideMap[sidetag];
            var startvertextag = thisside.vertex0.getTag();
            while (true) {
                connectedVertexPoints.push(thisside.vertex0.pos);
                var nextvertextag = thisside.vertex1.getTag();
                if (nextvertextag === startvertextag) {
                    break;
                } // we've closed the polygon
                if (!(nextvertextag in startVertexTagToSideTagMap)) {
                    throw new Error('Area is not closed!');
                }
                var nextpossiblesidetags = startVertexTagToSideTagMap[nextvertextag];
                var nextsideindex = -1;
                if (nextpossiblesidetags.length === 1) {
                    nextsideindex = 0;
                } else {
                    // more than one side starting at the same vertex. This means we have
                    // two shapes touching at the same corner
                    var bestangle = null;
                    var thisangle = thisside.direction().angleDegrees();
                    for (var sideindex = 0; sideindex < nextpossiblesidetags.length; sideindex++) {
                        var nextpossiblesidetag = nextpossiblesidetags[sideindex];
                        var possibleside = sideTagToSideMap[nextpossiblesidetag];
                        var angle = possibleside.direction().angleDegrees();
                        var angledif = angle - thisangle;
                        if (angledif < -180) {
                            angledif += 360;
                        }
                        if (angledif >= 180) {
                            angledif -= 360;
                        }
                        if ((nextsideindex < 0) || (angledif > bestangle)) {
                            nextsideindex = sideindex;
                            bestangle = angledif;
                        }
                    }
                }
                var nextsidetag = nextpossiblesidetags[nextsideindex];
                nextpossiblesidetags.splice(nextsideindex, 1);
                if (nextpossiblesidetags.length === 0) {
                    delete startVertexTagToSideTagMap[nextvertextag];
                }
                thisside = sideTagToSideMap[nextsidetag];
            } // inner loop
            var path = new CSGPath2D(connectedVertexPoints, true);
            paths.push(path);
        } // outer loop
        return paths;
    },

    /*
        cag = cag.overCutInsideCorners(cutterradius);

        Using a CNC router it's impossible to cut out a true sharp inside corner. The inside corner
        will be rounded due to the radius of the cutter. This function compensates for this by creating
        an extra cutout at each inner corner so that the actual cut out shape will be at least as large
        as needed.
        */
    overCutInsideCorners(cutterradius) {
        var cag = this.canonicalized();
        // for each vertex determine the 'incoming' side and 'outgoing' side:
        var pointmap = {}; // tag => {pos: coord, from: [], to: []}
        cag.sides.map((side) => {
            if (!(side.vertex0.getTag() in pointmap)) {
                pointmap[side.vertex0.getTag()] = {
                    pos: side.vertex0.pos,
                    from: [],
                    to: [],
                };
            }
            pointmap[side.vertex0.getTag()].to.push(side.vertex1.pos);
            if (!(side.vertex1.getTag() in pointmap)) {
                pointmap[side.vertex1.getTag()] = {
                    pos: side.vertex1.pos,
                    from: [],
                    to: [],
                };
            }
            pointmap[side.vertex1.getTag()].from.push(side.vertex0.pos);
        });
        // overcut all sharp corners:
        var cutouts = [];
        for (var pointtag in pointmap) {
            var pointobj = pointmap[pointtag];
            if ((pointobj.from.length === 1) && (pointobj.to.length === 1)) {
                // ok, 1 incoming side and 1 outgoing side:
                var fromcoord = pointobj.from[0];
                var pointcoord = pointobj.pos;
                var tocoord = pointobj.to[0];
                var v1 = pointcoord.minus(fromcoord).unit();
                var v2 = tocoord.minus(pointcoord).unit();
                var crossproduct = v1.cross(v2);
                var isInnerCorner = (crossproduct < 0.001);
                if (isInnerCorner) {
                    // yes it's a sharp corner:
                    var alpha = v2.angleRadians() - v1.angleRadians() + Math.PI;
                    if (alpha < 0) {
                        alpha += 2 * Math.PI;
                    } else if (alpha >= 2 * Math.PI) {
                        alpha -= 2 * Math.PI;
                    }
                    var midvector = v2.minus(v1).unit();
                    var circlesegmentangle = 30 / 180 * Math.PI; // resolution of the circle: segments of 30 degrees
                    // we need to increase the radius slightly so that our imperfect circle will contain a perfect circle of cutterradius
                    var radiuscorrected = cutterradius / Math.cos(circlesegmentangle / 2);
                    var circlecenter = pointcoord.plus(midvector.times(radiuscorrected));
                    // we don't need to create a full circle; a pie is enough. Find the angles for the pie:
                    var startangle = alpha + midvector.angleRadians();
                    var deltaangle = 2 * (Math.PI - alpha);
                    var numsteps = 2 * Math.ceil(deltaangle / circlesegmentangle / 2); // should be even
                    // build the pie:
                    var points = [circlecenter];
                    for (var i = 0; i <= numsteps; i++) {
                        var angle = startangle + i / numsteps * deltaangle;
                        var p = CSGVector2D.fromAngleRadians(angle).times(radiuscorrected).plus(circlecenter);
                        points.push(p);
                    }
                    cutouts.push(CAG.fromPoints(points));
                }
            }
        }
        var result = cag.subtract(cutouts);
        return result;
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

    center(cAxes) {
        var axes = ['x', 'y'];

        cAxes = Array.prototype.map.call(arguments, a => a.toLowerCase());
        // no args: center on all axes
        if (!cAxes.length) {
            cAxes = axes.slice();
        }
        var b = this.getBounds();

        return this.translate(axes.map(a => (cAxes.indexOf(a) > -1 ?
            -(b[0][a] + b[1][a]) / 2 : 0)));
    },

});

export {CAG};
