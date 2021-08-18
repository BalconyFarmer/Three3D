var CSGProperties = function () {
};

CSGProperties.transformObj = function (source, result, matrix4x4) {
    for (var propertyname in source) {
        if (propertyname === '_transform') {
            continue;
        }
        if (propertyname === '_merge') {
            continue;
        }
        var propertyvalue = source[propertyname];
        var transformed = propertyvalue;
        if (typeof (propertyvalue) === 'object') {
            if (('transform' in propertyvalue) && (typeof (propertyvalue.transform) === 'function')) {
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
};

CSGProperties.cloneObj = function (source, result) {
    for (var propertyname in source) {
        if (propertyname === '_transform') {
            continue;
        }
        if (propertyname === '_merge') {
            continue;
        }
        var propertyvalue = source[propertyname];
        var cloned = propertyvalue;
        if (typeof (propertyvalue) === 'object') {
            if (propertyvalue instanceof Array) {
                cloned = [];
                for (var i = 0; i < propertyvalue.length; i++) {
                    cloned.push(propertyvalue[i]);
                }
            } else if (propertyvalue instanceof CSGProperties) {
                cloned = new CSGProperties();
                CSGProperties.cloneObj(propertyvalue, cloned);
            }
        }
        result[propertyname] = cloned;
    }
};

CSGProperties.addFrom = function (result, otherproperties) {
    for (var propertyname in otherproperties) {
        if (propertyname === '_transform') {
            continue;
        }
        if (propertyname === '_merge') {
            continue;
        }
        if ((propertyname in result) &&
            (typeof (result[propertyname]) === 'object') &&
            (result[propertyname] instanceof CSGProperties) &&
            (typeof (otherproperties[propertyname]) === 'object') &&
            (otherproperties[propertyname] instanceof CSGProperties)) {
            CSGProperties.addFrom(result[propertyname], otherproperties[propertyname]);
        } else if (!(propertyname in result)) {
            result[propertyname] = otherproperties[propertyname];
        }
    }
};

Object.assign(CSGProperties.prototype, {

    _transform(matrix4x4) {
        var result = new CSGProperties();
        CSGProperties.transformObj(this, result, matrix4x4);
        return result;
    },

    _merge(otherproperties) {
        var result = new CSGProperties();
        CSGProperties.cloneObj(this, result);
        CSGProperties.addFrom(result, otherproperties);
        return result;
    },
});


export {CSGProperties};
