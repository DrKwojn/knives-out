import { quat, vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { AssetManager } from "../AssetManager.js";
import { ModelCamera } from "../ModelCamera.js";
import { KnifeEntity } from "./KnifeEntity.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class PlayerEntity extends PhysicsEntity {
    constructor() {
        super(['Camera', 'Player'], null, new AABB([0,1,0], [0.5, 2, 0.5]));

        this.camera = new ModelCamera(vec3.fromValues(0, 1.8, 0));

        this.yaw   = 0.0;
        this.pitch = 0.0;

        this.mouseSensitivity = 0.002;

        // this.mousemoveHandler = this.mousemoveHandler.bind(this);
        // this.mouseclickHandler = this.mouseclickHandler.bind(this);
        // this.keydownHandler = this.keydownHandler.bind(this);
        // this.keyupHandler = this.keyupHandler.bind(this);
        // this.keys = {};
        // this.mouseClicked = [false, false, false, false, false];

        this.walkSpeed = 2.0;
        this.runSpeed = 5.0;
    }

    async init(scene) {
        this.audio = await AssetManager.getAudio("../res/sound/MINECRAFT Walking On Stone Sound Effect.wav");
        this.audio.volume = 0.2;
    }

    update(delta) {
        const forward = vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, -1), this.rotation);
        const right = vec3.transformQuat(vec3.create(), vec3.fromValues(1, 0, 0), this.rotation);

        const keys = this.scene.game.keys;
        if(keys.length > 0) {
            console.log(keys);
        }

        if(keys['ShiftLeft']) {
            vec3.scale(forward, forward, this.runSpeed);
            vec3.scale(right, right, this.runSpeed);
        } else {
            vec3.scale(forward, forward, this.walkSpeed);
            vec3.scale(right, right, this.walkSpeed);
        }

        this.velocity = vec3.create();
        if (keys['KeyW']) {
            vec3.add(this.velocity, this.velocity, forward);
        }

        if (keys['KeyS']) {
            vec3.sub(this.velocity, this.velocity, forward);
        }

        if (keys['KeyD']) {
            vec3.add(this.velocity, this.velocity, right);
        }

        if (keys['KeyA']) {
            vec3.sub(this.velocity, this.velocity, right);
        }

        if (keys['KeyA'] || keys['KeyD'] || keys['KeyS'] || keys['KeyW']){
            this.audio.play();
        }
        else {
            this.audio.pause();
        }

        this.camera.position = vec3.clone(this.position);
        vec3.add(this.camera.position, this.camera.position, vec3.fromValues(0, 1.8, 0));

        //Shoot
        if(this.scene.game.mouseClicked[0]) {
            const knife = new KnifeEntity(vec3.add(vec3.create(), this.camera.position, this.camera.forward), this.camera.forward);
            this.scene.addEntity(knife);
        }
    }

    mousemove(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.mouseSensitivity;
        this.yaw -= dx * this.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (this.pitch > halfpi) {
            this.pitch = halfpi;
        }
        if (this.pitch < -halfpi) {
            this.pitch = -halfpi;
        }

        this.yaw = ((this.yaw % twopi) + twopi) % twopi;

        quat.setAxisAngle(this.rotation, vec3.fromValues(0, 1, 0), this.yaw);

        const targetX = -Math.sin(this.yaw) * Math.cos(this.pitch);
        const targetY =  Math.sin(this.pitch);
        const targetZ = -Math.cos(this.yaw) * Math.cos(this.pitch);
        this.camera.forward = vec3.set(vec3.create(), targetX, targetY, targetZ);
        this.camera.right = vec3.cross(this.camera.right, this.camera.forward, this.camera.up);
    }
}