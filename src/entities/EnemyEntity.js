import { vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { Model } from "../Model.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class EnemyEntity extends PhysicsEntity {
    constructor(position) {
        super(['Enemy'], null, new AABB([0, 1, 0], [2, 2, 2]));

        this.position = position;
        this.scale = vec3.fromValues(0.025, 0.025, 0.025);

        this.life = 100;
        this.dead_sound = new Audio("../res/sound/Coin Flip _ Free Sound Effect.wav");
    }

    async init(scene) {
        this.model = await Model.load(scene.game.gl, scene.game.programs.simple, '../res/models/Fox/Fox.gltf', 'fox');
        console.log(this.model);
    }

    update(delta) {
        if(this.life <= 0) {
            console.log('dead');
            this.alive = false;
            this.dead_sound.play();
        }
    }
}