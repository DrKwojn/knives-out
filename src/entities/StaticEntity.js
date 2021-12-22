import { mat4, quat, vec3 } from "../../lib/gl-matrix-module.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class StaticEntity extends PhysicsEntity {
    constructor(position, rotation, shape, model) {
        super();

        const transform = new Ammo.btTransform(rotation, position);
        const motionState = new Ammo.btDefaultMotionState(transform);
        const rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, new Ammo.btVector3(0, 0, 0));
        this.body =  new Ammo.btRigidBody(rigidBodyInfo);
        
        this.model = model;
    }

    async init(scene) {
        scene.physics.addRigidBody(this.body);
    }

    update(delta) {
        
    }

    render(renderer) {
        const transform = new Ammo.btTransform();
        this.body.getMotionState().getWorldTransform(transform);
        
        const physicsPos = transform.getOrigin();
        const physicsRot = transform.getRotation();

        const position = vec3.set(vec3.create(), physicsPos.x(), physicsPos.y(), physicsPos.z());
        const rotation = quat.create();
        const matrix = mat4.fromRotationTranslationScale(mat4.create(), rotation, position, vec3.set(vec3.create(), 1, 1, 1));
        
        renderer.renderModel(matrix, this.model);
    }
}