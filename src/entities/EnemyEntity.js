import { vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { AssetManager } from "../AssetManager.js";
import { Model } from "../Model.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class EnemyEntity extends PhysicsEntity {
    constructor(position) {
        super(['Enemy'], null, new AABB([0, 1, 0], [2, 2, 2]));

        this.position = position;
        //this.scale = vec3.fromValues(0.025, 0.025, 0.025);

        this.life = 100;
    }

    async init(scene) {
        this.model = await Model.load(scene.game.gl, scene.game.programs.phong, '../res/models/figurehead/scene.gltf');

        this.deadSound = await AssetManager.getAudio("../res/sound/Coin_Flip_Free_Sound_Effect.wav");
        this.deadSound.volume = 0.2;
    }

    update(delta) {
        if(this.life <= 0) {
            this.alive = false;
            this.deadSound.play();
        }
    }
}