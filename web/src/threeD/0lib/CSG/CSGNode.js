var CSGNode = function (parent) {
    this.plane = null;
    this.front = null;
    this.back = null;
    this.polygontreenodes = [];
    this.parent = parent;
};

Object.assign(CSGNode.prototype, {

    // Convert solid space to empty space and empty space to solid space.
    invert() {
        var queue = [this];
        var i;
        var
            node;
        for (var i = 0; i < queue.length; i++) {
            node = queue[i];
            if (node.plane) {
                node.plane = node.plane.flipped();
            }
            if (node.front) {
                queue.push(node.front);
            }
            if (node.back) {
                queue.push(node.back);
            }
            var temp = node.front;
            node.front = node.back;
            node.back = temp;
        }
    },

    // clip polygontreenodes to our plane
    // calls remove() for all clipped PolygonTreeNodes
    clipPolygons(polygontreenodes, alsoRemovecoplanarFront) {
        var args = {
            node: this,
            polygontreenodes,
        };
        var node;
        var stack = [];
        do {
            node = args.node;
            polygontreenodes = args.polygontreenodes;
            // begin "function"
            if (node.plane) {
                var backnodes = [];
                var frontnodes = [];
                var coplanarfrontnodes = alsoRemovecoplanarFront ? backnodes : frontnodes;
                var plane = node.plane;
                var numpolygontreenodes = polygontreenodes.length;
                for (i = 0; i < numpolygontreenodes; i++) {
                    var node1 = polygontreenodes[i];
                    if (!node1.isRemoved()) {
                        node1.splitByPlane(plane, coplanarfrontnodes, backnodes, frontnodes, backnodes);
                    }
                }
                if (node.front && (frontnodes.length > 0)) {
                    stack.push({
                        node: node.front,
                        polygontreenodes: frontnodes,
                    });
                }
                var numbacknodes = backnodes.length;
                if (node.back && (numbacknodes > 0)) {
                    stack.push({
                        node: node.back,
                        polygontreenodes: backnodes,
                    });
                } else {
                    // there's nothing behind this plane. Delete the nodes behind this plane:
                    for (var i = 0; i < numbacknodes; i++) {
                        backnodes[i].remove();
                    }
                }
            }
            args = stack.pop();
        } while (typeof (args) !== 'undefined');
    },

    // Remove all polygons in this BSP tree that are inside the other BSP tree
    // `tree`.
    clipTo(tree, alsoRemovecoplanarFront) {
        var node = this;
        var stack = [];
        do {
            if (node.polygontreenodes.length > 0) {
                tree.rootnode.clipPolygons(node.polygontreenodes, alsoRemovecoplanarFront);
            }
            if (node.front) {
                stack.push(node.front);
            }
            if (node.back) {
                stack.push(node.back);
            }
            node = stack.pop();
        } while (typeof (node) !== 'undefined');
    },

    addPolygonTreeNodes(polygontreenodes) {
        var args = {
            node: this,
            polygontreenodes,
        };
        var node;
        var stack = [];
        do {
            node = args.node;
            polygontreenodes = args.polygontreenodes;
            if (polygontreenodes.length === 0) {
                args = stack.pop();
                continue;
            }
            var _this = node;
            if (!node.plane) {
                var bestplane = polygontreenodes[0].getPolygon().plane;
                node.plane = bestplane;
            }
            var frontnodes = [];
            var backnodes = [];
            for (var i = 0, n = polygontreenodes.length; i < n; ++i) {
                polygontreenodes[i].splitByPlane(_this.plane, _this.polygontreenodes, backnodes, frontnodes, backnodes);
            }
            if (frontnodes.length > 0) {
                if (!node.front) {
                    node.front = new CSGNode(node);
                }
                stack.push({
                    node: node.front,
                    polygontreenodes: frontnodes,
                });
            }
            if (backnodes.length > 0) {
                if (!node.back) {
                    node.back = new CSGNode(node);
                }
                stack.push({
                    node: node.back,
                    polygontreenodes: backnodes,
                });
            }
            args = stack.pop();
        } while (typeof (args) !== 'undefined');
    },

    getParentPlaneNormals(normals, maxdepth) {
        if (maxdepth > 0) {
            if (this.parent) {
                normals.push(this.parent.plane.normal);
                this.parent.getParentPlaneNormals(normals, maxdepth - 1);
            }
        }
    },
});

export {CSGNode};
