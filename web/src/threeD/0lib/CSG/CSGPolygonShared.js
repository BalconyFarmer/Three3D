import {CSG} from './CSG.js';

var CSGPolygonShared = function (color) {
    if (color !== null) {
        if (color.length !== 4) {
            throw new Error('Expecting 4 element array');
        }
    }
    this.color = color;
};

CSGPolygonShared.fromObject = function (obj) {
    return new CSGPolygonShared(obj.color);
};

// Create CSG.Polygon.Shared from a color, can be called as follows:
// var s = CSG.Polygon.Shared.fromColor(r,g,b [,a])
// var s = CSG.Polygon.Shared.fromColor([r,g,b [,a]])
CSGPolygonShared.fromColor = function (args) {
    var color;
    if (arguments.length === 1) {
        color = arguments[0].slice(); // make deep copy
    } else {
        color = [];
        for (var i = 0; i < arguments.length; i++) {
            color.push(arguments[i]);
        }
    }
    if (color.length === 3) {
        color.push(1);
    } else if (color.length !== 4) {
        throw new Error('setColor expects either an array with 3 or 4 elements, or 3 or 4 parameters.');
    }
    return new CSGPolygonShared(color);
};

Object.assign(CSGPolygonShared.prototype, {

    getTag() {
        var result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    },

    // get a string uniquely identifying this object
    getHash() {
        if (!this.color) {
            return 'null';
        }
        return this.color.join('/');
    },
});

export {CSGPolygonShared};
