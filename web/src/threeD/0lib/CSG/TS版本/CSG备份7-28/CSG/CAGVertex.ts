import {CSG} from './CSG';
import {CSGVector2D} from './CSGVector2D';

/**
 * CAG顶点
 */
export class CAGVertex {
    /**
     * 位置
     */
    public pos: CSGVector2D;

    /**
     * 分类符
     */
    public tag: number;

    /**
     * 构造函数
     * @param pos
     */
    constructor(pos: CSGVector2D) {
        this.pos = pos;
    }

    /**
     * 转为字符串
     */
    public toString(): string {
        return `(${this.pos.x.toFixed(2)},${this.pos.y.toFixed(2)})`;
    }

    /**
     * 获取分类符
     */
    public getTag(): number {
        let result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    }
}
