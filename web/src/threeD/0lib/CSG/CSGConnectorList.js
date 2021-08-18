import {CSG} from './CSG.js';
import {CSGVector3D} from './CSGVector3D.js';
import {CSGConnector} from './CSGConnector.js';


var CSGConnectorList = function (connectors) {
    this.connectors_ = connectors ? connectors.slice() : [];
};

CSGConnectorList.defaultNormal = [0, 0, 1];

CSGConnectorList.fromPath2D = function (path2D, arg1, arg2) {
    if (arguments.length === 3) {
        return CSGConnectorList._fromPath2DTangents(path2D, arg1, arg2);
    } else if (arguments.length === 2) {
        return CSGConnectorList._fromPath2DExplicit(path2D, arg1);
    } else {
        throw ('call with path2D and either 2 direction vectors, or a function returning direction vectors');
    }
};

/*
     * calculate the connector axisvectors by calculating the "tangent" for path2D.
     * This is undefined for start and end points, so axis for these have to be manually
     * provided.
     */
CSGConnectorList._fromPath2DTangents = function (path2D, start, end) {
    // path2D
    var axis;
    var pathLen = path2D.points.length;
    var result = new CSGConnectorList([new CSGConnector(path2D.points[0],
        start, CSGConnectorList.defaultNormal)]);
    // middle points
    path2D.points.slice(1, pathLen - 1).forEach((p2, i) => {
        axis = path2D.points[i + 2].minus(path2D.points[i]).toVector3D(0);
        result.appendConnector(new CSGConnector(p2.toVector3D(0), axis,
            CSGConnectorList.defaultNormal));
    }, this);
    result.appendConnector(new CSGConnector(path2D.points[pathLen - 1], end,
        CSGConnectorList.defaultNormal));
    result.closed = path2D.closed;
    return result;
};

/*
     * angleIsh: either a static angle, or a function(point) returning an angle
     */
CSGConnectorList._fromPath2DExplicit = function (path2D, angleIsh) {
    function getAngle(angleIsh, pt, i) {
        if (typeof angleIsh === 'function') {
            angleIsh = angleIsh(pt, i);
        }
        return angleIsh;
    }

    var result = new CSGConnectorList(
        path2D.points.map((p2, i) => new CSGConnector(p2.toVector3D(0),
            CSGVector3D.Create(1, 0, 0).rotateZ(getAngle(angleIsh, p2, i)),
            CSGConnectorList.defaultNormal), this),
    );
    result.closed = path2D.closed;
    return result;
};

Object.assign(CSGConnectorList.prototype, {

    setClosed(closed) {
        this.closed = !!closed;
    },

    appendConnector(conn) {
        this.connectors_.push(conn);
    },

    /*
         * arguments: cagish: a cag or a function(connector) returning a cag
         *            closed: whether the 3d path defined by connectors location
         *              should be closed or stay open
         *              Note: don't duplicate connectors in the path
         * TODO: consider an option "maySelfIntersect" to close & force union all single segments
         */
    followWith(cagish) {
        this.verify();

        function getCag(cagish, connector) {
            if (typeof cagish === 'function') {
                cagish = cagish(connector.point, connector.axisvector, connector.normalvector);
            }
            return cagish;
        }

        var polygons = [];
        var currCag;
        var prevConnector = this.connectors_[this.connectors_.length - 1];
        var prevCag = getCag(cagish, prevConnector);

        // add walls
        this.connectors_.forEach(function (connector, notFirst) {
            currCag = getCag(cagish, connector);
            if (notFirst || this.closed) {
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
            if (notFirst === this.connectors_.length - 1 && !this.closed) {
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
    },

    /*
         * general idea behind these checks: connectors need to have smooth transition from one to another
         * TODO: add a check that 2 follow-on CAGs are not intersecting
         */
    verify() {
        var connI;
        var connI1;
        var dPosToAxis;
        var
            axisToNextAxis;
        for (var i = 0; i < this.connectors_.length - 1; i++) {
            connI = this.connectors_[i], connI1 = this.connectors_[i + 1];
            if (connI1.point.minus(connI.point).dot(connI.axisvector) <= 0) {
                throw ('Invalid ConnectorList. Each connectors position needs to be within a <90deg range of previous connectors axisvector');
            }
            if (connI.axisvector.dot(connI1.axisvector) <= 0) {
                throw ('invalid ConnectorList. No neighboring connectors axisvectors may span a >=90deg angle');
            }
        }
    },
});

export {CSGConnectorList};
