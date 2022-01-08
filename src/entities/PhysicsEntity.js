import { vec3 } from "../../lib/gl-matrix-module.js";
import { Entity } from "./Entity.js";

export class PhysicsEntity extends Entity {
    constructor(groups, model, aabb) {
        super(groups, model, aabb);

        this.movable = true;
        this.velocity = vec3.create();
    }
}