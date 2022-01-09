import { vec3 } from "../../lib/gl-matrix-module.js";
import { Entity } from "./Entity.js";

export class LightEntity extends Entity {
    constructor() {
        super(['Light'], null, null);

        this.position = [5, 5, 5],
        this.ambientColor = [51, 51, 51],
        this.diffuseColor = [204, 204, 204],
        this.specularColor = [0, 255, 0],
        this.shininess = 10,
        this.attenuatuion = [1.0, 0, 0.02]
    }
}