import { vec3 } from "../lib/gl-matrix-module.js";
import { AABB } from "./AABB.js";
import { PhysicsDebugRenderer } from "./PhysicsDebugRenderer.js";
import { Entity } from "./entities/Entity.js";
import { FreelookEntity } from "./entities/FreelookEntity.js";
import { PlayerEntity } from "./entities/PlayerEntity.js";
import { Model } from "./Model.js";
import { Physics } from "./Physics.js";
import { Renderer } from "./Renderer.js";
import { LightEntity } from "./entities/LightEntity.js";
import { EnemyEntity } from "./entities/EnemyEntity.js";
import { MapEntity } from "./entities/MapEntity.js";
import { MazeBuilder } from "./MazeBuilder.js";

export class Scene {
    constructor(game) {
        this.game = game;

        this.entities = [];
        this.newEntities = [];

        this.enemyCount = 4;

        this.debugDraw = false;
    }

    async init(gridSize) {
        this.entities = [];
        this.newEntities = [];

        this.physics = new Physics(this);

        console.log(this.game.programs);
        this.renderer = new Renderer(this.game.gl, this.game.programs);

        this.lightEntity = new LightEntity();
        this.addEntity(this.lightEntity);
        
        this.freelookCameraEntity = new FreelookEntity();
        this.freelookCameraEntity.enabled = false;
        this.addEntity(this.freelookCameraEntity);

        const mazeSize = gridSize;
        const maze = new MazeBuilder(Math.floor(mazeSize/2), Math.floor(mazeSize/2));
        const mapGrid = maze.maze.flat();

        this.addEntity(new MapEntity(mapGrid, mazeSize));
        
        let enemyEntity;
        let x, y;
        this.enemyCount = 4;
        let enemyPos = [];
        for (let i = 0; i < this.enemyCount; i++) {
            [x, y] = [0, 0];
            while (mapGrid[y * mazeSize + x] === 1) {
                x = Math.floor(Math.random() * mazeSize);
                y = Math.floor(Math.random() * mazeSize);
            }
            enemyPos.push(y * mazeSize + x);
            enemyEntity = new EnemyEntity(x * 4 - mazeSize * 2, y * 4 - mazeSize * 2);
            this.addEntity(enemyEntity);

            const lightEntity = new LightEntity();
            lightEntity.position = vec3.fromValues(x * 4 - mazeSize * 2, 6, y * 4 - mazeSize * 2);
            this.addEntity(lightEntity);
            this.renderer.lights.push(lightEntity);
        }

        this.playerCameraEntity = new PlayerEntity();
        [x, y] = [0, 0];
        while (mapGrid[y * mazeSize + x] === 1 || enemyPos.includes(y * mazeSize + x)) {
            x = Math.floor(Math.random() * mazeSize);
            y = Math.floor(Math.random() * mazeSize);
        }
        this.playerCameraEntity.position = vec3.fromValues(x * 4 - mazeSize * 2, 1, y * 4 - mazeSize * 2)
        this.addEntity(this.playerCameraEntity);

        this.cameraEntity = this.playerCameraEntity
        this.renderer.camera = this.cameraEntity.camera;

        this.physicsRenderer = new PhysicsDebugRenderer(this.game.gl, this.game.programs);
        this.physicsRenderer.camera = this.cameraEntity.camera;

        this.game.forceResize();
    }

    async update(delta) {
        this.physics.update(delta);

        for(const entity of this.entities) {
            if(entity.enabled) {
                entity.update(delta);
            }
        }

        //NOTE: Remove entities if they have alive set to false
        this.entities = this.entities.filter(entity => entity.alive === true);

        for(const entity of this.newEntities) {
            await entity.init(this);
        }

        this.entities = this.entities.concat(this.newEntities);
        this.newEntities = [];

        if(this.game.keysPressed['KeyK']) {
            this.toggleCamera();
        }

        if(this.game.keysPressed['KeyP']) {
            this.debugDraw = !this.debugDraw;
        }
    }

    render() {
        this.renderer.render();
        for(const entity of this.entities) {
            if(entity.enabled) {
                entity.render(this.renderer);
            }
        }

        if(this.debugDraw) {
            for(const entity of this.entities) {
                if(entity.enabled && entity.aabb) {
                    this.physicsRenderer.addAABB(entity.position, entity.aabb, [1.0, 0.0, 0.0, 1.0]);
                }
            }
    
            this.physicsRenderer.render();
        }
    }

    mousemove(e) {
        for(const entity of this.entities) {
            entity.mousemove(e);
        };
    }

    addEntity(entity) {
        this.newEntities.push(entity);
        entity.scene = this;
    }

    resize(width, height) {
        this.cameraEntity.camera.calculateAspectRatio(width, height);
    }

    toggleCamera() {
        if(this.cameraEntity.enabled) {
            this.freelookCameraEntity.enabled = !this.freelookCameraEntity.enabled;
            this.playerCameraEntity.enabled = !this.playerCameraEntity.enabled;

            if(this.freelookCameraEntity.enabled) {
                this.cameraEntity = this.freelookCameraEntity;
            } 

            if(this.playerCameraEntity.enabled) {
                this.cameraEntity = this.playerCameraEntity;
                
            }
            this.renderer.camera = this.cameraEntity.camera;
            this.physicsRenderer.camera = this.cameraEntity.camera;
            this.game.forceResize();
        }
    }

    focusGained() {
        this.cameraEntity.enabled = true;
    }

    focusLost() {
        this.cameraEntity.enabled = false;
    }
}