import { vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { Model } from "../Model.js";
import { EnemyEntity } from "./EnemyEntity.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class KnifeEntity extends PhysicsEntity {
    constructor(position, forward) {
        super(['Knife'], null, new AABB([0, 0, 0], [0.125, 0.125, 0.125]));

        this.scale = vec3.fromValues(0.0025, 0.0025, 0.0025);

        this.lifetime = 5.0;
        this.speed = 10.0;
        this.ignoreGroups = ['Player', 'Knife'];

        this.position = position;
        this.velocity = vec3.scale(vec3.create(), forward, this.speed);
    }

    async init(scene) {
        this.model = await Model.load(scene.game.gl, scene.game.programs.simple, '../res/models/Fox/Fox.gltf', 'fox');
    }

    update(delta) {
        this.lifetime -= delta;
        if(this.lifetime <= 0.0) {
            this.alive = false;
        }
    }

    collided(entity) {
        if(entity instanceof EnemyEntity) {
            entity.life -= 20;
            this.alive = false;
        }
    }
}