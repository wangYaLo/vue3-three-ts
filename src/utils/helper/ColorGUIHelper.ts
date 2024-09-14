/**
 * 添加一个lil-gui控制灯光
 */
class ColorGUIHelper {
    private object: any;
    private prop: any;
    constructor(object: any, prop: any) {
        this.object = object;
        this.prop = prop
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

export default ColorGUIHelper