/**
 * 调整光源得GUI类
 */
class DimensionGUIHelper {
    private minProp: any;
    private obj: any;
    private maxProp: any;
    constructor(obj, minProp, maxProp) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
    }
    get value() {
        return this.obj[this.maxProp] * 2;
    }
    set value(v) {
        this.obj[this.maxProp] = v / 2;
        this.obj[this.minProp] = v / -2;
    }
}

export default DimensionGUIHelper