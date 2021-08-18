import {CSGPolygonTreeNode} from './CSGPolygonTreeNode.js';
import {CSGNode} from './CSGNode.js';

var CSGTree = function (polygons) {
    this.rootnode = new CSGNode(null);
    this.polygonTree = new CSGPolygonTreeNode();
    if (polygons) {
        this.addPolygons(polygons);
    }
};

Object.assign(CSGTree.prototype, {

    invert() {
        this.polygonTree.invert();
        this.rootnode.invert();
    },

    // Remove all polygons in this BSP tree that are inside the other BSP tree
    // `tree`.
    clipTo(tree, alsoRemovecoplanarFront) {
        alsoRemovecoplanarFront = !!alsoRemovecoplanarFront;
        this.rootnode.clipTo(tree, alsoRemovecoplanarFront);
    },

    allPolygons() {
        var result = [];
        this.polygonTree.getPolygons(result);
        return result;
    },

    addPolygons(polygons) {
        var _this = this;
        var polygontreenodes = polygons.map(p => _this.polygonTree.addChild(p));
        this.rootnode.addPolygonTreeNodes(polygontreenodes);
    },
});

export {CSGTree};
