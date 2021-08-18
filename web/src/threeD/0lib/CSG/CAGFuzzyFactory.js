import {CSGFuzzyFactory} from './CSGFuzzyFactory.js';
import {CAGSide} from './CAGSide.js';
import {CAG} from './CAG';

var CAGFuzzyFactory = function () {
    this.vertexfactory = new CSGFuzzyFactory(2, 1e-5);
};

Object.assign(CAGFuzzyFactory.prototype, {

    getVertex(sourcevertex) {
        var elements = [sourcevertex.pos._x, sourcevertex.pos._y];
        var result = this.vertexfactory.lookupOrCreate(elements, els => sourcevertex);
        return result;
    },

    getSide(sourceside) {
        var vertex0 = this.getVertex(sourceside.vertex0);
        var vertex1 = this.getVertex(sourceside.vertex1);
        return new CAGSide(vertex0, vertex1);
    },

    getCAG(sourcecag) {
        var _this = this;
        var newsides = sourcecag.sides.map(side => _this.getSide(side))
            // remove bad sides (mostly a user input issue)
            .filter(side => side.length() > 1e-5);
        return CAG.fromSides(newsides);
    },
});

export {CAGFuzzyFactory};
