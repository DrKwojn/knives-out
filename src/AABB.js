import { vec3 } from "../lib/gl-matrix-module.js";

export class AABB {
    constructor(offset, size) {
        const offsetVec = vec3.fromValues(...offset);
        const sizeVec = vec3.fromValues(...size);
        const sizeHalf = vec3.scale(vec3.create(), sizeVec, 0.5);

        this.min = vec3.sub(vec3.create(), offsetVec, sizeHalf);
        this.max = vec3.add(vec3.create(), offsetVec, sizeHalf);
    }
}