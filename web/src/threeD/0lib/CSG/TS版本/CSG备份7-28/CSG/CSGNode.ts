import {CSGPlane} from './CSGPlane';
import {CSGTree} from './CSGTree';
import {CSGPolygonTreeNode} from './CSGPolygonTreeNode';
import {CSGVector3D} from './CSGVector3D';

/**
 * CSG树节点类
 */
export class CSGNode {
    /**
     * 当前平面节点
     */
    public plane: CSGPlane;

    /**
     * 前面节点
     */
    public front: CSGNode;

    /**
     * 背面节点
     */
    public back: CSGNode;

    /**
     * 多边形树节点
     */
    public polygontreenodes: [];

    /**
     * 父对象
     */
    public parent: CSGNode | null;

    /**
     * 构造函数
     * @param parent
     */
    constructor(parent: CSGNode | null) {
        this.polygontreenodes = [];
        this.parent = parent;
    }

    // Convert solid space to empty space and empty space to solid space.
    /**
     * 实体空间 -> 空白空间 -> 实体空间
     */
    public invert() {
        let queue: CSGNode[] = [this];
        let i;
        let node;
        for (let i = 0; i < queue.length; i++) {
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
            let temp = node.front;
            node.front = node.back;
            node.back = temp;
        }
    }

    // clip polygontreenodes to our plane
    // calls remove() for all clipped PolygonTreeNodes
    /**
     * 裁剪多边形
     * @param polygontreenodes
     * @param alsoRemovecoplanarFront
     */
    public clipPolygons(polygontreenodes: CSGPolygonTreeNode[], alsoRemovecoplanarFront: CSGNode) {
        let args: any | any[] = {
            node: this,
            polygontreenodes,
        };
        let node;
        let stack = [];
        do {
            node = args.node;
            polygontreenodes = args.polygontreenodes;
            // begin "function"
            if (node.plane) {
                let backnodes: any[] = [];
                let frontnodes: [] = [];
                let coplanarfrontnodes = alsoRemovecoplanarFront ? backnodes : frontnodes;
                let plane = node.plane;
                let numpolygontreenodes = polygontreenodes.length;
                for (let i = 0; i < numpolygontreenodes; i++) {
                    let node1 = polygontreenodes[i];
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
                let numbacknodes = backnodes.length;
                if (node.back && (numbacknodes > 0)) {
                    stack.push({
                        node: node.back,
                        polygontreenodes: backnodes,
                    });
                } else {
                    // there's nothing behind this plane. Delete the nodes behind this plane:
                    for (let i = 0; i < numbacknodes; i++) {
                        backnodes[i].remove();
                    }
                }
            }
            args = stack.pop();
        } while (typeof (args) != 'undefined');
    }

    //  Remove all polygons in this BSP tree that are inside the other BSP tree
    // `tree`.
    /**
     * 删除此BSP树中所有其他B的多边形
     * @param tree
     * @param alsoRemovecoplanarFront
     */
    public clipTo(tree: CSGTree, alsoRemovecoplanarFront: CSGNode) {
        let node: any = this;
        let stack: CSGNode[] = [];
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
        } while (typeof (node) != 'undefined');
    }

    /**
     * 添加多边形树节点
     * @param polygontreenodes
     */
    public addPolygonTreeNodes(polygontreenodes: CSGPolygonTreeNode[]) {
        let args = {
            node: this,
            polygontreenodes,
        };
        let node;
        let stack: any = [];
        do {
            node = args.node;
            polygontreenodes = args.polygontreenodes;
            if (polygontreenodes.length == 0) {
                args = stack.pop();
                continue;
            }
            let _this = node;
            if (!node.plane) {
                let bestplane = polygontreenodes[0].getPolygon().plane;
                node.plane = bestplane;
            }
            let frontnodes: [] = [];
            let backnodes: [] = [];
            for (let i = 0, n = polygontreenodes.length; i < n; ++i) {
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
        } while (typeof (args) != 'undefined');
    }

    /**
     * 获取父平面向量
     * @param normals
     * @param maxdepth
     */
    public getParentPlaneNormals(normals: CSGVector3D[], maxdepth: number) {
        if (maxdepth > 0) {
            if (this.parent) {
                normals.push(this.parent.plane.normal);
                this.parent.getParentPlaneNormals(normals, maxdepth - 1);
            }
        }
    }
}
