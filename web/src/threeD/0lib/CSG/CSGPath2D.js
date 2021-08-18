import {CSGVector2D} from './CSGVector2D.js';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';
import {CAGVertex} from './CAGVertex.js';
import {CAGSide} from './CAGSide.js';
import {CSG} from './CSG.js';
import {CAG} from './CAG.js';

var CSGPath2D = function (points, closed) {
    closed = !!closed;
    points = points || [];
    // re-parse the points into CSG.Vector2D
    // and remove any duplicate points
    var prevpoint = null;
    if (closed && (points.length > 0)) {
        prevpoint = new CSGVector2D(points[points.length - 1]);
    }
    var newpoints = [];
    points.map((point) => {
        point = new CSGVector2D(point);
        var skip = false;
        if (prevpoint !== null) {
            var distance = point.distanceTo(prevpoint);
            skip = distance < 1e-5;
        }
        if (!skip) {
            newpoints.push(point);
        }
        prevpoint = point;
    });
    this.points = newpoints;
    this.closed = closed;
};

CSGPath2D.arc = function (options) {
    var center = CSG.parseOptionAs2DVector(options, 'center', 0);
    var radius = CSG.parseOptionAsFloat(options, 'radius', 1);
    var startangle = CSG.parseOptionAsFloat(options, 'startangle', 0);
    var endangle = CSG.parseOptionAsFloat(options, 'endangle', 360);
    var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
    var maketangent = CSG.parseOptionAsBool(options, 'maketangent', false);
    // no need to make multiple turns:
    while (endangle - startangle >= 720) {
        endangle -= 360;
    }
    while (endangle - startangle <= -720) {
        endangle += 360;
    }
    var points = [];
    var point;
    var absangledif = Math.abs(endangle - startangle);
    if (absangledif < 1e-5) {
        point = CSGVector2D.fromAngle(startangle / 180.0 * Math.PI).times(radius);
        points.push(point.plus(center));
    } else {
        var numsteps = Math.floor(resolution * absangledif / 360) + 1;
        var edgestepsize = numsteps * 0.5 / absangledif; // step size for half a degree
        if (edgestepsize > 0.25) {
            edgestepsize = 0.25;
        }
        var numsteps_mod = maketangent ? (numsteps + 2) : numsteps;
        for (var i = 0; i <= numsteps_mod; i++) {
            var step = i;
            if (maketangent) {
                step = (i - 1) * (numsteps - 2 * edgestepsize) / numsteps + edgestepsize;
                if (step < 0) {
                    step = 0;
                }
                if (step > numsteps) {
                    step = numsteps;
                }
            }
            var angle = startangle + step * (endangle - startangle) / numsteps;
            point = CSGVector2D.fromAngle(angle / 180.0 * Math.PI).times(radius);
            points.push(point.plus(center));
        }
    }
    return new CSGPath2D(points, false);
};

