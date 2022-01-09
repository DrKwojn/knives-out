import { vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { Model } from "../Model.js";
import { Entity } from "./Entity.js";

export class MapEntity extends Entity {
    constructor(grid, size) {
        super(null, null);
        this.grid = grid;
        this.gridSize = size;
        this.cellSize = 4;
        this.cellHeight = 8;
    }

    async init(scene) {
        const offset = - (this.gridSize / 2) * 4;
        for(let i = 0; i < this.grid.length; i++) {
            const x = i % this.gridSize;
            const y = Math.floor(i / this.gridSize);
            const value = this.grid[i];
            if(value == 1) {
                const entity = new Entity(['Map'], null, new AABB([0, this.cellHeight / 2, 0], [this.cellSize, this.cellHeight, this.cellSize]));
                entity.position = vec3.fromValues(offset + x * this.cellSize, 0, offset + y * this.cellSize);
                scene.addEntity(entity);
            }
        }

        const floorEntity = new Entity(['Map'], null, new AABB([0, -0.5, 0], [this.cellSize * this.gridSize, 1, this.cellSize * this.gridSize]))
        floorEntity.position = vec3.fromValues(-2, 0, -2);
        scene.addEntity(floorEntity);

        const ceilEntity = new Entity(['Map'], null, new AABB([0, 0.5, 0], [this.cellSize * this.gridSize, 1, this.cellSize * this.gridSize]))
        ceilEntity.position = vec3.fromValues(- this.cellSize / 2, this.cellHeight, - this.cellSize / 2);
        scene.addEntity(ceilEntity);

        this.model = await Model.map(scene.game.gl, scene.game.programs.phong, this.grid, this.gridSize, this.cellSize, this.cellHeight);
    }
}