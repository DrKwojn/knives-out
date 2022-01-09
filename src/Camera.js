import { mat4, vec3 } from "../lib/gl-matrix-module.js";

export class Camera {
    constructor(position) {
        this.fov = 1.5;
        this.aspect = 1;
        this.near = 0.01;
        this.far = 10000;

        this.projection = mat4.create();
        this.calculateProjection();

        this.position = position || vec3.create();
        this.up = vec3.set(vec3.create(), 0.0, 1.0, 0.0);
        this.right = vec3.create();
        this.forward = vec3.create();
    }

    calculateProjection() {
        this.projection = mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    calculateAspectRatio(width, height) {
        this.aspect = width / height;
        this.calculateProjection();
    }

    getMatrix() {
        const view = mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.forward), this.up);
        const matrix = mat4.multiply(mat4.create(), this.projection, view);
        return matrix;
    }

    getView() {
        const view = mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.forward), this.up);
        return view;
    }
}