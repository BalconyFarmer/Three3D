import {CSGFuzzyFactory} from './CSGFuzzyFactory.js';
import {CSGPolygon} from './CSGPolygon.js';
import {CSG} from './CSG.js';

var CSGFuzzyCSGFactory = function () {
    this.vertexfactory = new CSGFuzzyFactory(3, 1e-5);
    this.planefactory = new CSGFuzzyFactory(4, 1e-5);
    this.polygonsharedfactory = {};
};

Object.assign(CSGFuzzyCSGFactory.prototype, {

    getPolygonShared(sourceshared) {
        var hash = sourceshared.getHash();
        if (hash in this.polygonsharedfactory) {
            return this.polygonsharedfactory[hash];
        } else {
            this.polygonsharedfactory[hash] = sourceshared;
            return sourceshared;
        }
    },

    getVertex(sourcevertex) {
        var elements = [sourcevertex.pos._x, sourcevertex.pos._y, sourcevertex.pos._z];
        var result = this.vertexfactory.lookupOrCreate(elements, els => sourcevertex);
        return result;
    },

    getPlane(sourceplane) {
        var elements = [sourceplane.normal._x, sourceplane.normal._y, sourceplane.normal._z, sourceplane.w];
        var result = this.planefactory.lookupOrCreate(elements, els => sourceplane);
        return result;
    },

    getPolygon(sourcepolygon) {
        var newplane = this.getPlane(sourcepolygon.plane);
        var newshared = this.getPolygonShared(sourcepolygon.shared);
        var _this = this;
        var newvertices = sourcepolygon.vertices.map(vertex => _this.getVertex(vertex));

        // two vertices that were originally very close may now have become
        // truly identical (referring to the same CSG.Vertex object).
        // Remove duplicate vertices:
        var newvertices_dedup = [];
        if (newvertices.length > 0) {
            var prevvertextag = newvertices[newvertices.length - 1].getTag();
            newvertices.forEach((vertex) => {
                var vertextag = vertex.getTag();
                if (vertextag !== prevvertextag) {
                    newvertices_dedup.push(vertex);
                }
                prevvertextag = vertextag;
            });
        }
        // If it's degenerate, remove all vertices:
        if (newvertices_dedup.length < 3) {
            newvertices_dedup = [];
        }
        return new CSGPolygon(newvertices_dedup, newshared, newplane);
    },

    getCSG(sourcecsg) {
        var _this = this;
        var newpolygons = [];
        sourcecsg.polygons.forEach((polygon) => {
            var newpolygon = _this.getPolygon(polygon);
            // see getPolygon above: we may get a polygon with no vertices, discard it:
            if (newpolygon.vertices.length >= 3) {
                newpolygons.push(newpolygon);
            }
        });
        return CSG.fromPolygons(newpolygons);
    },
});

export {CSGFuzzyCSGFactory};
