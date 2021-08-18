import {CSGPolygon} from "./CSGPolygon";
import {CSGPlane} from "./CSGPlane";
import {CSGNode} from "./CSGNode";


/**
 * CSG多边形树节点
 */
export class CSGPolygonTreeNode {
    /**
     * 父对象
     */
    public parent: any;

    /**
     * 子对象
     */
    public children: any[];

    /**
     * 多边形
     */
    public polygon: CSGPolygon | null;

    /**
     * 移除
     */
    public removed: boolean;

    /**
     * 构造函数
     */
    constructor() {
        /**
         * 父对象
         */
        this.parent = null;

        /**
         * 子对象
         */
        this.children = [];

        /**
         * 多边形
         */
        this.polygon = null;

        /**
         * 移除状态
         */
        this.removed = false;
    }

    /**
     * 添加多边形
     * @param polygons
     */
    public addPolygons(polygons: CSGPolygon[]) {
        if (!this.isRootNode())
            // new polygons can only be added to root node; children can only be splitted polygons
        {
            throw new Error('Assertion failed');
        }
        let _this = this;
        polygons.map((polygon) => {
            _this.addChild(polygon);
        });
    }

    // remove a node
    // - the siblings become toplevel nodes
    // - the parent is removed recursively
    /**
     * 移除节点
     */
    public remove() {
        if (!this.removed) {
            this.removed = true;
            /* if (_CSGDEBUG) {
                    if (this.isRootNode()) throw new Error("Assertion failed") // can't remove root node
                    if (this.children.length) throw new Error("Assertion failed") // we shouldn't remove nodes with children
                } */
            // remove ourselves from the parent's children list:
            let parentschildren = this.parent.children;
            let i = parentschildren.indexOf(this);
            if (i < 0) {
                throw new Error('Assertion failed');
            }
            parentschildren.splice(i, 1);
            // invalidate the parent's polygon, and of all parents above it:
            this.parent.recursivelyInvalidatePolygon();
        }
    }

    /**
     * 移除状态
     */
    public isRemoved(): boolean {
        return this.removed;
    }

    /**
     * 根节点状态
     */
    public isRootNode(): boolean {
        return !this.parent;
    }

    // invert all polygons in the tree. Call on the root node
    /**
     * 镜像所有多边形
     */
    public invert() {
        if (!this.isRootNode()) {
            throw new Error('Assertion failed');
        } // can only call this on the root node
        this.invertSub();
    }

    /**
     * 获取多边形
     */
    public getPolygon(): CSGPolygon {
        if (!this.polygon) {
            throw new Error('Assertion failed');
        } // doesn't have a polygon, which means that it has been broken down
        return this.polygon;
    }

    /**
     * 获取多边形
     * @param result
     */
    public getPolygons(result: any[]) {
        let children = [this];
        let queue = [children];
        let i: number;
        let j: number;
        let l: number;
        let node: any;
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
    }

    // split the node by a plane; add the resulting nodes to the frontnodes and backnodes array
    // If the plane doesn't intersect the polygon, the 'this' object is added to one of the arrays
    // If the plane does intersect the polygon, two new child nodes are created for the front and back fragments,
    //  and added to both arrays.
    /**
     * 用平面分割节点
     * @param plane
     * @param coplanarfrontnodes
     * @param coplanarbacknodes
     * @param frontnodes
     * @param backnodes
     */
    public splitByPlane(plane: CSGPlane, coplanarfrontnodes: CSGPolygonTreeNode[], coplanarbacknodes: CSGPolygonTreeNode[], frontnodes: CSGPolygonTreeNode[], backnodes: CSGPolygonTreeNode[]) {
        if (this.children.length) {
            let queue = [this.children];
            let i;
            let j;
            let l;
            let node;
            let nodes;
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
    }

    // only to be called for nodes with no children
    /**
     * 仅调用没有子节点的节点
     * @param plane
     * @param coplanarfrontnodes
     * @param coplanarbacknodes
     * @param frontnodes
     * @param backnodes
     * @private
     */
    private _splitByPlane(plane: CSGPlane, coplanarfrontnodes: any, coplanarbacknodes: any, frontnodes: any, backnodes: any) {
        let polygon = this.polygon;
        if (polygon) {
            let bound = polygon.boundingSphere();
            let sphereradius = bound[1] + 1e-4;
            let planenormal = plane.normal;
            let spherecenter = bound[0];
            let d = planenormal.dot(spherecenter) - plane.w;
            if (d > sphereradius) {
                frontnodes.push(this);
            } else if (d < -sphereradius) {
                backnodes.push(this);
            } else {
                let splitresult = plane.splitPolygon(polygon);
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
                            let frontnode = this.addChild(splitresult.front);
                            frontnodes.push(frontnode);
                        }
                        if (splitresult.back) {
                            let backnode = this.addChild(splitresult.back);
                            backnodes.push(backnode);
                        }
                        break;
                }
            }
        }
    }

    // PRIVATE methods from here:
    // add child to a node
    // this should be called whenever the polygon is split
    // a child should be created for every fragment of the split polygon
    // returns the newly created child
    /**
     * 添加子节点
     * @param polygon
     */
    public addChild(polygon: CSGPolygon) {
        let newchild = new CSGPolygonTreeNode();
        newchild.parent = this;
        newchild.polygon = polygon;
        this.children.push(newchild);
        return newchild;
    }

    /**
     * 递归子对象
     */
    public invertSub() {
        let children = [this];
        let queue = [children];
        let i;
        let j;
        let l;
        let
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
    }

    /**
     * 递归无效节点
     */
    public recursivelyInvalidatePolygon() {
        let node = this;
        while (node.polygon) {
            node.polygon = null;
            if (node.parent) {
                node = node.parent;
            }
        }
    }

}

