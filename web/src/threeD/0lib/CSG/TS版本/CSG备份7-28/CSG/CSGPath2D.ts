import {CSGVector2D} from './CSGVector2D';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CSGVector3D} from './CSGVector3D';
import {CAGVertex} from './CAGVertex';
import {CAGSide} from './CAGSide';
import {CSG} from './CSG';
import {CAG} from './CAG';

/**
 * CSG2D路径类
 */
export class CSGPath2D {
    /**
     * 点
     */
    public points: any;

    /**
     * 封闭状态
     */
    public closed: boolean;

    /**
     * 默认分辨率
     */
    static defaultResolution2D: number;

    /**
     * 上次贝塞尔控制点
     */
    public lastBezierControlPoint: [];

    /**
     * 构造函数
     * @param points
     * @param closed
     */
    constructor(points?: number[], closed?: boolean) {
        closed = !!closed;
        points = points || [];
        // re-parse the points into CSG.Vector2D
        // and remove any duplicate points
        let prevpoint: any = null;
        if (closed && (points.length > 0)) {
            prevpoint = new CSGVector2D(points[points.length - 1]);
        }
        let newpoints: any = [];
        points.map((point) => {
            const _point = new CSGVector2D(point);
            let skip = false;
            if (prevpoint != null) {
                let distance = _point.distanceTo(prevpoint);
                skip = distance < 1e-5;
            }
            if (!skip) {
                newpoints.push(_point);
            }
            prevpoint = _point;
        });
        this.points = newpoints;
        this.closed = closed;
    }

    /**
     * 根据角度生成
     * @param options
     */
    static arc(options: any): CSGPath2D {
        let center = CSG.parseOptionAs2DVector(options, 'center', 0);
        let radius = CSG.parseOptionAsFloat(options, 'radius', 1);
        let startangle = CSG.parseOptionAsFloat(options, 'startangle', 0);
        let endangle = CSG.parseOptionAsFloat(options, 'endangle', 360);
        let resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
        let maketangent = CSG.parseOptionAsBool(options, 'maketangent', false);
        // no need to make multiple turns:
        while (endangle - startangle >= 720) {
            endangle -= 360;
        }
        while (endangle - startangle <= -720) {
            endangle += 360;
        }
        let points: any = [];
        let point;
        let absangledif = Math.abs(endangle - startangle);
        if (absangledif < 1e-5) {
            point = CSGVector2D.fromAngle(startangle / 180.0 * Math.PI).times(radius);
            points.push(point.plus(center));
        } else {
            let numsteps = Math.floor(resolution * absangledif / 360) + 1;
            let edgestepsize = numsteps * 0.5 / absangledif; // step size for half a degree
            if (edgestepsize > 0.25) {
                edgestepsize = 0.25;
            }
            let numsteps_mod = maketangent ? (numsteps + 2) : numsteps;
            for (let i = 0; i <= numsteps_mod; i++) {
                let step = i;
                if (maketangent) {
                    step = (i - 1) * (numsteps - 2 * edgestepsize) / numsteps + edgestepsize;
                    if (step < 0) {
                        step = 0;
                    }
                    if (step > numsteps) {
                        step = numsteps;
                    }
                }
                let angle = startangle + step * (endangle - startangle) / numsteps;
                point = CSGVector2D.fromAngle(angle / 180.0 * Math.PI).times(radius);
                points.push(point.plus(center));
            }
        }
        return new CSGPath2D(points, false);
    }

    /**
     * 扩充
     * @param otherpath
     */
    public concat(otherpath: CSGPath2D) {
        if (this.closed || otherpath.closed) {
            throw new Error('Paths must not be closed');
        }
        let newpoints = this.points.concat(otherpath.points);
        return new CSGPath2D(newpoints);
    }

    /**
     * 添加点
     * @param point
     */
    public appendPoint(point: any) {
        if (this.closed) {
            throw new Error('Path must not be closed');
        }
        point = new CSGVector2D(point); // cast to Vector2D
        let newpoints = this.points.concat([point]);
        return new CSGPath2D(newpoints);
    }

