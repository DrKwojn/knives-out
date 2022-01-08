import { vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { Model } from "../Model.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class EnemyEntity extends PhysicsEntity {
    constructor(position) {
        super(['Enemy'], null, new AABB([0, 1, 0], [2, 2, 2]));

        this.position = position;
        this.scale = vec3.fromValues(-1, -1, 1);

        this.life = 100;
    }

    async init(scene) {
        this.model = await Model.load(scene.game.gl, scene.game.programs.phong, '../res/models/sculp/scene.gltf', 3);
    }

    update(delta) {
        if(this.life <= 0) {
            this.alive = false;
        }
    }
}