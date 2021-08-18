import {CSG} from './CSG';

/**
 * CSG共享多边形
 */
export class CSGPolygonShared {
    /**
     * 颜色
     */
    public color: any;

    /**
     * 分类符
     */
    public tag: any;

    /**
     * 构造函数
     * @param color
     */
    constructor(color: any) {
        if (color != null) {
            if (color.length != 4) {
                throw new Error('Expecting 4 element array');
            }
        }
        this.color = color;
    }

    // Create CSG.Polygon.Shared from a color, can be called as follows:
    // let s = CSG.Polygon.Shared.fromColor(r,g,b [,a])
    // let s = CSG.Polygon.Shared.fromColor([r,g,b [,a]])
    /**
     * 从颜色创建
     * @param args
     */
    static fromColor(args: any) {
        let color;
        if (arguments.length == 1) {
            color = arguments[0].slice(); // make deep copy
        } else {
            color = [];
            for (let i = 0; i < arguments.length; i++) {
                color.push(arguments[i]);
            }
        }
        if (color.length == 3) {
            color.push(1);
        } else if (color.length != 4) {
            throw new Error('setColor expects either an array with 3 or 4 elements, or 3 or 4 parameters.');
        }
        return new CSGPolygonShared(color);
    }

    /**
     * 从对象创建
     * @param obj
     */
    static fromObject(obj: any): CSGPolygonShared {
        return new CSGPolygonShared(obj.color);
    }

    /**
     * 获取分类符
     */
    public getTag() {
        let result = this.tag;
        if (!result) {
            result = CSG.getTag();
            this.tag = result;
        }
        return result;
    }

    // get a string uniquely identifying this object
    /**
     * 获取唯一标识此对象的字符串
     */
    public getHash() {
        if (!this.color) {
            return 'null';
        }
        return this.color.join('/');
    }

}
