import {CSGFuzzyFactory} from './CSGFuzzyFactory';
import {CAGSide} from './CAGSide';
import {CAG} from './CAG';
import {CAGVertex} from './CAGVertex';

/**
 * CAG模糊工厂
 */
export class CAGFuzzyFactory {
    /**
     * 顶点工厂
     */
    public vertexfactory: CSGFuzzyFactory;

    /**
     * 构造函数
     */
    constructor() {
        this.vertexfactory = new CSGFuzzyFactory(2, 1e-5);
    }

    /**
     * 获取顶点
     * @param sourcevertex
     */
    public getVertex(sourcevertex: CAGVertex): any {
        let elements = [sourcevertex.pos._x, sourcevertex.pos._y];
        let result = this.vertexfactory.lookupOrCreate(elements, (els: any) => sourcevertex);
        return result;
    }

    /**
     * 获取边
     * @param sourceside
     */
    public getSide(sourceside: CAGSide): CAGSide {
        let vertex0 = this.getVertex(sourceside.vertex0);
        let vertex1 = this.getVertex(sourceside.vertex1);
        return new CAGSide(vertex0, vertex1);
    }

    /**
     * 获取CAG
     * @param sourcecag
     */
    public getCAG(sourcecag: any): CAG {
        let _this = this;
        let newsides = sourcecag.sides.map((side: any) => _this.getSide(side))
            // remove bad sides (mostly a user input issue)
            .filter((side: any) => side.length() > 1e-5);
        return CAG.fromSides(newsides);
    }
}

