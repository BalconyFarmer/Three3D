import {CSGVector2D} from './CSGVector2D';
import {CAGVertex} from './CAGVertex';
import {CAGSide} from './CAGSide';
import {CSG} from './CSG';
import {CSGConnector} from './CSGConnector';
import {CSGVector3D} from './CSGVector3D';
import {CSGPolygon} from './CSGPolygon';
import {CSGOrthoNormalBasis} from './CSGOrthoNormalBasis';
import {CSGVertex} from './CSGVertex';
import {CSGMatrix4x4} from './CSGMatrix4x4';
import {CSGPlane} from './CSGPlane';
import {CAGFuzzyFactory} from './CAGFuzzyFactory';
import {CSGPath2D} from './CSGPath2D';

/**
 * CAG类
 */
export class CAG {
    public sides: any[];
    static defaultResolution2D: any;
    public isCanonicalized: boolean;

    /**
     * 构造函数
     */
    constructor() {

    }

    /**
     * 从边创建
     * @param sides
     */
    static fromSides(sides: any): CAG {
        let cag = new CAG();
        cag.sides = sides;
        return cag;
    }

    // Construct a CAG from a list of points (a polygon)
    // Rotation direction of the points is not relevant. Points can be a convex or concave polygon.
    // Polygon must not self intersect
    /**
     * 从点列表创建
     * @param points
     */
    static fromPoints(points: any[]): CAG {
        let numpoints = points.length;
        if (numpoints < 3) {
            throw new Error('CAG shape needs at least 3 points');
        }
        let sides: any = [];
        let prevpoint = new CSGVector2D(points[numpoints - 1]);
        let prevvertex = new CAGVertex(prevpoint);
        points.map((p: any) => {
            let point = new CSGVector2D(p);
            let vertex = new CAGVertex(point);
            let side = new CAGSide(prevvertex, vertex);
            sides.push(side);
            prevvertex = vertex;
        });
        let result = CAG.fromSides(sides);
        if (result.isSelfIntersecting()) {
            throw new Error('Polygon is self intersecting!');
        }
        let area = result.area();
        if (Math.abs(area) < 1e-5) {
            throw new Error('Degenerate polygon!');
        }
        if (area < 0) {
            result = result.flipped();
        }
        result = result.canonicalized();
        return result;
    }

    // Like CAG.fromPoints but does not check if it's a valid polygon.
    // Points should rotate counter clockwise
    /**
     * 从点创建
     * @param points
     */
    static fromPointsNoCheck(points: any[]): CAG {
        let sides: any = [];
        let prevpoint = new CSGVector2D(points[points.length - 1]);
        let prevvertex = new CAGVertex(prevpoint);
        points.map((p: any) => {
            let point = new CSGVector2D(p);
            let vertex = new CAGVertex(point);
            let side = new CAGSide(prevvertex, vertex);
            sides.push(side);
            prevvertex = vertex;
        });
        return CAG.fromSides(sides);
    }

    // Converts a CSG to a CAG. The CSG must consist of polygons with only z coordinates +1 and -1
    // as constructed by CAG._toCSGWall(-1, 1). This is so we can use the 3D union(), intersect() etc
    /**
     * 从虚拟CSG创建
     * @param csg
     */
    static fromFakeCSG(csg: CSG): CAG {
        let sides = csg.polygons.map((p: any) => CAGSide._fromFakePolygon(p))
            .filter((s: any) => s != null);
        return CAG.fromSides(sides);
    }

    // see if the line between p0start and p0end intersects with the line between p1start and p1end
    // returns true if the lines strictly intersect, the end points are not counted!
    /**
     * 线切断
     * @param p0start
     * @param p0end
     * @param p1start
     * @param p1end
     */
    static linesIntersect(p0start: CSGVector3D, p0end: CSGVector3D, p1start: CSGVector3D, p1end: CSGVector3D): boolean {
        if (p0end.equals(p1start) || p1end.equals(p0start)) {
            let d = p1end.minus(p1start).unit().plus(p0end.minus(p0start).unit()).length();
            if (d < 1e-5) {
                return true;
            }
        } else {
            let d0: any = p0end.minus(p0start);
            let d1: any = p1end.minus(p1start);
            if (Math.abs(d0.cross(d1)) < 1e-9) {
                return false;
            } // lines are parallel
            let alphas = CSG.solve2Linear(-d0.x, d1.x, -d0.y, d1.y, p0start.x - p1start.x, p0start.y - p1start.y);
            if ((alphas[0] > 1e-6) && (alphas[0] < 0.999999) && (alphas[1] > 1e-5) && (alphas[1] < 0.999999)) {
                return true;
            }
            //    if( (alphas[0] >= 0) && (alphas[0] <= 1) && (alphas[1] >= 0) && (alphas[1] <= 1) ) return true;
        }
        return false;
    }

