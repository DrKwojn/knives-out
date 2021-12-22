import { mat4, quat, vec3 } from "../../lib/gl-matrix-module.js";
import { Model } from "../Model.js";
import { PhysicsEntity } from "./PhysicsEntity.js";

export class CubeEntity extends PhysicsEntity {
    constructor(position, rotation) {
        super();

        const mass = 1;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const shape = new Ammo.btBoxShape(Ammo.btVector3(1, 1, 1));
        shape.calculateLocalInertia(mass, localInertia);
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(position);
        //transform.setRotation(rotation); //TODO: Add rotation
        const motionState = new Ammo.btDefaultMotionState(transform);
        const rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        this.body =  new Ammo.btRigidBody(rigidBodyInfo);
    }

    async init(scene) {
        scene.physics.addRigidBody(this.body);

        this.model = Model.cube(scene.renderer.gl, scene.renderer.programs.simple);
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