import { vec3 } from "../lib/gl-matrix-module.js";
import { AABB } from "./AABB.js";
import { PhysicsDebugRenderer } from "./PhysicsDebugRenderer.js";
import { Entity } from "./entities/Entity.js";
import { FreelookEntity } from "./entities/FreelookEntity.js";
import { PlayerEntity } from "./entities/PlayerEntity.js";
import { Model } from "./Model.js";
import { Physics } from "./Physics.js";
import { Renderer } from "./Renderer.js";

export class Scene {
    constructor(game) {
        this.game = game;
        this.entities = [];
    }

    async init() {
        this.physics = new Physics(this);

        this.renderer = new Renderer(this.game.gl, this.game.programs);
        
        //this.cameraEntity = new FreelookEntity();
        this.cameraEntity = new PlayerEntity();
        this.entities.push(this.cameraEntity);
        this.renderer.camera = this.cameraEntity.camera;

        this.physicsRenderer = new PhysicsDebugRenderer(this.game.gl, this.game.programs);
        this.physicsRenderer.camera = this.cameraEntity.camera;

        //Load some test stuff for now
        const hightmapModel = Model.heightmap(this.renderer.gl, this.renderer.programs.simple, 32, 32);
        this.entities.push(new Entity(hightmapModel, null));
        
        const foxModel = await Model.load(this.renderer.gl, this.renderer.programs.simple, '../res/models/Fox/Fox.gltf', 'fox');
        const enemyEntity = new Entity(foxModel, new AABB([0, 1, 0], [2, 2, 2]));
        enemyEntity.position = vec3.fromValues(5, 0, 5);
        enemyEntity.scale = vec3.fromValues(0.025, 0.025, 0.025);
        this.entities.push(enemyEntity);

        for(const entity of this.entities) {
            await entity.init(this);
        }
    }

    update(delta) {
        this.physics.update(delta);

        for(const entity of this.entities) {
            entity.update(delta);
        }

        //NOTE: Remove entities if they have alive set to false
        this.entities.filter(entity => entity.alive);
    }

    render() {
        this.renderer.render();
        for(const entity of this.entities) {
            entity.render(this.renderer);
        }

        for(const entity of this.entities) {
            if(entity.aabb) {
                this.physicsRenderer.addAABB(entity.position, entity.aabb, [1.0, 0.0, 0.0, 1.0]);
            }
        }

        this.physicsRenderer.render();
    }

    resize(width, height) {
        this.cameraEntity.camera.calculateAspectRatio(width, height);
    }

    focusGained() {
        this.cameraEntity.enable();
    }

    focusLost() {
        this.cameraEntity.disable();
    }
}