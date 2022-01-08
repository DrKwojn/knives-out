import { vec3 } from "../../lib/gl-matrix-module.js";
import { Entity } from "./Entity.js";

export class LightEntity extends Entity {
    constructor() {
        super(['Light'], null, null);

        this.position = vec3.fromValues(5, 5, 5),
        this.ambientColor = vec3.fromValues(51, 51, 51),
        this.diffuseColor = vec3.fromValues(204, 204, 204),
        this.specularColor = vec3.fromValues(0, 255, 0),
        this.shininess = 10,
        this.color = [255, 255, 255];
        this.attenuatuion = vec3.fromValues(1.0, 0, 0.02)
    }
}