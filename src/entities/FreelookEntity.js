import { vec3 } from "../../lib/gl-matrix-module.js";
import { Camera } from "../Camera.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class FreelookEntity extends PhysicsEntity {
    constructor() {
        super(['Camera'], null, null);

        this.camera = new Camera();

        this.yaw   = 0.0;
        this.pitch = 0.0;

        this.speed = 10.0;

        this.mouseSensitivity = 0.002;

        // this.mousemoveHandler = this.mousemoveHandler.bind(this);
        // this.keydownHandler = this.keydownHandler.bind(this);
        // this.keyupHandler = this.keyupHandler.bind(this);
        // this.keys = {};
    }

    async init(scene) {

    }

    update(delta) {
        const keys = this.scene.game.keys;

        if (keys['KeyW']) {
            vec3.scaleAndAdd(this.camera.position, this.camera.position, this.camera.forward, delta * this.speed);
        }
        if (keys['KeyS']) {
            vec3.scaleAndAdd(this.camera.position, this.camera.position, vec3.negate(vec3.create(), this.camera.forward), delta * this.speed);
        }
        if (keys['KeyD']) {
            vec3.scaleAndAdd(this.camera.position, this.camera.position, this.camera.right, delta * this.speed);
        }
        if (keys['KeyA']) {
            vec3.scaleAndAdd(this.camera.position, this.camera.position, vec3.negate(vec3.create(), this.camera.right), delta * this.speed);
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

        const targetX = -Math.sin(this.yaw) * Math.cos(this.pitch);
        const targetY =  Math.sin(this.pitch);
        const targetZ = -Math.cos(this.yaw) * Math.cos(this.pitch);
        this.camera.forward = vec3.set(vec3.create(), targetX, targetY, targetZ);
        this.camera.right = vec3.cross(this.camera.right, this.camera.forward, this.camera.up);
    }
}