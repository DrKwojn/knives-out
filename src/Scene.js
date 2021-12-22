import { CubeEntity } from "./entities/CubeEntity.js";
import { FreelookEntity } from "./entities/FreelookEntity.js";
import { StaticEntity } from "./entities/StaticEntity.js";
import { Model } from "./Model.js";
import { Renderer } from "./Renderer.js";

export class Scene {
    constructor(game) {
        this.game = game;
        this.entities = [];
    }

    async init() {
        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const overlappingPairCache = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physics = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.physics.setGravity(new Ammo.btVector3(0, -10, 0));

        this.renderer = new Renderer(this.game.gl, this.game.programs);

        //Load some test stuff for now
        const boxShape = new Ammo.btBoxShape(Ammo.btVector3(1, 1, 1));
        const model = await Model.load(this.renderer.gl, this.renderer.programs.simple, '../res/models/Fox/Fox.gltf', 'fox');
        this.entities.push(new StaticEntity(Ammo.btVector3(), Ammo.btQuaternion(), boxShape, model));

        this.entities.push(new CubeEntity(new Ammo.btVector3(0, 200, 0), new Ammo.btQuaternion()));
        
        const planeShape = new Ammo.btStaticPlaneShape(new Ammo.btVector3(0, 0, 0), 0);
        this.entities.push(new StaticEntity(new Ammo.btVector3(), new Ammo.btQuaternion(), planeShape, Model.heightmap(this.renderer.gl, this.renderer.programs.simple, 200, 200)));

        this.cameraEntity = new FreelookEntity();
        this.entities.push(this.cameraEntity);
        this.renderer.camera = this.cameraEntity.camera;

        for(const entity of this.entities) {
            await entity.init(this);
        }
    }

    update(delta) {
        this.physics.stepSimulation(delta, 10);

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