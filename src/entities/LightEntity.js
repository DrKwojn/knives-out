import { vec3 } from "../../lib/gl-matrix-module.js";
import { Entity } from "./Entity.js";

export class LightEntity extends Entity {
    constructor() {
        super(['Light'], null, null);
        this.ambientColor = [170, 150, 130],
        this.diffuseColor = [115, 100, 60],
        this.specularColor = [100, 80, 50],
        this.shininess = 2,
        this.attenuatuion = [1.0, 0, 0.02]
    }
}