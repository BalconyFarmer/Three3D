var CSGPolygonTreeNode = function () {
    this.parent = null;
    this.children = [];
    this.polygon = null;
    this.removed = false;
};

Object.assign(CSGPolygonTreeNode.prototype, {

    // fill the tree with polygons. Should be called on the root node only; child nodes must
    // always be a derivate (split) of the parent node.
    addPolygons(polygons) {
        if (!this.isRootNode())
            // new polygons can only be added to root node; children can only be splitted polygons
        {
            throw new Error('Assertion failed');
        }
        var _this = this;
        polygons.map((polygon) => {
            _this.addChild(polygon);
        });
    },

    // remove a node
    // - the siblings become toplevel nodes
    // - the parent is removed recursively
    remove() {
        if (!this.removed) {
            this.removed = true;
            /* if (_CSGDEBUG) {
                    if (this.isRootNode()) throw new Error("Assertion failed") // can't remove root node
                    if (this.children.length) throw new Error("Assertion failed") // we shouldn't remove nodes with children
                } */
            // remove ourselves from the parent's children list:
            var parentschildren = this.parent.children;
            var i = parentschildren.indexOf(this);
            if (i < 0) {
                throw new Error('Assertion failed');
            }
            parentschildren.splice(i, 1);
            // invalidate the parent's polygon, and of all parents above it:
            this.parent.recursivelyInvalidatePolygon();
        }
    },

    isRemoved() {
        return this.removed;
    },

    isRootNode() {
        return !this.parent;
    },

    // invert all polygons in the tree. Call on the root node
    invert() {
        if (!this.isRootNode()) {
            throw new Error('Assertion failed');
        } // can only call this on the root node
        this.invertSub();
    },

    getPolygon() {
        if (!this.polygon) {
            throw new Error('Assertion failed');
        } // doesn't have a polygon, which means that it has been broken down
        return this.polygon;
    },

    getPolygons(result) {
        var children = [this];
        var queue = [children];
        var i;
        var j;
        var l;
        var
            node;
        for (i = 0; i < queue.length; ++i) { // queue size can change in loop, don't cache length
            children = queue[i];
            for (j = 0, l = children.length; j < l; j++) { // ok to cache length
                node = children[j];
                if (node.polygon) {
                    // the polygon hasn't been broken yet. We can ignore the children and return our polygon:
                    result.push(node.polygon);
                } else {
                    // our polygon has been split up and broken, so gather all subpolygons from the children
                    queue.push(node.children);
                }
            }
        }
    },

    // split the node by a plane; add the resulting nodes to the frontnodes and backnodes array
    // If the plane doesn't intersect the polygon, the 'this' object is added to one of the arrays
    // If the plane does intersect the polygon, two new child nodes are created for the front and back fragments,
    //  and added to both arrays.
    splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
        if (this.children.length) {
            var queue = [this.children];
            var i;
            var j;
            var l;
            var node;
            var
                nodes;
            for (i = 0; i < queue.length; i++) { // queue.length can increase, do not cache
                nodes = queue[i];
                for (j = 0, l = nodes.length; j < l; j++) { // ok to cache length
                    node = nodes[j];
                    if (node.children.length) {
                        queue.push(node.children);
                    } else {
                        // no children. Split the polygon:
                        node._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes);
                    }
                }
            }
        } else {
            this._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes);
        }
    },

    // only to be called for nodes with no children
    _splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
        var polygon = this.polygon;
        if (polygon) {
            var bound = polygon.boundingSphere();
            var sphereradius = bound[1] + 1e-4;
            var planenormal = plane.normal;
            var spherecenter = bound[0];
            var d = planenormal.dot(spherecenter) - plane.w;
            if (d > sphereradius) {
                frontnodes.push(this);
            } else if (d < -sphereradius) {
                backnodes.push(this);
            } else {
                var splitresult = plane.splitPolygon(polygon);
                switch (splitresult.type) {
                    case 0:
                        // coplanar front:
                        coplanarfrontnodes.push(this);
                        break;
                    case 1:
                        // coplanar back:
                        coplanarbacknodes.push(this);
                        break;
                    case 2:
                        // front:
                        frontnodes.push(this);
                        break;
                    case 3:
                        // back:
                        backnodes.push(this);
                        break;
                    case 4:
                        // spanning:
                        if (splitresult.front) {
                            var frontnode = this.addChild(splitresult.front);
                            frontnodes.push(frontnode);
                        }
                        if (splitresult.back) {
                            var backnode = this.addChild(splitresult.back);
                            backnodes.push(backnode);
                        }
                        break;
                }
            }
        }
    },

    // PRIVATE methods from here:
    // add child to a node
    // this should be called whenever the polygon is split
    // a child should be created for every fragment of the split polygon
    // returns the newly created child
    addChild(polygon) {
        var newchild = new CSGPolygonTreeNode();
        newchild.parent = this;
        newchild.polygon = polygon;
        this.children.push(newchild);
        return newchild;
    },

    invertSub() {
        var children = [this];
        var queue = [children];
        var i;
        var j;
        var l;
        var
            node;
        for (i = 0; i < queue.length; i++) {
            children = queue[i];
            for (j = 0, l = children.length; j < l; j++) {
                node = children[j];
                if (node.polygon) {
                    node.polygon = node.polygon.flipped();
                }
                queue.push(node.children);
            }
        }
    },

    recursivelyInvalidatePolygon() {
        var node = this;
        while (node.polygon) {
            node.polygon = null;
            if (node.parent) {
                node = node.parent;
            }
        }
    },
});

export {CSGPolygonTreeNode};
