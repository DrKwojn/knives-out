import { GUI } from '../../lib/dat.gui.module.js';
import { Scene } from './Scene.js';
import { shaders } from './shaders.js';
import { WebGL } from './WebGL.js';

class Application {
    constructor(canvas, glOptions) {
        this._update = this._update.bind(this);

        this.canvas = canvas;
        
        this.gl = null;
        try {
            this.gl = this.canvas.getContext('webgl2', glOptions);
        } catch (error) {
        }

        if (!this.gl) {
            console.log('Cannot create WebGL 2.0 context');
        }

        this.init().then(() => {
            requestAnimationFrame(this._update);
        });        
    }

    async init() {
        const gl = this.gl;

        this.programs = WebGL.buildPrograms(gl, shaders);

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.time = Date.now();
        this.startTime = this.time;

        this.scene = new Scene(this);
        await this.scene.init();
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (document.pointerLockElement === this.canvas) {
            this.scene.focusGained();
        } else {
            this.scene.focusLost();
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        this.scene.update(dt);
    }

    render() {
        this.scene.render(this.renderer);
    }

    resize(width, height) {
        this.scene.resize(width, height);
    }

    _update() {
        this._resize();
        this.update();
        this.render();
        requestAnimationFrame(this._update);
    }

    _resize() {
        const canvas = this.canvas;
        const gl = this.gl;

        if (canvas.width !== canvas.clientWidth ||
            canvas.height !== canvas.clientHeight)
        {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            this.resize(canvas.clientWidth, canvas.clientHeight);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new Application(canvas);
    const gui = new GUI();
    gui.add(app, 'enableCamera');
});
