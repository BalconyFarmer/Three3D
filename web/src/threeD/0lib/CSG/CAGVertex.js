import {CSG} from './CSG.js';

var CAGVertex = function (pos) {
    this.pos = pos;
};

Object.assign(CAGVertex.prototype, {

    toString() {
        return `(${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)})`;
    },

    getTag() {
        var result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    },
});

export {CAGVertex};
