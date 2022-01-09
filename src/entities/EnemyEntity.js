import {quat, vec3} from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { AssetManager } from "../AssetManager.js";
import { Model } from "../Model.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class EnemyEntity extends PhysicsEntity {
    constructor(x, y) {
        super(['Enemy'], null, new AABB([0, 0, 0], [2.5, 2.5, 2.5]));

        this.position = vec3.fromValues(x, 2, y);
        this.scale = vec3.fromValues(0.1, 0.1, 0.1);
        //this.rotation = quat.fromValues(-0.7, 0, 0, 0.75);

        this.movable = false;

        this.life = 100;
    }

    async init(scene) {
        this.model = await Model.load(scene.game.gl, scene.game.programs.phong, '../res/models/corona/corona.gltf');

        this.deadSound = await AssetManager.getAudio("../res/sound/Coin_Flip_Free_Sound_Effect.wav");
        this.deadSound.volume = 0.2;
    }

    update(delta) {
        if(this.life <= 0) {
            this.alive = false;
            this.scene.enemyCount--;
            console.log(this.scene.enemyCount);
            this.scene.game.score++;
            this.deadSound.play();
        }

        quat.rotateY(this.rotation, this.rotation, delta);
    }
}