    /**
     * 添加点
     * @param points
     */
    public appendPoints(points: any) {
        if (this.closed) {
            throw new Error('Path must not be closed');
        }
        let newpoints = this.points;
        points.forEach((point: any) => {
            newpoints.push(new CSGVector2D(point)); // cast to Vector2D
        });
        return new CSGPath2D(newpoints);
    }

    /**
     * 封闭
     */
    public close(): CSGPath2D {
        return new CSGPath2D(this.points, true);
    }

    // Extrude the path by following it with a rectangle (upright, perpendicular to the path direction)
    // Returns a CSG solid
    //   width: width of the extrusion, in the z=0 plane
    //   height: height of the extrusion in the z direction
    //   resolution: number of segments per 360 degrees for the curve in a corner
    /**
     * 矩形拉伸
     * @param width
     * @param height
     * @param resolution
     */
    public rectangularExtrude(width: any, height: any, resolution: any) {
        let cag = this.expandToCAG(width / 2, resolution);
        let result = cag.extrude({
            offset: [0, 0, height],
        });
        return result;
    }

    // Expand the path to a CAG
    // This traces the path with a circle with radius pathradius
    /**
     * 将路径扩展到CAG
     * @param pathradius
     * @param resolution
     */
    public expandToCAG(pathradius: any, resolution: any) {
        let sides = [];
        let numpoints = this.points.length;
        let startindex = 0;
        if (this.closed && (numpoints > 2)) {
            startindex = -1;
        }
        let prevvertex: any;
        for (let i = startindex; i < numpoints; i++) {
            let pointindex = i;
            if (pointindex < 0) {
                pointindex = numpoints - 1;
            }
            let point = this.points[pointindex];
            let vertex = new CAGVertex(point);
            if (i > startindex) {
                let side = new CAGSide(prevvertex, vertex);
                sides.push(side);
            }
            prevvertex = vertex;
        }
        let shellcag = CAG.fromSides(sides);
        let expanded = shellcag.expandedShell(pathradius, resolution);
        return expanded;
    }

    /**
     * 内部CAG
     */
    public innerToCAG(): any {
        if (!this.closed) {
            throw new Error('The path should be closed!');
        }
        return CAG.fromPoints(this.points);
    }

    /**
     * 转换
     * @param matrix4x4
     */
    public transform(matrix4x4: CSGMatrix4x4) {
        let newpoints = this.points.map((point: any) => point.multiply4x4(matrix4x4));
        return new CSGPath2D(newpoints, this.closed);
    }

