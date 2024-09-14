
class MinMaxGUIHelper {
    private obj: any;
    private minProp: any;
    private maxProp: any;
    private minDif: any;
    constructor(obj: any, minProp: any, maxProp: any, minDif: any) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;  // 这将调用min的setter
    }
}


export default MinMaxGUIHelper