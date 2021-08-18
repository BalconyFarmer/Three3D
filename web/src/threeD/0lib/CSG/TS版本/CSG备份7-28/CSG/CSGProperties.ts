import {CSGMatrix4x4} from './CSGMatrix4x4'

/**
 * CSG属性类
 */
export class CSGProperties {

    constructor() {
    }

    /**
     * 转化OBJ
     * @param source
     * @param result
     * @param matrix4x4
     */
    static transformObj(source: any, result: any, matrix4x4: CSGMatrix4x4) {
        for (let propertyname in source) {
            if (propertyname == '_transform') {
                continue;
            }
            if (propertyname == '_merge') {
                continue;
            }
            let propertyvalue = source[propertyname];
            let transformed = propertyvalue;
            if (typeof (propertyvalue) == 'object') {
                if (('transform' in propertyvalue) && (typeof (propertyvalue.transform) == 'function')) {
                    transformed = propertyvalue.transform(matrix4x4);
                } else if (propertyvalue instanceof Array) {
                    transformed = [];
                    CSGProperties.transformObj(propertyvalue, transformed, matrix4x4);
                } else if (propertyvalue instanceof CSGProperties) {
                    transformed = new CSGProperties();
                    CSGProperties.transformObj(propertyvalue, transformed, matrix4x4);
                }
            }
            result[propertyname] = transformed;
        }
    }

    /**
     * 克隆
     * @param source
     * @param result
     */
    static cloneObj(source: any, result: any) {
        for (let propertyname in source) {
            if (propertyname == '_transform') {
                continue;
            }
            if (propertyname == '_merge') {
                continue;
            }
            let propertyvalue = source[propertyname];
            let cloned = propertyvalue;
            if (typeof (propertyvalue) == 'object') {
                if (propertyvalue instanceof Array) {
                    cloned = [];
                    for (let i = 0; i < propertyvalue.length; i++) {
                        cloned.push(propertyvalue[i]);
                    }
                } else if (propertyvalue instanceof CSGProperties) {
                    cloned = new CSGProperties();
                    CSGProperties.cloneObj(propertyvalue, cloned);
                }
            }
            result[propertyname] = cloned;
        }
    }

    /**
     * 添加
     * @param result
     * @param otherproperties
     */
    static addFrom(result: any, otherproperties: any) {
        for (let propertyname in otherproperties) {
            if (propertyname == '_transform') {
                continue;
            }
            if (propertyname == '_merge') {
                continue;
            }
            if ((propertyname in result) &&
                (typeof (result[propertyname]) == 'object') &&
                (result[propertyname] instanceof CSGProperties) &&
                (typeof (otherproperties[propertyname]) == 'object') &&
                (otherproperties[propertyname] instanceof CSGProperties)) {
                CSGProperties.addFrom(result[propertyname], otherproperties[propertyname]);
            } else if (!(propertyname in result)) {
                result[propertyname] = otherproperties[propertyname];
            }
        }
    }

    /**
     * 转化
     * @param matrix4x4
     * @private
     */
    private _transform(matrix4x4: CSGMatrix4x4) {
        let result = new CSGProperties();
        CSGProperties.transformObj(this, result, matrix4x4);
        return result;
    }

    /**
     * 合并
     * @param otherproperties
     * @private
     */
    private _merge(otherproperties: CSGProperties): CSGProperties {
        let result = new CSGProperties();
        CSGProperties.cloneObj(this, result);
        CSGProperties.addFrom(result, otherproperties);
        return result;
    }
}