    /* Construct a circle
        options:
          center: a 2D center point
          radius: a scalar
          resolution: number of sides per 360 degree rotation
        returns a CAG object
        */
    /**
     * 圆形
     * @param options
     */
    static circle(options: any): CAG {
        options = options || {};
        let center = CSG.parseOptionAs2DVector(options, 'center', [0, 0]);
        let radius = CSG.parseOptionAsFloat(options, 'radius', 1);
        let resolution = CSG.parseOptionAsInt(options, 'resolution', this.defaultResolution2D);
        let sides = [];
        let prevvertex: any;
        for (let i = 0; i <= resolution; i++) {
            let radians = 2 * Math.PI * i / resolution;
            let point = CSGVector2D.fromAngleRadians(radians).times(radius).plus(center);
            let vertex = new CAGVertex(point);
            if (i > 0) {
                sides.push(new CAGSide(prevvertex, vertex));
            }
            prevvertex = vertex;
        }
        return CAG.fromSides(sides);
    }

    /* Construct a rectangle
        options:
          center: a 2D center point
          radius: a 2D vector with width and height
          returns a CAG object
        */
    /**
     * 圆角矩阵
     * @param options
     */
    static rectangle(options: any): CAG {
        options = options || {};
        let c;
        let r;
        if (('corner1' in options) || ('corner2' in options)) {
            if (('center' in options) || ('radius' in options)) {
                throw new Error('rectangle: should either give a radius and center parameter, or a corner1 and corner2 parameter');
            }
            let corner1 = CSG.parseOptionAs2DVector(options, 'corner1', [0, 0]);
            let corner2 = CSG.parseOptionAs2DVector(options, 'corner2', [1, 1]);
            c = corner1.plus(corner2).times(0.5);
            r = corner2.minus(corner1).times(0.5);
        } else {
            c = CSG.parseOptionAs2DVector(options, 'center', [0, 0]);
            r = CSG.parseOptionAs2DVector(options, 'radius', [1, 1]);
        }
        r = r.abs(); // negative radii make no sense
        let rswap = new CSGVector2D(r.x, -r.y);
        let points = [
            c.plus(r), c.plus(rswap), c.minus(r), c.minus(rswap),
        ];
        return CAG.fromPoints(points);
    }

    //     let r = CSG.roundedRectangle({
    //       center: [0, 0],
    //       radius: [2, 1],
    //       roundradius: 0.2,
    //       resolution: 8,
    //     });
    /**
     * 圆角矩形
     * @param options
     */
    static roundedRectangle(options: any): CAG {
        options = options || {};
        let center;
        let
            radius;
        if (('corner1' in options) || ('corner2' in options)) {
            if (('center' in options) || ('radius' in options)) {
                throw new Error('roundedRectangle: should either give a radius and center parameter, or a corner1 and corner2 parameter');
            }
            let corner1 = CSG.parseOptionAs2DVector(options, 'corner1', [0, 0]);
            let corner2 = CSG.parseOptionAs2DVector(options, 'corner2', [1, 1]);
            center = corner1.plus(corner2).times(0.5);
            radius = corner2.minus(corner1).times(0.5);
        } else {
            center = CSG.parseOptionAs2DVector(options, 'center', [0, 0]);
            radius = CSG.parseOptionAs2DVector(options, 'radius', [1, 1]);
        }
        radius = radius.abs(); // negative radii make no sense
        let roundradius = CSG.parseOptionAsFloat(options, 'roundradius', 0.2);
        let resolution = CSG.parseOptionAsInt(options, 'resolution', this.defaultResolution2D);
        let maxroundradius = Math.min(radius.x, radius.y);
        maxroundradius -= 0.1;
        roundradius = Math.min(roundradius, maxroundradius);
        roundradius = Math.max(0, roundradius);
        radius = new CSGVector2D(radius.x - roundradius, radius.y - roundradius);
        let rect = CAG.rectangle({
            center,
            radius,
        });
        if (roundradius > 0) {
            rect = rect.expand(roundradius, resolution);
        }
        return rect;
    }

