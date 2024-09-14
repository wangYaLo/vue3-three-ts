import * as THREE from "three";
import {PerspectiveCamera, WebGLRenderer} from "three";

interface Options {
    elem: string
}
let canvas: HTMLElement;
let renderer: THREE.WebGLRenderer;
let camera: PerspectiveCamera;
let scene: THREE.Scene;
let objects: any[];

class Create3D {
    public elem: string

    constructor(options: Options) {
        let { elem } = options;
        this.elem = elem;
        /**
         * 获取canvas dom
         */
        canvas = document.getElementById(this.elem) as HTMLElement
        /**
         * 初始化渲染器
         */
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvas
        })
        /**
         * 创建一个摄像机
         */
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
        camera.position.z = 50;
        /**
         * 创建一个场景
         */
        scene = new THREE.Scene()
        /**
         * 创建一个可以访问所有网格的容器
         */
        objects = []

    }

    getObject() {
        return {
            canvas,
            renderer,
            scene,
            objects,
            camera
        }
    }

    /**
     * 添加太阳光照
     */
    addLight() {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        // const light = new THREE.PointLight(color, intensity);
        light.position.set(10, 10, 10);
        scene.add(light);
    }

    /**
     * 创建一个随机的MeshPhongMaterial材质
     */
    createMaterial() {
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
        });

        const hue = Math.random();
        const saturation = 1;
        const luminance = .5;
        material.color.setHSL(hue, saturation, luminance);

        return material;
    }

    createMesh(callback: Function) {
        callback(this)
    }

    /**
     * 渲染的时候需要执行的回调函数
     */
    callback() {
        objects.forEach(object => {
            object.rotation.y += 0.01;
            object.rotation.x += 0.01;
        })
    }



    /**
     * 响应式变化 像素 大小 宽高比
     * @param renderer
     */
    resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    /**
     * 渲染动画
     */
    animate() {
        if (this.resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        this.callback()
        renderer.render(scene, camera)
        requestAnimationFrame( this.animate );
    }


}

export default Create3D;