    /**
     * 添加贝塞尔曲线
     * @param controlpoints
     * @param options
     */
    public appendBezier(controlpoints: any, options: any): CSGPath2D {
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
        let resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
        if (resolution < 4) {
            resolution = 4;
        }
        let factorials = [];
        let controlpoints_parsed: any = [];
        controlpoints_parsed.push(this.points[this.points.length - 1]); // start at the previous end point
        for (let i = 0; i < controlpoints.length; ++i) {
            let p = controlpoints[i];
            if (p == null) {
                // we can pass null as the first control point. In that case a smooth gradient is ensured:
                if (i != 0) {
                    throw new Error('appendBezier: null can only be passed as the first control point');
                }
                if (controlpoints.length < 2) {
                    throw new Error('appendBezier: null can only be passed if there is at least one more control point');
                }
                let lastBezierControlPoint;
                if ('lastBezierControlPoint' in this) {
                    lastBezierControlPoint = this.lastBezierControlPoint;
                } else {
                    // if (this.points.length < 2) {
                    //     throw new Error('appendBezier: null is passed as a control point but this requires a previous bezier curve or at least two points in the existing path');
                    // }
                    // lastBezierControlPoint = this.points[this.points.length - 2];
                }
                // mirror the last bezier control point:
                p = this.points[this.points.length - 1].times(2).minus(lastBezierControlPoint);
            } else {
                p = new CSGVector2D(p); // cast to Vector2D
            }
            controlpoints_parsed.push(p);
        }
        let bezier_order = controlpoints_parsed.length - 1;
        let fact = 1;
        for (let i = 0; i <= bezier_order; ++i) {
            if (i > 0) {
                fact *= i;
            }
            factorials.push(fact);
        }
        let binomials: any = [];
        for (let i = 0; i <= bezier_order; ++i) {
            let binomial = factorials[bezier_order] / (factorials[i] * factorials[bezier_order - i]);
            binomials.push(binomial);
        }
        let getPointForT = function (t: any) {
            let t_k = 1; // = pow(t,k)
            let one_minus_t_n_minus_k = Math.pow(1 - t, bezier_order); // = pow( 1-t, bezier_order - k)
            let inv_1_minus_t = (t != 1) ? (1 / (1 - t)) : 1;
            let point = new CSGVector2D(0, 0);
            for (let k = 0; k <= bezier_order; ++k) {
                if (k == bezier_order) {
                    one_minus_t_n_minus_k = 1;
                }
                let bernstein_coefficient = binomials[k] * t_k * one_minus_t_n_minus_k;
                point = point.plus(controlpoints_parsed[k].times(bernstein_coefficient));
                t_k *= t;
                one_minus_t_n_minus_k *= inv_1_minus_t;
            }
            return point;
        };
        let newpoints = [];
        let newpoints_t = [];
        let numsteps = bezier_order + 1;
        for (let i = 0; i < numsteps; ++i) {
            let t = i / (numsteps - 1);
            let point = getPointForT(t);
            newpoints.push(point);
            newpoints_t.push(t);
        }
        // subdivide each segment until the angle at each vertex becomes small enough:
        let subdivide_base = 1;
        let maxangle = Math.PI * 2 / resolution; // segments may have differ no more in angle than this
        let maxsinangle = Math.sin(maxangle);
        while (subdivide_base < newpoints.length - 1) {
            let dir1 = newpoints[subdivide_base].minus(newpoints[subdivide_base - 1]).unit();
            let dir2 = newpoints[subdivide_base + 1].minus(newpoints[subdivide_base]).unit();
            let sinangle = dir1.cross(dir2); // this is the sine of the angle
            if (Math.abs(sinangle) > maxsinangle) {
                // angle is too big, we need to subdivide
                let t0 = newpoints_t[subdivide_base - 1];
                let t1 = newpoints_t[subdivide_base + 1];
                let t0_new = t0 + (t1 - t0) * 1 / 3;
                let t1_new = t0 + (t1 - t0) * 2 / 3;
                let point0_new = getPointForT(t0_new);
                let point1_new = getPointForT(t1_new);
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
        let result = new CSGPath2D(newpoints);
        result.lastBezierControlPoint = controlpoints_parsed[controlpoints_parsed.length - 2];
        return result;
    }

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
    /**
     * 添加角
     * @param endpoint
     * @param options
     */
    public appendArc(endpoint: any, options: any): CSGPath2D {
        let decimals = 100000;
        if (arguments.length < 2) {
            options = {};
        }
        if (this.closed) {
            throw new Error('Path must not be closed');
        }
        if (this.points.length < 1) {
            throw new Error('appendArc: path must already contain a point (the endpoint of the path is used as the starting point for the arc)');
        }
        let resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution2D);
        if (resolution < 4) {
            resolution = 4;
        }
        let xradius;
        let
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
        let xaxisrotation = CSG.parseOptionAsFloat(options, 'xaxisrotation', 0);
        let clockwise = CSG.parseOptionAsBool(options, 'clockwise', false);
        let largearc = CSG.parseOptionAsBool(options, 'large', false);
        let startpoint = this.points[this.points.length - 1];
        endpoint = new CSGVector2D(endpoint);
        // round to precision in order to have determinate calculations
        xradius = Math.round(xradius * decimals) / decimals;
        yradius = Math.round(yradius * decimals) / decimals;
        endpoint = new CSGVector2D(Math.round(endpoint.x * decimals) / decimals, Math.round(endpoint.y * decimals) / decimals);
        let sweep_flag = !clockwise;
        let newpoints = [];
        if ((xradius == 0) || (yradius == 0)) {
            // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes:
            // If rx = 0 or ry = 0, then treat this as a straight line from (x1, y1) to (x2, y2) and stop
            newpoints.push(endpoint);
        } else {
            xradius = Math.abs(xradius);
            yradius = Math.abs(yradius);
            // see http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes :
            let phi = xaxisrotation * Math.PI / 180.0;
            let cosphi = Math.cos(phi);
            let sinphi = Math.sin(phi);
            let minushalfdistance = startpoint.minus(endpoint).times(0.5);
            // F.6.5.1:
            // round to precision in order to have determinate calculations
            let x = Math.round((cosphi * minushalfdistance.x + sinphi * minushalfdistance.y) * decimals) / decimals;
            let y = Math.round((-sinphi * minushalfdistance.x + cosphi * minushalfdistance.y) * decimals) / decimals;
            let start_translated: any = new CSGVector2D(x, y);
            // F.6.6.2:
            let biglambda = start_translated.x * start_translated.x / (xradius * xradius) + start_translated.y * start_translated.y / (yradius * yradius);
            if (biglambda > 1) {
                // F.6.6.3:
                let sqrtbiglambda = Math.sqrt(biglambda);
                xradius *= sqrtbiglambda;
                yradius *= sqrtbiglambda;
                // round to precision in order to have determinate calculations
                xradius = Math.round(xradius * decimals) / decimals;
                yradius = Math.round(yradius * decimals) / decimals;
            }
            // F.6.5.2:
            let multiplier1 = Math.sqrt((xradius * xradius * yradius * yradius - xradius * xradius * start_translated.y * start_translated.y - yradius * yradius * start_translated.x * start_translated.x) / (xradius * xradius * start_translated.y * start_translated.y + yradius * yradius * start_translated.x * start_translated.x));
            if (sweep_flag == largearc) {
                multiplier1 = -multiplier1;
            }
            let center_translated: any = new CSGVector2D(xradius * start_translated.y / yradius, -yradius * start_translated.x / xradius).times(multiplier1);
            // F.6.5.3:
            let center = new CSGVector2D(cosphi * center_translated.x - sinphi * center_translated.y, sinphi * center_translated.x + cosphi * center_translated.y).plus((startpoint.plus(endpoint)).times(0.5));
            // F.6.5.5:
            let vec1 = new CSGVector2D((start_translated.x - center_translated.x) / xradius, (start_translated.y - center_translated.y) / yradius);
            let vec2 = new CSGVector2D((-start_translated.x - center_translated.x) / xradius, (-start_translated.y - center_translated.y) / yradius);
            let theta1 = vec1.angleRadians();
            let theta2 = vec2.angleRadians();
            let deltatheta = theta2 - theta1;
            deltatheta = deltatheta % (2 * Math.PI);
            if ((!sweep_flag) && (deltatheta > 0)) {
                deltatheta -= 2 * Math.PI;
            } else if ((sweep_flag) && (deltatheta < 0)) {
                deltatheta += 2 * Math.PI;
            }
            // Ok, we have the center point and angle range (from theta1, deltatheta radians) so we can create the ellipse
            let numsteps = Math.ceil(Math.abs(deltatheta) / (2 * Math.PI) * resolution) + 1;
            if (numsteps < 1) {
                numsteps = 1;
            }
            for (let step = 1; step <= numsteps; step++) {
                let theta = theta1 + step / numsteps * deltatheta;
                let costheta = Math.cos(theta);
                let sintheta = Math.sin(theta);
                // F.6.3.1:
                let point = new CSGVector2D(cosphi * xradius * costheta - sinphi * yradius * sintheta, sinphi * xradius * costheta + cosphi * yradius * sintheta).plus(center);
                newpoints.push(point);
            }
        }
        newpoints = this.points.concat(newpoints);
        let result = new CSGPath2D(newpoints);
        return result;
    }

    /**
     * 镜像平面
     * @param plane
     */
    public mirrored(plane: CSGPlane): CSGPath2D {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX(): CSGPath2D {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY(): CSGPath2D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ(): CSGPath2D {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: any): CSGPath2D {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: any): CSGPath2D {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: any): CSGPath2D {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: any): CSGPath2D {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: any): CSGPath2D {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: any, rotationAxis: any, degrees: any): CSGPath2D {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: any, beta: any, gamma: any, position: any): CSGPath2D {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }
}
