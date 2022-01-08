import { vec3 } from "../lib/gl-matrix-module.js";
import { AABB } from "./AABB.js";
import { PhysicsDebugRenderer } from "./PhysicsDebugRenderer.js";
import { Entity } from "./entities/Entity.js";
import { FreelookEntity } from "./entities/FreelookEntity.js";
import { PlayerEntity } from "./entities/PlayerEntity.js";
import { Model } from "./Model.js";
import { Physics } from "./Physics.js";
import { Renderer } from "./Renderer.js";
import { EnemyEntity } from "./entities/EnemyEntity.js";
import { LightEntity } from "./entities/LightEntity.js";

export class Scene {
    constructor(game) {
        this.game = game;
        this.entities = [];
        this.newEntities = [];
    }

    async init() {
        this.physics = new Physics(this);

        this.renderer = new Renderer(this.game.gl, this.game.programs);

        this.lightEntity = new LightEntity();
        this.addEntity(this.lightEntity);
        
        //this.cameraEntity = new FreelookEntity();
        this.cameraEntity = new PlayerEntity();
        this.addEntity(this.cameraEntity);
        this.renderer.camera = this.cameraEntity.camera;

        this.physicsRenderer = new PhysicsDebugRenderer(this.game.gl, this.game.programs);
        this.physicsRenderer.camera = this.cameraEntity.camera;

        //Load some test stuff for now
        const hightmapModel = Model.heightmap(this.renderer.gl, this.renderer.programs.simple, 32, 32);
        this.addEntity(new Entity(['Floor'], hightmapModel, null));
        
        const enemyEntity = new EnemyEntity(vec3.fromValues(5, 0, -5));
        this.addEntity(enemyEntity);
    }

    async update(delta) {
        this.physics.update(delta);

        for(const entity of this.entities) {
            entity.update(delta);
        }

        //NOTE: Remove entities if they have alive set to false
        this.entities = this.entities.filter(entity => entity.alive === true);

        for(const entity of this.newEntities) {
            await entity.init(this);
        }

        this.entities = this.entities.concat(this.newEntities);
        this.newEntities = [];
    }

    render() {
        this.renderer.render(this.lightEntity);
        for(const entity of this.entities) {
            entity.render(this.renderer);
        }

        for(const entity of this.entities) {
            if (entity.aabb) {
                this.physicsRenderer.addAABB(entity.position, entity.aabb, [1.0, 0.0, 0.0, 1.0]);
            }
        }

        this.physicsRenderer.render();
    }

    addEntity(entity) {
        this.newEntities.push(entity);
        entity.scene = this;
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