Object.assign(CSGPath2D.prototype, {

    concat(otherpath) {
        if (this.closed || otherpath.closed) {
            throw new Error('Paths must not be closed');
        }
        var newpoints = this.points.concat(otherpath.points);
        return new CSGPath2D(newpoints);
    },

    appendPoint(point) {
        if (this.closed) {
            throw new Error('Path must not be closed');
        }
        point = new CSGVector2D(point); // cast to Vector2D
        var newpoints = this.points.concat([point]);
        return new CSGPath2D(newpoints);
    },

    appendPoints(points) {
        if (this.closed) {
            throw new Error('Path must not be closed');
        }
        var newpoints = this.points;
        points.forEach((point) => {
            newpoints.push(new CSGVector2D(point)); // cast to Vector2D
        });
        return new CSGPath2D(newpoints);
    },

    close() {
        return new CSGPath2D(this.points, true);
    },

    // Extrude the path by following it with a rectangle (upright, perpendicular to the path direction)
    // Returns a CSG solid
    //   width: width of the extrusion, in the z=0 plane
    //   height: height of the extrusion in the z direction
    //   resolution: number of segments per 360 degrees for the curve in a corner
    rectangularExtrude(width, height, resolution) {
        var cag = this.expandToCAG(width / 2, resolution);
        var result = cag.extrude({
            offset: [0, 0, height],
        });
        return result;
    },

    // Expand the path to a CAG
    // This traces the path with a circle with radius pathradius
    expandToCAG(pathradius, resolution) {
        var sides = [];
        var numpoints = this.points.length;
        var startindex = 0;
        if (this.closed && (numpoints > 2)) {
            startindex = -1;
        }
        var prevvertex;
        for (var i = startindex; i < numpoints; i++) {
            var pointindex = i;
            if (pointindex < 0) {
                pointindex = numpoints - 1;
            }
            var point = this.points[pointindex];
            var vertex = new CAGVertex(point);
            if (i > startindex) {
                var side = new CAGSide(prevvertex, vertex);
                sides.push(side);
            }
            prevvertex = vertex;
        }
        var shellcag = CAG.fromSides(sides);
        var expanded = shellcag.expandedShell(pathradius, resolution);
        return expanded;
    },

    innerToCAG() {
        if (!this.closed) {
            throw new Error('The path should be closed!');
        }
        return CAG.fromPoints(this.points);
    },

    transform(matrix4x4) {
        var newpoints = this.points.map(point => point.multiply4x4(matrix4x4));
        return new CSGPath2D(newpoints, this.closed);
    },

    appendBezier(controlpoints, options) {
        if (arguments.length < 2) {
            options = {};
        }
        if (this.closed) {
            throw new Error('Path must not be closed');
        }
        if (!(controlpoints instanceof Array)) {
            throw new Error('appendBezier: should pass an array of control points');
        }
        if (controlpoints.length < 1) {
            throw new Error('appendBezier: need at least 1 control point');
        }
        if (this.points.length < 1) {
            throw new Error('appendBezier: path must already contain a point (the endpoint of the path is used as the starting point for the bezier curve)');
        }
        var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
        if (resolution < 4) {
            resolution = 4;
        }
        var factorials = [];
        var controlpoints_parsed = [];
        controlpoints_parsed.push(this.points[this.points.length - 1]); // start at the previous end point
        for (var i = 0; i < controlpoints.length; ++i) {
            var p = controlpoints[i];
            if (p === null) {
                // we can pass null as the first control point. In that case a smooth gradient is ensured:
                if (i !== 0) {
                    throw new Error('appendBezier: null can only be passed as the first control point');
                }
                if (controlpoints.length < 2) {
                    throw new Error('appendBezier: null can only be passed if there is at least one more control point');
                }
                var lastBezierControlPoint;
                if ('lastBezierControlPoint' in this) {
                    lastBezierControlPoint = this.lastBezierControlPoint;
                } else {
                    if (this.points.length < 2) {
                        throw new Error('appendBezier: null is passed as a control point but this requires a previous bezier curve or at least two points in the existing path');
                    }
                    lastBezierControlPoint = this.points[this.points.length - 2];
                }
                // mirror the last bezier control point:
                p = this.points[this.points.length - 1].times(2).minus(lastBezierControlPoint);
            } else {
                p = new CSGVector2D(p); // cast to Vector2D
            }
            controlpoints_parsed.push(p);
        }
        var bezier_order = controlpoints_parsed.length - 1;
        var fact = 1;
        for (var i = 0; i <= bezier_order; ++i) {
            if (i > 0) {
                fact *= i;
            }
            factorials.push(fact);
        }
        var binomials = [];
        for (var i = 0; i <= bezier_order; ++i) {
            var binomial = factorials[bezier_order] / (factorials[i] * factorials[bezier_order - i]);
            binomials.push(binomial);
        }
        var getPointForT = function (t) {
            var t_k = 1; // = pow(t,k)
            var one_minus_t_n_minus_k = Math.pow(1 - t, bezier_order); // = pow( 1-t, bezier_order - k)
            var inv_1_minus_t = (t !== 1) ? (1 / (1 - t)) : 1;
            var point = new CSGVector2D(0, 0);
            for (var k = 0; k <= bezier_order; ++k) {
                if (k === bezier_order) {
                    one_minus_t_n_minus_k = 1;
                }
                var bernstein_coefficient = binomials[k] * t_k * one_minus_t_n_minus_k;
                point = point.plus(controlpoints_parsed[k].times(bernstein_coefficient));
                t_k *= t;
                one_minus_t_n_minus_k *= inv_1_minus_t;
            }
            return point;
        };
        var newpoints = [];
        var newpoints_t = [];
        var numsteps = bezier_order + 1;
        for (var i = 0; i < numsteps; ++i) {
            var t = i / (numsteps - 1);
            var point = getPointForT(t);
            newpoints.push(point);
            newpoints_t.push(t);
        }
        // subdivide each segment until the angle at each vertex becomes small enough:
        var subdivide_base = 1;
        var maxangle = Math.PI * 2 / resolution; // segments may have differ no more in angle than this
        var maxsinangle = Math.sin(maxangle);
        while (subdivide_base < newpoints.length - 1) {
            var dir1 = newpoints[subdivide_base].minus(newpoints[subdivide_base - 1]).unit();
            var dir2 = newpoints[subdivide_base + 1].minus(newpoints[subdivide_base]).unit();
            var sinangle = dir1.cross(dir2); // this is the sine of the angle
            if (Math.abs(sinangle) > maxsinangle) {
                // angle is too big, we need to subdivide
                var t0 = newpoints_t[subdivide_base - 1];
                var t1 = newpoints_t[subdivide_base + 1];
                var t0_new = t0 + (t1 - t0) * 1 / 3;
                var t1_new = t0 + (t1 - t0) * 2 / 3;
                var point0_new = getPointForT(t0_new);
                var point1_new = getPointForT(t1_new);
                // remove the point at subdivide_base and replace with 2 new points:
                newpoints.splice(subdivide_base, 1, point0_new, point1_new);
                newpoints_t.splice(subdivide_base, 1, t0_new, t1_new);
                // re - evaluate the angles, starting at the previous junction since it has changed:
                subdivide_base--;
                if (subdivide_base < 1) {
                    subdivide_base = 1;
                }
            } else {
                ++subdivide_base;
            }
        }
        // append to the previous points, but skip the first new point because it is identical to the last point:
        newpoints = this.points.concat(newpoints.slice(1));
        var result = new CSGPath2D(newpoints);
        result.lastBezierControlPoint = controlpoints_parsed[controlpoints_parsed.length - 2];
        return result;
    },

    /*
         options:
         .resolution // smoothness of the arc (number of segments per 360 degree of rotation)
         // to create a circular arc:
         .radius
         // to create an elliptical arc:
         .xradius
         .yradius
         .xaxisrotation  // the rotation (in degrees) of the x axis of the ellipse with respect to the x axis of our coordinate system
         // this still leaves 4 possible arcs between the two given points. The following two flags select which one we draw:
         .clockwise // = true | false (default is false). Two of the 4 solutions draw clockwise with respect to the center point, the other 2 counterclockwise
         .large     // = true | false (default is false). Two of the 4 solutions are an arc longer than 180 degrees, the other two are <= 180 degrees
         This implementation follows the SVG arc specs. For the details see
         http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
         */
    appendArc(endpoint, options) {
        var decimals = 100000;
        if (arguments.length < 2) {
            options = {};
        }
        if (this.closed) {
            throw new Error('Path must not be closed');
        }
        if (this.points.length < 1) {
            throw new Error('appendArc: path must already contain a point (the endpoint of the path is used as the starting point for the arc)');
        }
        var resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
        if (resolution < 4) {
            resolution = 4;
        }
        var xradius;
        var
            yradius;
        if (('xradius' in options) || ('yradius' in options)) {
            if ('radius' in options) {
                throw new Error('Should either give an xradius and yradius parameter, or a radius parameter');
            }
            xradius = CSG.parseOptionAsFloat(options, 'xradius', 0);
            yradius = CSG.parseOptionAsFloat(options, 'yradius', 0);
        } else {
            xradius = CSG.parseOptionAsFloat(options, 'radius', 0);
            yradius = xradius;
        }
        var xaxisrotation = CSG.parseOptionAsFloat(options, 'xaxisrotation', 0);
        var clockwise = CSG.parseOptionAsBool(options, 'clockwise', false);
        var largearc = CSG.parseOptionAsBool(options, 'large', false);
        var startpoint = this.points[this.points.length - 1];
        endpoint = new CSGVector2D(endpoint);
        // round to precision in order to have determinate calculations
        xradius = Math.round(xradius * decimals) / decimals;
        yradius = Math.round(yradius * decimals) / decimals;
        endpoint = new CSGVector2D(Math.round(endpoint.x * decimals) / decimals, Math.round(endpoint.y * decimals) / decimals);
        var sweep_flag = !clockwise;
        var newpoints = [];
        if ((xradius === 0) || (yradius === 0)) {
            // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes:
            // If rx = 0 or ry = 0, then treat this as a straight line from (x1, y1) to (x2, y2) and stop
            newpoints.push(endpoint);
        } else {
            xradius = Math.abs(xradius);
            yradius = Math.abs(yradius);
            // see http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes :
            var phi = xaxisrotation * Math.PI / 180.0;
            var cosphi = Math.cos(phi);
            var sinphi = Math.sin(phi);
            var minushalfdistance = startpoint.minus(endpoint).times(0.5);
            // F.6.5.1:
            // round to precision in order to have determinate calculations
            var x = Math.round((cosphi * minushalfdistance.x + sinphi * minushalfdistance.y) * decimals) / decimals;
            var y = Math.round((-sinphi * minushalfdistance.x + cosphi * minushalfdistance.y) * decimals) / decimals;
            var start_translated = new CSGVector2D(x, y);
            // F.6.6.2:
            var biglambda = start_translated.x * start_translated.x / (xradius * xradius) + start_translated.y * start_translated.y / (yradius * yradius);
            if (biglambda > 1) {
                // F.6.6.3:
                var sqrtbiglambda = Math.sqrt(biglambda);
                xradius *= sqrtbiglambda;
                yradius *= sqrtbiglambda;
                // round to precision in order to have determinate calculations
                xradius = Math.round(xradius * decimals) / decimals;
                yradius = Math.round(yradius * decimals) / decimals;
            }
            // F.6.5.2:
            var multiplier1 = Math.sqrt((xradius * xradius * yradius * yradius - xradius * xradius * start_translated.y * start_translated.y - yradius * yradius * start_translated.x * start_translated.x) / (xradius * xradius * start_translated.y * start_translated.y + yradius * yradius * start_translated.x * start_translated.x));
            if (sweep_flag === largearc) {
                multiplier1 = -multiplier1;
            }
            var center_translated = new CSGVector2D(xradius * start_translated.y / yradius, -yradius * start_translated.x / xradius).times(multiplier1);
            // F.6.5.3:
            var center = new CSGVector2D(cosphi * center_translated.x - sinphi * center_translated.y, sinphi * center_translated.x + cosphi * center_translated.y).plus((startpoint.plus(endpoint)).times(0.5));
            // F.6.5.5:
            var vec1 = new CSGVector2D((start_translated.x - center_translated.x) / xradius, (start_translated.y - center_translated.y) / yradius);
            var vec2 = new CSGVector2D((-start_translated.x - center_translated.x) / xradius, (-start_translated.y - center_translated.y) / yradius);
            var theta1 = vec1.angleRadians();
            var theta2 = vec2.angleRadians();
            var deltatheta = theta2 - theta1;
            deltatheta = deltatheta % (2 * Math.PI);
            if ((!sweep_flag) && (deltatheta > 0)) {
                deltatheta -= 2 * Math.PI;
            } else if ((sweep_flag) && (deltatheta < 0)) {
                deltatheta += 2 * Math.PI;
            }
            // Ok, we have the center point and angle range (from theta1, deltatheta radians) so we can create the ellipse
            var numsteps = Math.ceil(Math.abs(deltatheta) / (2 * Math.PI) * resolution) + 1;
            if (numsteps < 1) {
                numsteps = 1;
            }
            for (var step = 1; step <= numsteps; step++) {
                var theta = theta1 + step / numsteps * deltatheta;
                var costheta = Math.cos(theta);
                var sintheta = Math.sin(theta);
                // F.6.3.1:
                var point = new CSGVector2D(cosphi * xradius * costheta - sinphi * yradius * sintheta, sinphi * xradius * costheta + cosphi * yradius * sintheta).plus(center);
                newpoints.push(point);
            }
        }
        newpoints = this.points.concat(newpoints);
        var result = new CSGPath2D(newpoints);
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
});


export {CSGPath2D};
