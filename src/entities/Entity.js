import { mat4, quat, vec3 } from "../../lib/gl-matrix-module.js";

export class Entity {
    constructor(groups, model, aabb) {
        this.alive = true;

        this.scene = null;

        this.position = vec3.create();
        this.rotation = quat.create();
        this.scale = vec3.fromValues(1.0, 1.0, 1.0);

        this.groups = groups;
        this.ignoreGroups = [];

        this.model = model;

        this.aabb = aabb;
    }

    async init(scene) {

    }

    update(delta) {

    }

    render(renderer) {
        if (this.model) {
            renderer.renderModel(this.getMatrix(), this.model);
        }
    }

    collided(entity) {
        
    }

    getMatrix() {
        return mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.position, this.scale);
    }
}