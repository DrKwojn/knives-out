import { vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { AssetManager } from "../AssetManager.js";
import { Model } from "../Model.js";
import { EnemyEntity } from "./EnemyEntity.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class KnifeEntity extends PhysicsEntity {
    constructor(position, forward) {
        super(['Knife'], null, new AABB([0, 0, 0], [0.125, 0.125, 0.125]));

        this.scale = vec3.fromValues(0.025, 0.025, 0.025);

        this.lifetime = 10.0;
        this.speed = 3.0;
        this.ignoreGroups = ['Player', 'Knife'];

        this.position = position;
        this.velocity = vec3.scale(vec3.create(), forward, this.speed);
    }

    async init(scene) {
        this.model = await Model.load(scene.game.gl, scene.game.programs.phong, '../res/models/knife/machete+kuk-ri.gltf', 0);

        this.throwSound = await AssetManager.getAudio("../res/sound/knife_throw2.wav");
        this.hitSound = await AssetManager.getAudio("../res/sound/knife_hit.wav");
    }

    update(delta) {
        this.lifetime -= delta;
        if(this.lifetime <= 0.0) {
            this.alive = false;
        }

        this.throwSound.play();
    }

    collided(entity) {
        this.hitSound.play();
        if(entity instanceof EnemyEntity) {
            entity.life -= 20;
        }

        this.alive = false;
    }
}