import { vec3 } from "../../lib/gl-matrix-module.js";
import { Entity } from "./Entity.js";

//TODO: Most of physics code should be moved here to reduce code duplication
export class PhysicsEntity extends Entity {
    constructor(model, aabb) {
        super(model, aabb);

        this.velocity = vec3.create();
    }

    async init(scene) {

    }

    update(delta) {

    }

    render(renderer) {

    }
}