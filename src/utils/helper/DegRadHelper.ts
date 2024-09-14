import * as THREE from 'three'

/**
 * 创建一个以度数为单位的操作对象
 */
class DegRadHelper {
    private obj: any;
    private prop: any;
    constructor(obj: any, prop: any) {
        this.obj = obj;
        this.prop = prop;
    }
    get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
}

export default DegRadHelper