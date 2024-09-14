import * as THREE from 'three'
import {Raycaster, Texture, WebGLRenderTarget} from "three";


class GPUPickHelper {
    private pickedObjectSavedColor: number;
    private pickedObject: any;
    private pickingTexture: WebGLRenderTarget<Texture>;
    private pixelBuffer: Uint8Array
    private pickPosition: { x: number; y: number }
    constructor() {
        //创建一个1px的渲染目标
        this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
        this.pixelBuffer = new Uint8Array(4);
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
        this.pickPosition = {
            x: 0,
            y: 0
        }

    }
    pick(scene, camera, time, renderer, idToObject) {
        const {pickingTexture, pixelBuffer} = this;
        if (this.pickedObject) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            this.pickedObject = undefined;
        }
        const pixelRatio = renderer.getPixelRatio();
        camera.setViewOffset(
            renderer.getContext().drawingBufferWidth,   // 全宽
            renderer.getContext().drawingBufferHeight,  // 全高
            this.pickPosition.x * pixelRatio | 0,             // rect x
            this.pickPosition.y * pixelRatio | 0,             // rect y
            1,                                          // rect width
            1,                                          // rect height
        );
        // 渲染场景
        renderer.setRenderTarget(pickingTexture)
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);

        // 清理视野偏移，回归正常
        camera.clearViewOffset();
        // 读取像素
        renderer.readRenderTargetPixels(
            pickingTexture,
            0,   // x
            0,   // y
            1,   // width
            1,   // height
            pixelBuffer);
        // const id =
        //     (pixelBuffer[0] << 16) |
        //     (pixelBuffer[1] <<  8) |
        //     (pixelBuffer[2]);
        const id =
            ( pixelBuffer[ 0 ] << 16 ) |
            ( pixelBuffer[ 1 ] << 8 ) |
            ( pixelBuffer[ 2 ] << 0 );
        return id
        // const intersectedObject = idToObject[id];
        // if (intersectedObject) {
        //     //获取第一个对象，他是离鼠标最近的一个
        //     this.pickedObject = intersectedObject;
        //     //保存他的颜色
        //     this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        //     //
        //     this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
        // }
    }

    pickSelect(cssPosition, scene, camera, renderer) {
        const {pickingTexture, pixelBuffer} = this;

        // 将视图偏移设置为仅表示鼠标下单个元素
        const pixelRatio = renderer.getPixelRatio();
        camera.setViewOffset(
            renderer.getContext().drawingBufferWidth,   // full width
            renderer.getContext().drawingBufferHeight,  // full top
            cssPosition.x * pixelRatio | 0,             // rect x
            cssPosition.y * pixelRatio | 0,             // rect y
            1,                                          // rect width
            1,                                          // rect height
        );
        // 渲染场景
        renderer.setRenderTarget(pickingTexture);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        // 清除视图偏移，使渲染恢复正常
        camera.clearViewOffset();
        // 读取像素
        renderer.readRenderTargetPixels(
            pickingTexture,
            0,   // x
            0,   // y
            1,   // width
            1,   // height
            pixelBuffer);

        const id =
            ( pixelBuffer[ 0 ] << 0 ) |
            ( pixelBuffer[ 1 ] << 8 ) |
            ( pixelBuffer[ 2 ] << 16 );

        return id;
    }

    clearPickPosition() {
        // 对于触屏，不像鼠标总是能有一个位置坐标，
        // 如果用户不在触摸屏幕，我们希望停止拾取操作。
        // 因此，我们选取一个特别的值，表明什么都没选中
        console.log(this.pickPosition)
        this.pickPosition.x = -100000;
        this.pickPosition.y = -100000;
    }

    setPickPosition(event, canvas) {
        const pos = this.getCanvasRelativePosition(event, canvas);
        // pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
        // pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
        this.pickPosition.x = pos.x;
        this.pickPosition.y = pos.y;
    }

    getCanvasRelativePosition(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width  / rect.width,
            y: (event.clientY - rect.top ) * canvas.height / rect.height,
        };
    }

    static rand(min: number, max?: number) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + (max - min) * Math.random();
    }

    /**
     * 随机生成一个颜色
     */
    static randomColor() {
        return `hsl(${this.rand(360) | 0}, ${this.rand(50, 100) | 0}%, 50%)`;
    }
}

export default GPUPickHelper