    // Reconstruct a CAG from the output of toCompactBinary()
    /**
     * 从压缩文件创建
     * @param bin
     */
    static fromCompactBinary(bin: any) {
        if (bin.class != 'CAG') {
            throw new Error('Not a CAG');
        }
        let vertices = [];
        let vertexData = bin.vertexData;
        let numvertices = vertexData.length / 2;
        let arrayindex = 0;
        for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
            let x = vertexData[arrayindex++];
            let y = vertexData[arrayindex++];
            let pos = new CSGVector2D(x, y);
            let vertex = new CAGVertex(pos);
            vertices.push(vertex);
        }
        let sides = [];
        let numsides = bin.sideVertexIndices.length / 2;
        arrayindex = 0;
        for (let sideindex = 0; sideindex < numsides; sideindex++) {
            let vertexindex0 = bin.sideVertexIndices[arrayindex++];
            let vertexindex1 = bin.sideVertexIndices[arrayindex++];
            let side = new CAGSide(vertices[vertexindex0], vertices[vertexindex1]);
            sides.push(side);
        }
        let cag = this.fromSides(sides);
        cag.isCanonicalized = true;
        return cag;
    }

    /**
     * 转化为字符串
     */
    public toString() {
        let result = `CAG (${this.sides.length} sides):\n`;
        this.sides.map((side: any) => {
            result += `  ${side.toString()}\n`;
        });
        return result;
    }

    /**
     * 创建CSG
     * @param z0
     * @param z1
     * @private
     */
    private _toCSGWall(z0: any, z1: any) {
        let polygons = this.sides.map((side: any) => side.toPolygon3D(z0, z1));
        return CSG.fromPolygons(polygons);
    }

    /**
     * 转化成一对三维向量
     * @param m
     * @private
     */
    private _toVector3DPairs(m: any) {
        // transform m
        let pairs = this.sides.map((side: any) => {
            let p0 = side.vertex0.pos;
            let p1 = side.vertex1.pos;
            return [
                CSGVector3D.Create(p0.x, p0.y, 0),
                CSGVector3D.Create(p1.x, p1.y, 0),
            ];
        });
        if (typeof m != 'undefined') {
            pairs = pairs.map((pair) => pair.map((v) => v.transform(m)));
        }
        return pairs;
    }

    /*
         * transform a cag into the polygons of a corresponding 3d plane, positioned per options
         * Accepts a connector for plane positioning, or optionally
         * single translation, axisVector, normalVector arguments
         * (toConnector has precedence over single arguments if provided)
         */
    /**
     * 将cag转换为相应3d平面的多边形（按选项定位）
     * @param options
     * @private
     */
    private _toPlanePolygons(options: any) {
        let flipped = options.flipped || false;
        // reference connector for transformation
        let origin = [0, 0, 0];
        let defaultAxis = [0, 0, 1];
        let defaultNormal = [0, 1, 0];
        let thisConnector = new CSGConnector(origin, defaultAxis, defaultNormal);
        // translated connector per options
        let translation = options.translation || origin;
        let axisVector = options.axisVector || defaultAxis;
        let normalVector = options.normalVector || defaultNormal;
        // will override above if options has toConnector
        let toConnector = options.toConnector ||
            new CSGConnector(translation, axisVector, normalVector);
        // resulting transform
        let m = thisConnector.getTransformationTo(toConnector, false, 0);
        // create plane as a (partial non-closed) CSG in XY plane
        let bounds = this.getBounds();
        bounds[0] = bounds[0].minus(new CSGVector2D(1, 1));
        bounds[1] = bounds[1].plus(new CSGVector2D(1, 1));
        let csgshell = this._toCSGWall(-1, 1);
        let csgplane = CSG.fromPolygons([new CSGPolygon([
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
        let polys = csgplane.polygons.filter((polygon) => Math.abs(polygon.plane.normal.z) > 0.99);
        // finally, position the plane per passed transformations
        return polys.map((poly) => poly.transform(m));
    }

    /*
         * given 2 connectors, this returns all polygons of a "wall" between 2
         * copies of this cag, positioned in 3d space as "bottom" and
         * "top" plane per connectors toConnector1, and toConnector2, respectively
         */
    /**
     * 给定2个连接器，这将返回2之间的“墙”的所有多边形
     * @param options
     * @private
     */
    private _toWallPolygons(options: any) {
        // normals are going to be correct as long as toConn2.point - toConn1.point
        // points into cag normal direction (check in caller)
        // arguments: options.toConnector1, options.toConnector2, options.cag
        //     walls go from toConnector1 to toConnector2
        //     optionally, target cag to point to - cag needs to have same number of sides as this!
        let origin = [0, 0, 0];
        let defaultAxis = [0, 0, 1];
        let defaultNormal = [0, 1, 0];
        let thisConnector = new CSGConnector(origin, defaultAxis, defaultNormal);
        // arguments:
        let toConnector1 = options.toConnector1;
        // let toConnector2 = new CSGConnector([0, 0, -30], defaultAxis, defaultNormal);
        let toConnector2 = options.toConnector2;
        if (!(toConnector1 instanceof CSGConnector && toConnector2 instanceof CSGConnector)) {
            throw ('could not parse CSG.Connector arguments toConnector1 or toConnector2');
        }
        if (options.cag) {
            if (options.cag.sides.length != this.sides.length) {
                throw ('target cag needs same sides count as start cag');
            }
        }
        // target cag is same as this unless specified
        let toCag = options.cag || this;
        let m1 = thisConnector.getTransformationTo(toConnector1, false, 0);
        let m2 = thisConnector.getTransformationTo(toConnector2, false, 0);
        let vps1 = this._toVector3DPairs(m1);
        let vps2 = toCag._toVector3DPairs(m2);
        let polygons: any = [];
        vps1.forEach((vp1, i) => {
            polygons.push(new CSGPolygon([
                new CSGVertex(vps2[i][1]), new CSGVertex(vps2[i][0]), new CSGVertex(vp1[0]),
            ]));
            polygons.push(new CSGPolygon([
                new CSGVertex(vps2[i][1]), new CSGVertex(vp1[0]), new CSGVertex(vp1[1]),
            ]));
        });
        return polygons;
    }

    /**
     * 联合
     * @param cag
     */
    public union(cag: any) {
        let cags;
        if (cag instanceof Array) {
            cags = cag;
        } else {
            cags = [cag];
        }
        let r = this._toCSGWall(-1, 1);
        r = r.union(
            cags.map((cag) => cag._toCSGWall(-1, 1).reTesselated()));
        return CAG.fromFakeCSG(r).canonicalized();
    }

    /**
     * 减去
     * @param cag
     */
    public subtract(cag: any) {
        let cags;
        if (cag instanceof Array) {
            cags = cag;
        } else {
            cags = [cag];
        }
        let r: any = this._toCSGWall(-1, 1);
        cags.map((cag) => {
            r = r.subtractSub(cag._toCSGWall(-1, 1), false, false);
        });
        r = r.reTesselated();
        r = r.canonicalized();
        r = CAG.fromFakeCSG(r);
        r = r.canonicalized();
        return r;
    }

    /**
     * 求交
     * @param cag
     */
    public intersect(cag: any) {
        let cags;
        if (cag instanceof Array) {
            cags = cag;
        } else {
            cags = [cag];
        }
        let r: any = this._toCSGWall(-1, 1);
        cags.map((cag) => {
            r = r.intersectSub(cag._toCSGWall(-1, 1), false, false);
        });
        r = r.reTesselated();
        r = r.canonicalized();
        r = CAG.fromFakeCSG(r);
        r = r.canonicalized();
        return r;
    }

    /**
     * 转化
     * @param matrix4x4
     */
    public transform(matrix4x4: any) {
        let ismirror = matrix4x4.isMirroring();
        let newsides = this.sides.map((side) => side.transform(matrix4x4));
        let result = CAG.fromSides(newsides);
        if (ismirror) {
            result = result.flipped();
        }
        return result;
    }

    // see http://local.wasp.uwa.edu.au/~pbourke/geometry/polyarea/ :
    // Area of the polygon. For a counter clockwise rotating polygon the area is positive, otherwise negative
    // Note(bebbi): this looks wrong. See polygon getArea()
    /**
     * 获取多边形面积
     */
    public area() {
        let polygonArea = 0;
        this.sides.map((side) => {
            polygonArea += side.vertex0.pos.cross(side.vertex1.pos);
        });
        polygonArea *= 0.5;
        return polygonArea;
    }

    /**
     * 获取新对象
     */
    public flipped() {
        let newsides = this.sides.map((side) => side.flipped());
        newsides.reverse();
        return CAG.fromSides(newsides);
    }

    /**
     * 获取包围盒
     */
    public getBounds() {
        let minpoint: any;
        if (this.sides.length == 0) {
            minpoint = new CSGVector2D(0, 0);
        } else {
            minpoint = this.sides[0].vertex0.pos;
        }
        let maxpoint = minpoint;
        this.sides.map((side) => {
            minpoint = minpoint.min(side.vertex0.pos);
            minpoint = minpoint.min(side.vertex1.pos);
            maxpoint = maxpoint.max(side.vertex0.pos);
            maxpoint = maxpoint.max(side.vertex1.pos);
        });
        return [minpoint, maxpoint];
    }

    /**
     * 自相交状态
     * @param debug
     */
    public isSelfIntersecting(debug?: any) {
        let numsides = this.sides.length;
        for (let i = 0; i < numsides; i++) {
            let side0 = this.sides[i];
            for (let ii = i + 1; ii < numsides; ii++) {
                let side1 = this.sides[ii];
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
    }

    /**
     * 扩大壳体
     * @param radius
     * @param resolution
     */
    public expandedShell(radius: any, resolution: any) {
        resolution = resolution || 8;
        if (resolution < 4) {
            resolution = 4;
        }
        let cags = [];
        let pointmap: any = {};
        let cag = this.canonicalized();
        cag.sides.map((side) => {
            let d = side.vertex1.pos.minus(side.vertex0.pos);
            let dl = d.length();
            if (dl > 1e-5) {
                d = d.times(1.0 / dl);
                let normal = d.normal().times(radius);
                let shellpoints = [
                    side.vertex1.pos.plus(normal),
                    side.vertex1.pos.minus(normal),
                    side.vertex0.pos.minus(normal),
                    side.vertex0.pos.plus(normal),
                ];
                //      let newcag = CAG.fromPointsNoCheck(shellpoints);
                let newcag = CAG.fromPoints(shellpoints);
                cags.push(newcag);
                for (let step = 0; step < 2; step++) {
                    let p1 = (step == 0) ? side.vertex0.pos : side.vertex1.pos;
                    let p2 = (step == 0) ? side.vertex1.pos : side.vertex0.pos;
                    let tag = `${p1.x} ${p1.y}`;
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
        for (let tag in pointmap) {
            let m = pointmap[tag];
            let angle1;
            let
                angle2;
            let pcenter = m[0].p1;
            if (m.length == 2) {
                let end1 = m[0].p2;
                let end2 = m[1].p2;
                angle1 = end1.minus(pcenter).angleDegrees();
                angle2 = end2.minus(pcenter).angleDegrees();
                if (angle2 < angle1) {
                    angle2 += 360;
                }
                if (angle2 >= (angle1 + 360)) {
                    angle2 -= 360;
                }
                if (angle2 < angle1 + 180) {
                    let t = angle2;
                    angle2 = angle1 + 360;
                    angle1 = t;
                }
                angle1 += 90;
                angle2 -= 90;
            } else {
                angle1 = 0;
                angle2 = 360;
            }
            let fullcircle = (angle2 > angle1 + 359.999);
            if (fullcircle) {
                angle1 = 0;
                angle2 = 360;
            }
            if (angle2 > (angle1 + 1e-5)) {
                let points = [];
                if (!fullcircle) {
                    points.push(pcenter);
                }
                let numsteps = Math.round(resolution * (angle2 - angle1) / 360);
                if (numsteps < 1) {
                    numsteps = 1;
                }
                for (let step = 0; step <= numsteps; step++) {
                    let angle = angle1 + step / numsteps * (angle2 - angle1);
                    if (step == numsteps) {
                        angle = angle2;
                    } // prevent rounding errors
                    let point = pcenter.plus(CSGVector2D.fromAngleDegrees(angle).times(radius));
                    if ((!fullcircle) || (step > 0)) {
                        points.push(point);
                    }
                }
                let newcag = CAG.fromPointsNoCheck(points);
                cags.push(newcag);
            }
        }
        let result = new CAG();
        result = result.union(cags);
        return result;
    }

    /**
     * 向外偏移
     * @param radius
     * @param resolution
     */
    public expand(radius: any, resolution: any) {
        let result = this.union(this.expandedShell(radius, resolution));
        return result;
    }

    /**
     * 向内偏移
     * @param radius
     * @param resolution
     */
    public contract(radius: any, resolution: any) {
        let result = this.subtract(this.expandedShell(radius, resolution));
        return result;
    }

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
    /**
     * 将CAG挤压到特定平面
     * @param orthonormalbasis
     * @param depth
     * @param options
     */
    public extrudeInOrthonormalBasis(orthonormalbasis: any, depth: any, options?: any) {
        // first extrude in the regular Z plane:
        if (!(orthonormalbasis instanceof CSGOrthoNormalBasis)) {
            throw new Error('extrudeInPlane: the first parameter should be a CSG.OrthoNormalBasis');
        }
        let extruded = this.extrude({
            offset: [0, 0, depth],
        });
        if (CSG.parseOptionAsBool(options, 'symmetrical', false)) {
            extruded = extruded.translate([0, 0, -depth / 2]);
        }
        let matrix = orthonormalbasis.getInverseProjectionMatrix();
        extruded = extruded.transform(matrix);
        return extruded;
    }

    // Extrude in a standard cartesian plane, specified by two axis identifiers. Each identifier can be
    // one of ["X","Y","Z","-X","-Y","-Z"]
    // The 2d x axis will map to the first given 3D axis, the 2d y axis will map to the second.
    // See CSG.OrthoNormalBasis.GetCartesian for details.
    /**
     * 在标准笛卡尔坐标系中挤压
     * @param axis1
     * @param axis2
     * @param depth
     * @param options
     */
    public extrudeInPlane(axis1: any, axis2: any, depth: any, options: any) {
        return this.extrudeInOrthonormalBasis(CSGOrthoNormalBasis.GetCartesian(axis1, axis2), depth, options);
    }

    // extruded=cag.extrude({offset: [0,0,10], twistangle: 360, twiststeps: 100});
    // linear extrusion of 2D shape, with optional twist
    // The 2d shape is placed in in z=0 plane and extruded into direction <offset> (a CSG.Vector3D)
    // The final face is rotated <twistangle> degrees. Rotation is done around the origin of the 2d shape (i.e. x=0, y=0)
    // twiststeps determines the resolution of the twist (should be >= 1)
    // returns a CSG object
    /**
     * 挤压
     * @param options
     */
    public extrude(options: any) {
        if (this.sides.length == 0) {
            // empty!
            return new CSG();
        }
        let offsetVector = CSG.parseOptionAs3DVector(options, 'offset', [0, 0, 1]);
        let twistangle = CSG.parseOptionAsFloat(options, 'twistangle', 0);
        let twiststeps = CSG.parseOptionAsInt(options, 'twiststeps', CSG.defaultResolution3D);
        if (offsetVector.z == 0) {
            throw ('offset cannot be orthogonal to Z axis');
        }
        if (twistangle == 0 || twiststeps < 1) {
            twiststeps = 1;
        }
        let normalVector = CSGVector3D.Create(0, 1, 0);
        let polygons: any = [];
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
        for (let i = 0; i < twiststeps; i++) {
            let c1 = new CSGConnector(offsetVector.times(i / twiststeps), [0, 0, offsetVector.z],
                normalVector.rotateZ(i * twistangle / twiststeps));
            let c2 = new CSGConnector(offsetVector.times((i + 1) / twiststeps), [0, 0, offsetVector.z],
                normalVector.rotateZ((i + 1) * twistangle / twiststeps));
            polygons = polygons.concat(this._toWallPolygons({
                toConnector1: c1,
                toConnector2: c2,
            }));
        }
        return CSG.fromPolygons(polygons);
    }

    /*
         * extrude CAG to 3d object by rotating the origin around the y axis
         * (and turning everything into XY plane)
         * arguments: options dict with angle and resolution, both optional
         */
    /**
     * 旋转拉伸
     * @param options
     */
    public rotateExtrude(options: any) {
        let alpha = CSG.parseOptionAsFloat(options, 'angle', 360);
        let resolution = CSG.parseOptionAsInt(options, 'resolution', CSG.defaultResolution3D);
        let EPS = 1e-5;
        alpha = alpha > 360 ? alpha % 360 : alpha;
        let origin = [0, 0, 0];
        let axisV = CSGVector3D.Create(0, 1, 0);
        let normalV = [0, 0, 1];
        let polygons: any = [];
        // planes only needed if alpha > 0
        let connS = new CSGConnector(origin, axisV, normalV);
        if (alpha > 0 && alpha < 360) {
            // we need to rotate negative to satisfy wall function condition of
            // building in the direction of axis vector
            let connE = new CSGConnector(origin, axisV.rotateZ(-alpha), normalV);
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
        let connT1 = connS;
        let connT2;
        let step = alpha / resolution;
        for (let a = step; a <= alpha + EPS; a += step) {
            connT2 = new CSGConnector(origin, axisV.rotateZ(-a), normalV);
            polygons = polygons.concat(this._toWallPolygons({
                toConnector1: connT1,
                toConnector2: connT2,
            }));
            connT1 = connT2;
        }
        return CSG.fromPolygons(polygons).reTesselated();
    }

    // check if we are a valid CAG (for debugging)
    // NOTE(bebbi) uneven side count doesn't work because rounding with EPS isn't taken into account
    /**
     * 检查我们是否为有效的CAG（用于调试）
     */
    public check() {
        let EPS = 1e-5;
        let errors = [];
        if (this.isSelfIntersecting(true)) {
            errors.push('Self intersects');
        }
        let pointcount: any = {};
        this.sides.map((side) => {
            function mappoint(p: any) {
                let tag = `${p.x} ${p.y}`;
                if (!(tag in pointcount)) {
                    pointcount[tag] = 0;
                }
                pointcount[tag]++;
            }

            mappoint(side.vertex0.pos);
            mappoint(side.vertex1.pos);
        });
        for (let tag in pointcount) {
            let count = pointcount[tag];
            if (count & 1) {
                errors.push(`Uneven number of sides (${count}) for point ${tag}`);
            }
        }
        let area = this.area();
        if (area < EPS * EPS) {
            errors.push(`Area is ${area}`);
        }
        if (errors.length > 0) {
            let ertxt = '';
            errors.map((err) => {
                ertxt += `${err}\n`;
            });
            throw new Error(ertxt);
        }
    }

    /**
     * 规范化
     */
    public canonicalized() {
        if (this.isCanonicalized) {
            return this;
        } else {
            let factory = new CAGFuzzyFactory();
            let result = factory.getCAG(this);
            result.isCanonicalized = true;
            return result;
        }
    }

    /**
     * 压缩
     */
    public toCompactBinary() {
        let cag = this.canonicalized();
        let numsides = cag.sides.length;
        let vertexmap: any = {};
        let vertices: any = [];
        let numvertices = 0;
        let sideVertexIndices = new Uint32Array(2 * numsides);
        let sidevertexindicesindex = 0;
        cag.sides.map((side) => {
            [side.vertex0, side.vertex1].map((v) => {
                let vertextag = v.getTag();
                let vertexindex;
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
        let vertexData = new Float64Array(numvertices * 2);
        let verticesArrayIndex = 0;
        vertices.map((v: any) => {
            let pos = v.pos;
            vertexData[verticesArrayIndex++] = pos._x;
            vertexData[verticesArrayIndex++] = pos._y;
        });
        let result = {
            class: 'CAG',
            sideVertexIndices,
            vertexData,
        };
        return result;
    }

    /**
     * 获取外轮廓路径
     */
    public getOutlinePaths() {
        let cag = this.canonicalized();
        let sideTagToSideMap: any = {};
        let startVertexTagToSideTagMap: any = {};
        cag.sides.map((side) => {
            let sidetag = side.getTag();
            sideTagToSideMap[sidetag] = side;
            let startvertextag = side.vertex0.getTag();
            if (!(startvertextag in startVertexTagToSideTagMap)) {
                startVertexTagToSideTagMap[startvertextag] = [];
            }
            startVertexTagToSideTagMap[startvertextag].push(sidetag);
        });
        let paths = [];
        while (true) {
            let startsidetag = null;
            for (let aVertexTag in startVertexTagToSideTagMap) {
                let sidesForThisVertex = startVertexTagToSideTagMap[aVertexTag];
                startsidetag = sidesForThisVertex[0];
                sidesForThisVertex.splice(0, 1);
                if (sidesForThisVertex.length == 0) {
                    delete startVertexTagToSideTagMap[aVertexTag];
                }
                break;
            }
            if (startsidetag == null) {
                break;
            } // we've had all sides
            let connectedVertexPoints = [];
            let sidetag = startsidetag;
            let thisside = sideTagToSideMap[sidetag];
            let startvertextag = thisside.vertex0.getTag();
            while (true) {
                connectedVertexPoints.push(thisside.vertex0.pos);
                let nextvertextag = thisside.vertex1.getTag();
                if (nextvertextag == startvertextag) {
                    break;
                } // we've closed the polygon
                if (!(nextvertextag in startVertexTagToSideTagMap)) {
                    throw new Error('Area is not closed!');
                }
                let nextpossiblesidetags = startVertexTagToSideTagMap[nextvertextag];
                let nextsideindex = -1;
                if (nextpossiblesidetags.length == 1) {
                    nextsideindex = 0;
                } else {
                    // more than one side starting at the same vertex. This means we have
                    // two shapes touching at the same corner
                    let bestangle: any = null;
                    let thisangle = thisside.direction().angleDegrees();
                    for (let sideindex = 0; sideindex < nextpossiblesidetags.length; sideindex++) {
                        let nextpossiblesidetag = nextpossiblesidetags[sideindex];
                        let possibleside = sideTagToSideMap[nextpossiblesidetag];
                        let angle = possibleside.direction().angleDegrees();
                        let angledif = angle - thisangle;
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
                let nextsidetag = nextpossiblesidetags[nextsideindex];
                nextpossiblesidetags.splice(nextsideindex, 1);
                if (nextpossiblesidetags.length == 0) {
                    delete startVertexTagToSideTagMap[nextvertextag];
                }
                thisside = sideTagToSideMap[nextsidetag];
            } // inner loop
            let path = new CSGPath2D(connectedVertexPoints, true);
            paths.push(path);
        } // outer loop
        return paths;
    }

    /*
        cag = cag.overCutInsideCorners(cutterradius);

        Using a CNC router it's impossible to cut out a true sharp inside corner. The inside corner
        will be rounded due to the radius of the cutter. This function compensates for this by creating
        an extra cutout at each inner corner so that the actual cut out shape will be at least as large
        as needed.
        使用CNC铣刨机不可能切出真正的尖锐内角。
        由于刀的半径，内角将被倒圆。
        此功能通过在每个内角处创建一个额外的切口来弥补这一点，从而使实际的切口形状至少与所需的形状一样大。
        */
    public overCutInsideCorners(cutterradius: any) {
        let cag = this.canonicalized();
        // for each vertex determine the 'incoming' side and 'outgoing' side:
        let pointmap: any = {}; // tag => {pos: coord, from: [], to: []}
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
        let cutouts = [];
        for (let pointtag in pointmap) {
            let pointobj = pointmap[pointtag];
            if ((pointobj.from.length == 1) && (pointobj.to.length == 1)) {
                // ok, 1 incoming side and 1 outgoing side:
                let fromcoord = pointobj.from[0];
                let pointcoord = pointobj.pos;
                let tocoord = pointobj.to[0];
                let v1 = pointcoord.minus(fromcoord).unit();
                let v2 = tocoord.minus(pointcoord).unit();
                let crossproduct = v1.cross(v2);
                let isInnerCorner = (crossproduct < 0.001);
                if (isInnerCorner) {
                    // yes it's a sharp corner:
                    let alpha = v2.angleRadians() - v1.angleRadians() + Math.PI;
                    if (alpha < 0) {
                        alpha += 2 * Math.PI;
                    } else if (alpha >= 2 * Math.PI) {
                        alpha -= 2 * Math.PI;
                    }
                    let midvector = v2.minus(v1).unit();
                    let circlesegmentangle = 30 / 180 * Math.PI; // resolution of the circle: segments of 30 degrees
                    // we need to increase the radius slightly so that our imperfect circle will contain a perfect circle of cutterradius
                    let radiuscorrected = cutterradius / Math.cos(circlesegmentangle / 2);
                    let circlecenter = pointcoord.plus(midvector.times(radiuscorrected));
                    // we don't need to create a full circle; a pie is enough. Find the angles for the pie:
                    let startangle = alpha + midvector.angleRadians();
                    let deltaangle = 2 * (Math.PI - alpha);
                    let numsteps = 2 * Math.ceil(deltaangle / circlesegmentangle / 2); // should be even
                    // build the pie:
                    let points = [circlecenter];
                    for (let i = 0; i <= numsteps; i++) {
                        let angle = startangle + i / numsteps * deltaangle;
                        let p = CSGVector2D.fromAngleRadians(angle).times(radiuscorrected).plus(circlecenter);
                        points.push(p);
                    }
                    cutouts.push(CAG.fromPoints(points));
                }
            }
        }
        let result = cag.subtract(cutouts);
        return result;
    }

    /**
     * 镜像
     * @param plane
     */
    public mirrored(plane: any) {
        return this.transform(CSGMatrix4x4.mirroring(plane));
    }

    /**
     * X轴镜像
     */
    public mirroredX() {
        let plane = new CSGPlane(CSGVector3D.Create(1, 0, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Y轴镜像
     */
    public mirroredY() {
        let plane = new CSGPlane(CSGVector3D.Create(0, 1, 0), 0);
        return this.mirrored(plane);
    }

    /**
     * Z轴镜像
     */
    public mirroredZ() {
        let plane = new CSGPlane(CSGVector3D.Create(0, 0, 1), 0);
        return this.mirrored(plane);
    }

    /**
     * 转化
     * @param v
     */
    public translate(v: any) {
        return this.transform(CSGMatrix4x4.translation(v));
    }

    /**
     * 缩放
     * @param f
     */
    public scale(f: any) {
        return this.transform(CSGMatrix4x4.scaling(f));
    }

    /**
     * X轴旋转
     * @param deg
     */
    public rotateX(deg: any) {
        return this.transform(CSGMatrix4x4.rotationX(deg));
    }

    /**
     * Y轴旋转
     * @param deg
     */
    public rotateY(deg: any) {
        return this.transform(CSGMatrix4x4.rotationY(deg));
    }

    /**
     * Z轴旋转
     * @param deg
     */
    public rotateZ(deg: any) {
        return this.transform(CSGMatrix4x4.rotationZ(deg));
    }

    /**
     * 旋转
     * @param rotationCenter
     * @param rotationAxis
     * @param degrees
     */
    public rotate(rotationCenter: any, rotationAxis: any, degrees: any) {
        return this.transform(CSGMatrix4x4.rotation(rotationCenter, rotationAxis, degrees));
    }

    /**
     * 旋转欧拉角
     * @param alpha
     * @param beta
     * @param gamma
     * @param position
     */
    public rotateEulerAngles(alpha: any, beta: any, gamma: any, position: any) {
        position = position || [0, 0, 0];
        let Rz1 = CSGMatrix4x4.rotationZ(alpha);
        let Rx = CSGMatrix4x4.rotationX(beta);
        let Rz2 = CSGMatrix4x4.rotationZ(gamma);
        let T = CSGMatrix4x4.translation(new CSGVector3D(position));
        return this.transform(Rz2.multiply(Rx).multiply(Rz1).multiply(T));
    }

    /**
     * 中心
     * @param cAxes
     */
    public center(cAxes: any) {
        let axes = ['x', 'y'];

        cAxes = Array.prototype.map.call(arguments, (a: any) => a.toLowerCase());
        // no args: center on all axes
        if (!cAxes.length) {
            cAxes = axes.slice();
        }
        let b = this.getBounds();

        return this.translate(axes.map((a) => (cAxes.indexOf(a) > -1 ?
            -(b[0][a] + b[1][a]) / 2 : 0)));
    }
}

