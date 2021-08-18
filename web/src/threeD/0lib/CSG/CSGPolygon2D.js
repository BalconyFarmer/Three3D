import {CAG} from './CAG.js';

var CSGPolygon2D = function (points) {
    var cag = CAG.fromPoints(points);
    this.sides = cag.sides;
};

CSGPolygon2D.prototype = CAG.prototype;


export {CSGPolygon2D};
