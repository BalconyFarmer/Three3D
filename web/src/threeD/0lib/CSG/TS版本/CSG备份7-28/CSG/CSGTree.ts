import {CSGPolygonTreeNode} from './CSGPolygonTreeNode';
import {CSGNode} from './CSGNode';
import {Nullable} from "../types";
import {CSGPolygon} from './CSGPolygon';
import {CSGVector2D} from "./CSGVector2D";

/**
 * CSG树
 */
export class CSGTree {
    /**
     * 多边形树
     */
    private polygonTree: CSGPolygonTreeNode;

    /**
     * 根节点
     */
    public rootnode: CSGNode;

    /**
     * 构造函数
     * @param polygons
     */
    constructor(polygons?: CSGPolygon | CSGPolygon[]) {
        this.polygonTree = new CSGPolygonTreeNode();
        this.rootnode = new CSGNode(null);
        if (polygons) {
            this.addPolygons(polygons);
        }
    }

    /**
     * 镜像
     */
    public invert() {
        this.polygonTree.invert();
        this.rootnode.invert();
    }

    // Remove all polygons in this BSP tree that are inside the other BSP tree
    // `tree`.
    /**
     * 删除此BSP树中所有其他BSP树中的多边形
     * @param tree
     * @param alsoRemovecoplanarFront
     */
    public clipTo(tree: CSGTree, alsoRemovecoplanarFront?: any) {
        alsoRemovecoplanarFront = !!alsoRemovecoplanarFront;
        this.rootnode.clipTo(tree, alsoRemovecoplanarFront);
    }

    /**
     * 获取所有多边形
     */
    public allPolygons(): [] {
        let result: [] = [];
        this.polygonTree.getPolygons(result);
        return result;
    }

    /**
     * 添加多边形
     * @param polygons
     */
    public addPolygons(polygons: any) {
        let _this = this;
        let polygontreenodes = polygons.map((p: any) => _this.polygonTree.addChild(p));
        this.rootnode.addPolygonTreeNodes(polygontreenodes);
    }
}
