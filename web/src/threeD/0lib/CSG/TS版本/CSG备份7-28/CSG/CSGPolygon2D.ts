import {CAG} from './CAG';

// CSGPolygon2D.prototype = CAG.prototype;

/**
 * 2D多边形类
 */
export class CSGPolygon2D extends CAG {
    /**
     * 构造函数
     * @param points
     */
    constructor(points: any) {
        super();
        const cag = CAG.fromPoints(points);
        this.sides = cag.sides;
    }

}
