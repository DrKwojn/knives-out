import { vec3 } from "../../lib/gl-matrix-module.js";
import { AABB } from "../AABB.js";
import { Model } from "../Model.js";
import { Entity } from "./Entity.js";

export class MapEntity extends Entity{
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
                //console.log(x + ' ' + y);
                const entity = new Entity(['Map'], null, new AABB([0, this.cellHeight / 2, 0], [this.cellSize, this.cellHeight, this.cellSize]));
                entity.position = vec3.fromValues(offset + x * this.cellSize, 0, offset + y * this.cellSize);
                scene.addEntity(entity);
                //console.log(entity.position);
            }
        }

        this.model = await Model.map(scene.game.gl, scene.game.programs.simple, this.grid, this.gridSize, this.cellSize, this.cellHeight);
    }
}