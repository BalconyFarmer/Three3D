import {CSG} from './CSG';
import {CSGVector3D} from './CSGVector3D';
import {CSGConnector} from './CSGConnector';
import {CSGPath2D} from './CSGPath2D';
import {InterfaceCSGVector3D} from "./InterfaceCSG";

/**
 * CSG连接点列表类
 */
export class CSGConnectorList {
    /**
     * 连接点
     */
    public connectors_: CSGConnector[] | any[];

    /**
     * 默认向量
     */
    static defaultNormal: any = [0, 0, 1];

    /**
     * 封闭
     */
    public closed: boolean;

    /**
     * 构造函数
     * @param connectors
     */
    constructor(connectors?: CSGConnector[]) {
        this.connectors_ = connectors ? connectors.slice() : [];
    }

    /**
     * 从2D路径创建
     * @param path2D
     * @param arg1
     * @param arg2
     */
    static fromPath2D(path2D: CSGPath2D, arg1: InterfaceCSGVector3D, arg2: InterfaceCSGVector3D): CSGConnectorList {
        if (arguments.length == 3) {
            return CSGConnectorList._fromPath2DTangents(path2D, arg1, arg2);
        } else if (arguments.length == 2) {
            return CSGConnectorList._fromPath2DExplicit(path2D, arg1);
        } else {
            throw ('call with path2D and either 2 direction vectors, or a function returning direction vectors');
        }
    }

    /*
     * calculate the connector axisvectors by calculating the "tangent" for path2D.
     * This is undefined for start and end points, so axis for these have to be manually
     * provided.
     */
    /**
     * 通过计算path2D的“切线”来计算连接器轴矢量。
     * @param path2D
     * @param start
     * @param end
     * @private
     */
    static _fromPath2DTangents(path2D: CSGPath2D, start: InterfaceCSGVector3D, end: InterfaceCSGVector3D): CSGConnectorList {
        // path2D
        let axis;
        let pathLen = path2D.points.length;
        let result = new CSGConnectorList([new CSGConnector(path2D.points[0],
            start, CSGConnectorList.defaultNormal)]);
        // middle points
        path2D.points.slice(1, pathLen - 1).forEach((p2: any, i: any) => {
            axis = path2D.points[i + 2].minus(path2D.points[i]).toVector3D(0);
            result.appendConnector(new CSGConnector(p2.toVector3D(0), axis,
                CSGConnectorList.defaultNormal));
        }, this);
        result.appendConnector(new CSGConnector(path2D.points[pathLen - 1], end,
            CSGConnectorList.defaultNormal));
        result.closed = path2D.closed;
        return result;
    }

    /*
         * angleIsh: either a static angle, or a function(point) returning an angle
         */
    /**
     * 返回角度
     * @param path2D
     * @param angleIsh
     * @private
     */
    static _fromPath2DExplicit(path2D: CSGPath2D, angleIsh: any): CSGConnectorList {
        function getAngle(angleIsh: any, pt: any, i: any) {
            if (typeof angleIsh == 'function') {
                angleIsh = angleIsh(pt, i);
            }
            return angleIsh;
        }

        let result = new CSGConnectorList(
            path2D.points.map((p2: any, i: any) => new CSGConnector(p2.toVector3D(0),
                CSGVector3D.Create(1, 0, 0).rotateZ(getAngle(angleIsh, p2, i)),
                CSGConnectorList.defaultNormal), this),
        );
        result.closed = path2D.closed;
        return result;
    }

    /**
     * 设置封闭
     * @param closed
     */
    public setClosed(closed: any) {
        this.closed = !!closed;
    }

    /**
     * 添加连接点
     * @param conn
     */
    public appendConnector(conn: CSGConnector) {
        this.connectors_.push(conn);
    }

    /*
         * arguments: cagish: a cag or a function(connector) returning a cag
         *            closed: whether the 3d path defined by connectors location
         *              should be closed or stay open
         *              Note: don't duplicate connectors in the path
         * TODO: consider an option "maySelfIntersect" to close & force union all single segments
         */
    /**
     * 按照
     * @param cagish
     */
    public followWith(cagish: any): CSG {
        this.verify();

        function getCag(cagish: any, connector: any) {
            if (typeof cagish == 'function') {
                cagish = cagish(connector.point, connector.axisvector, connector.normalvector);
            }
            return cagish;
        }

        let polygons: any[] = [];
        let currCag;
        let prevConnector = this.connectors_[this.connectors_.length - 1];
        let prevCag = getCag(cagish, prevConnector);

        // add walls 添加墙
        this.connectors_.forEach((connector: any, notFirst: any) => {
            currCag = getCag(cagish, connector);
            if (this.closed || notFirst) {
                polygons.push.apply(polygons, prevCag._toWallPolygons({
                    toConnector1: prevConnector,
                    toConnector2: connector,
                    cag: currCag,
                }));
            } else {
                // it is the first, and shape not closed -> build start wall
                polygons.push.apply(polygons,
                    currCag._toPlanePolygons({
                        toConnector: connector,
                        flipped: true,
                    }));
            }
            if (notFirst == this.connectors_.length - 1 && !this.closed) {
                // build end wall
                polygons.push.apply(polygons,
                    currCag._toPlanePolygons({
                        toConnector: connector,
                    }));
            }
            prevCag = currCag;
            prevConnector = connector;
        }, this);
        return CSG.fromPolygons(polygons).reTesselated().canonicalized();
    }

    /*
         * general idea behind these checks: connectors need to have smooth transition from one to another
         * TODO: add a check that 2 follow-on CAGs are not intersecting
         */
    /**
     * 核对
     */
    public verify() {
        let connI;
        let connI1;
        let dPosToAxis;
        let
            axisToNextAxis;
        for (let i = 0; i < this.connectors_.length - 1; i++) {
            connI = this.connectors_[i], connI1 = this.connectors_[i + 1];
            if (connI1.point.minus(connI.point).dot(connI.axisvector) <= 0) {
                throw ('Invalid ConnectorList. Each connectors position needs to be within a <90deg range of previous connectors axisvector');
            }
            if (connI.axisvector.dot(connI1.axisvector) <= 0) {
                throw ('invalid ConnectorList. No neighboring connectors axisvectors may span a >=90deg angle');
            }
        }
    }
}
