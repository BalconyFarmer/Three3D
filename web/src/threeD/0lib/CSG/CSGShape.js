import {Matrix4} from "../basicMath/Matrix4";

export const CSG_OPERATE = {
    Union: 0,
    Subtract: 1,
    Intersect: 2,
    Invert: 3,
    Transform: 4
};

export const CSG_SHAPE = {
    Cube: 0,
    Sphere: 1,
    Cylinder: 2,
    RoundedCylinder: 3,
    RoundedCube: 4,
};

export class CSGOperate {
    constructor(type = 1, param = null) {
        this.type = type;
        this.param = param;
    }

    pack(array, startingIndex) {
        array[startingIndex++] = this.type;

        let packedLength = 1;
        if (this.type === CSG_OPERATE.Transform) {
            this.param.toArray(array, startingIndex);
            startingIndex += 16;
            packedLength += 16;
        } else if (this.type !== CSG_OPERATE.Invert) {
            const itemPackedLength = this.param.pack(array, startingIndex);
            startingIndex += itemPackedLength;
            packedLength += itemPackedLength;
        }

        return packedLength;
    }

    unpack(array, startingIndex) {
        this.type = array[startingIndex++];

        let packedLength = 1;
        if (this.type === CSG_OPERATE.Transform) {
            this.param = new Matrix4().fromArray(array, startingIndex);
            startingIndex += 16;
            packedLength += 16;
        } else if (this.type !== CSG_OPERATE.Invert) {
            this.param = new CSGShape();
            const itemPackedLength = this.param.unpack(array, startingIndex);
            startingIndex += itemPackedLength;
            packedLength += itemPackedLength;
        }

        return packedLength;
    }
}

export class CSGShape {
    constructor(type = -1, params = {}) {
        this.type = type;
        this.params = params;
        this.operats = [];
    }

    add(type, param) {
        this.operats.push(new CSGOperate(type, param));
        return this;
    }

    pack(array, startingIndex) {
        array[startingIndex++] = this.type;

        let packedLength = 1;
        switch (this.type) {
            case CSG_SHAPE.Cube:
                array[startingIndex++] = this.params.center[0];
                array[startingIndex++] = this.params.center[1];
                array[startingIndex++] = this.params.center[2];
                array[startingIndex++] = this.params.radius;
                packedLength += 4;
                break;
            case CSG_SHAPE.Sphere:
                array[startingIndex++] = this.params.center[0];
                array[startingIndex++] = this.params.center[1];
                array[startingIndex++] = this.params.center[2];
                array[startingIndex++] = this.params.radius;
                array[startingIndex++] = this.params.resolution;
                packedLength += 5;
                break;
            case CSG_SHAPE.Cylinder:
                array[startingIndex++] = this.params.start[0];
                array[startingIndex++] = this.params.start[1];
                array[startingIndex++] = this.params.start[2];
                array[startingIndex++] = this.params.end[0];
                array[startingIndex++] = this.params.end[1];
                array[startingIndex++] = this.params.end[2];
                array[startingIndex++] = this.params.radiusStart;
                array[startingIndex++] = this.params.radiusEnd;
                array[startingIndex++] = this.params.resolution;
                packedLength += 9;
                break;
            case CSG_SHAPE.RoundedCylinder:
                array[startingIndex++] = this.params.start[0];
                array[startingIndex++] = this.params.start[1];
                array[startingIndex++] = this.params.start[2];
                array[startingIndex++] = this.params.end[0];
                array[startingIndex++] = this.params.end[1];
                array[startingIndex++] = this.params.end[2];
                array[startingIndex++] = this.params.radius;
                array[startingIndex++] = this.params.resolution;
                packedLength += 8;
                break;
            case CSG_SHAPE.RoundedCube:
                array[startingIndex++] = this.params.center[0];
                array[startingIndex++] = this.params.center[1];
                array[startingIndex++] = this.params.center[2];
                array[startingIndex++] = this.params.radius;
                array[startingIndex++] = this.params.roundradius;
                array[startingIndex++] = this.params.resolution;
                packedLength += 6;
                break;
        }

        array[startingIndex++] = this.operats.length;
        packedLength++;

        this.operats.forEach((item) => {
            const itemPackedLength = item.pack(array, startingIndex);
            packedLength += itemPackedLength;
            startingIndex += itemPackedLength;
        });

        return packedLength;
    }

    unpack(array, startingIndex) {
        this.type = array[startingIndex++];

        let packedLength = 1;
        switch (this.type) {
            case CSG_SHAPE.Cube:
                this.params.center = [];
                this.params.center[0] = array[startingIndex++];
                this.params.center[1] = array[startingIndex++];
                this.params.center[2] = array[startingIndex++];
                this.params.radius = array[startingIndex++];
                packedLength += 4;
                break;
            case CSG_SHAPE.Sphere:
                this.params.center = [];
                this.params.center[0] = array[startingIndex++];
                this.params.center[1] = array[startingIndex++];
                this.params.center[2] = array[startingIndex++];
                this.params.radius = array[startingIndex++];
                this.params.resolution = array[startingIndex++];
                packedLength += 5;
                break;
            case CSG_SHAPE.Cylinder:
                this.params.start = [];
                this.params.start[0] = array[startingIndex++];
                this.params.start[1] = array[startingIndex++];
                this.params.start[2] = array[startingIndex++];
                this.params.end = [];
                this.params.end[0] = array[startingIndex++];
                this.params.end[1] = array[startingIndex++];
                this.params.end[2] = array[startingIndex++];
                this.params.radiusStart = array[startingIndex++];
                this.params.radiusEnd = array[startingIndex++];
                this.params.resolution = array[startingIndex++];
                packedLength += 9;
                break;
            case CSG_SHAPE.RoundedCylinder:
                this.params.start = [];
                this.params.start[0] = array[startingIndex++];
                this.params.start[1] = array[startingIndex++];
                this.params.start[2] = array[startingIndex++];
                this.params.end = [];
                this.params.end[0] = array[startingIndex++];
                this.params.end[1] = array[startingIndex++];
                this.params.end[2] = array[startingIndex++];
                this.params.radius = array[startingIndex++];
                this.params.resolution = array[startingIndex++];
                packedLength += 8;
                break;
            case CSG_SHAPE.RoundedCube:
                this.params.center = [];
                this.params.center[0] = array[startingIndex++];
                this.params.center[1] = array[startingIndex++];
                this.params.center[2] = array[startingIndex++];
                this.params.radius = array[startingIndex++];
                this.params.roundradius = array[startingIndex++];
                this.params.resolution = array[startingIndex++];
                packedLength += 6;
                break;
        }

        this.operats = new Array(array[startingIndex++]);
        packedLength++;

        for (let i = 0; i < this.operats.length; ++i) {
            const operate = new CSGOperate();
            const itemPackedLength = operate.unpack(array, startingIndex);
            this.operats[i] = operate;
            startingIndex += itemPackedLength;
            packedLength += itemPackedLength;
        }

        return packedLength;
    }
}
