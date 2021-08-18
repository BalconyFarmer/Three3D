import {CSGVector2D} from "./CSGVector2D";
import {CSGVector3D} from "./CSGVector3D";
import {Nullable} from "../types";

/**
 * CSGVector3DIntersect
 * @category
 */

export interface InterfaceCSGVector3D {
    x: Nullable<number | number[] | CSGVector2D | CSGVector3D | any>;
    y: Nullable<number | number[] | CSGVector2D | any>;
    z: Nullable<number | number[] | CSGVector2D | any>;
}

/**
 * InterfaceCSG接口
 */
export interface InterfaceCSGVector2D {
    x: Nullable<number | number[] | CSGVector2D | any>;
    y: Nullable<number | CSGVector2D | number[]>;
}
