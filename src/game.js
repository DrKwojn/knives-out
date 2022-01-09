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

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.mouseclickHandler = this.mouseclickHandler.bind(this);
        this.keypressHandler = this.keypressHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        this.keysPrev = {};
        this.keysPressed = {};
        this.mouseClicked = [false, false, false, false, false];

        this.running = true;

        this.score = 0;
        this.gameTime = 2 * 2;
        this.gridSize = 11;

        this.init().then(() => {
            requestAnimationFrame(this._update);
        });
    }

    async init() {
        const gl = this.gl;

        this.programs = WebGL.buildPrograms(gl, shaders);
        console.log(this.programs);

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.time = Date.now();
        this.startTime = this.time;

        this.scene = new Scene(this);
        await this.scene.init(this.gridSize);

        // HUD
        scoreboard[2].innerHTML = this.score;
        this.displayTimeLeft(this.gameTime * 1000);
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('click', this.mouseclickHandler);
        document.addEventListener('keypress', this.keypressHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('click', this.mouseclickHandler);
        document.removeEventListener('keypress', this.keypressHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }

        for (let key in this.keys) {
            this.keysPressed[key] = false;
        }

        for (let button in this.mouseClicked) {
            this.mouseClicked[button] = false;
        }
    }

    mousemoveHandler(e) {
        this.scene.mousemove(e);
    }

    mouseclickHandler(e) {
        this.mouseClicked[e.button] = true;
    }
    
    keypressHandler(e) {
        this.keysPressed[e.code] = true;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (document.pointerLockElement === this.canvas) {
            this.enable();
            this.scene.focusGained();
        } else {
            this.disable();
            this.scene.focusLost();
        }
    }

    async update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        await this.scene.update(dt);

        if(this.scene.enemyCount <= 0) {
            this.gridSize += 2;
            await this.scene.init(this.gridSize);
        }

        scoreboard[2].innerHTML = this.score;
        this.gameTime -= dt;
        this.displayTimeLeft(this.gameTime * 1000);

        if(this.gameTime < 0) {
            this.running = false;
            this.displayGameOver();
        }
        
        for (let key in this.keys) {
            this.keysPressed[key] = false;
        }

        this.mouseClicked = [false, false, false, false, false];
    }

    render() {
        this.scene.render(this.renderer);
    }

    resize(width, height) {
        this.scene.resize(width, height);
    }

    _update() {
        if(!this.running) {
            return;
        }

        this._resize();
        this.update().then(() => {
            this.render();
            requestAnimationFrame(this._update);
        });
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

    forceResize() {
        this._resize();
    }

    displayTimeLeft(milliseconds) {
        scoreboard[1].innerHTML = new Date(milliseconds).toISOString().slice(14,19);
    }

    displayGameOver() {
        document.getElementsByClassName('gameover')[0].style.display = "block";
    }
}

const scoreboard = document.getElementsByTagName('label');

document.getElementById('startBtn').addEventListener("click", function() {
    document.getElementsByClassName('mainmenu')[0].style.display = "none";
    document.getElementsByClassName('scoreboard')[0].style.visibility = "visible";

    const canvas = document.querySelector('canvas');
    const app = new Application(canvas);
    app.enableCamera();
});

document.getElementById('playAgainBtn').addEventListener('click', function() {
    // reset game
    document.getElementsByClassName('mainmenu')[0].style.display = "none";
    document.getElementsByClassName('scoreboard')[0].style.visibility = "visible";

    const canvas = document.querySelector('canvas');
    const app = new Application(canvas);
    app.enableCamera();
});