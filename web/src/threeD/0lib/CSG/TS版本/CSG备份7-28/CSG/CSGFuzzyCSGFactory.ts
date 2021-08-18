import {CSGFuzzyFactory} from './CSGFuzzyFactory';
import {CSGPolygon} from './CSGPolygon';
import {CSG} from './CSG';

/**
 * CSG模糊处理工厂
 */
export class CSGFuzzyCSGFactory {
    /**
     * 顶点工厂
     */
    public vertexfactory: CSGFuzzyFactory;

    /**
     * 平面工厂
     */
    public planefactory: CSGFuzzyFactory;

    /**
     * 多边形共享工厂
     */
    public polygonsharedfactory: any;

    /**
     * 构造函数
     */
    constructor() {
        this.vertexfactory = new CSGFuzzyFactory(3, 1e-5);
        this.planefactory = new CSGFuzzyFactory(4, 1e-5);
        this.polygonsharedfactory = {};
    }

    /**
     * 获取共享多边形
     * @param sourceshared
     */
    public getPolygonShared(sourceshared: any): any {
        let hash = sourceshared.getHash();
        if (hash in this.polygonsharedfactory) {
            return this.polygonsharedfactory[hash];
        } else {
            this.polygonsharedfactory[hash] = sourceshared;
            return sourceshared;
        }
    }

    /**
     * 获取顶点
     * @param sourcevertex
     */
    public getVertex(sourcevertex: any) {
        let elements = [sourcevertex.pos._x, sourcevertex.pos._y, sourcevertex.pos._z];
        let result = this.vertexfactory.lookupOrCreate(elements, (els: any) => sourcevertex);
        return result;
    }

    /**
     * 获取平面
     * @param sourceplane
     */
    public getPlane(sourceplane: any) {
        let elements = [sourceplane.normal._x, sourceplane.normal._y, sourceplane.normal._z, sourceplane.w];
        let result = this.planefactory.lookupOrCreate(elements, (els: any) => sourceplane);
        return result;
    }

    /**
     * 获取多边形
     * @param sourcepolygon
     */
    public getPolygon(sourcepolygon: any) {
        let newplane = this.getPlane(sourcepolygon.plane);
        let newshared = this.getPolygonShared(sourcepolygon.shared);
        let _this = this;
        let newvertices = sourcepolygon.vertices.map((vertex: any) => _this.getVertex(vertex));

        // two vertices that were originally very close may now have become
        // truly identical (referring to the same CSG.Vertex object).
        // Remove duplicate vertices:
        let newvertices_dedup: any = [];
        if (newvertices.length > 0) {
            let prevvertextag = newvertices[newvertices.length - 1].getTag();
            newvertices.forEach((vertex: any) => {
                let vertextag = vertex.getTag();
                if (vertextag != prevvertextag) {
                    newvertices_dedup.push(vertex);
                }
                prevvertextag = vertextag;
            });
        }
        // If it's degenerate, remove all vertices:
        if (newvertices_dedup.length < 3) {
            newvertices_dedup = [];
        }
        return new CSGPolygon(newvertices_dedup, newshared, newplane);
    }

    /**
     * 获取CSG对象
     * @param sourcecsg
     */
    public getCSG(sourcecsg: any) {
        let _this = this;
        let newpolygons: any = [];
        sourcecsg.polygons.forEach((polygon: any) => {
            let newpolygon = _this.getPolygon(polygon);
            // see getPolygon above: we may get a polygon with no vertices, discard it:
            if (newpolygon.vertices.length >= 3) {
                newpolygons.push(newpolygon);
            }
        });
        return CSG.fromPolygons(newpolygons);
    }
}
