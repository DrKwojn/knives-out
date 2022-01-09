import { mat4 } from "../lib/gl-matrix-module.js";
import { AssetManager } from "./AssetManager.js";
import { GltfFile } from "./GltfFile.js";
import { Material } from "./Material.js";
import { MeshAttribute, MeshBuffer, MeshIndices, ModelMesh } from "./ModelMesh.js";
import { Texture, TextureSampler } from "./Texture.js";

export class Model {
    constructor(gl, meshes) {
        this.gl = gl;
        this.meshes = meshes;
    }

    static async load(gl, program, path, name) {
        return await GltfFile.load(gl, program, path, name);
    }

    static cube(gl, program) {
        const vertices = new Float32Array([
            -1, -1, -1,
            -1, -1,  1,
            -1,  1, -1,
            -1,  1,  1,
             1, -1, -1,
             1, -1,  1,
             1,  1, -1,
             1,  1,  1,
        ]);

        const indices = new Uint16Array([
            0, 1, 2,  2, 1, 3,
            4, 0, 6,  6, 0, 2,
            5, 4, 7,  7, 4, 6,
            1, 5, 3,  3, 5, 7,
            6, 2, 7,  7, 2, 3,
            1, 0, 5,  5, 0, 4,
        ]);

        const matrix = mat4.create();
        const material = new Material(this.gl);
        const indexBuffer = new MeshBuffer(indices.buffer, 0, indices.length * indices.BYTES_PER_ELEMENT, indices.BYTES_PER_ELEMENT, gl.ELEMENT_ARRAY_BUFFER);
        const modelIndices = new MeshIndices(indices.length, gl.UNSIGNED_SHORT, 0, indexBuffer);
        const attributes = [];
        const vertexBuffer = new MeshBuffer(vertices.buffer, 0, vertices.length * vertices.BYTES_PER_ELEMENT, vertices.BYTES_PER_ELEMENT * 3, gl.ARRAY_BUFFER);
        attributes[0] = new MeshAttribute('POSITION', vertices.length / 3, gl.FLOAT, 3, false, 0, vertexBuffer);
        const mesh = new ModelMesh(gl, matrix, material, program, gl.TRIANGLES, modelIndices, attributes);
        const model = new Model(gl, [mesh]);
        return model;
    }

    static async map(gl, program, grid, gridSize, cellSize, cellHeight) {
        const floorCount = grid.reduce((total, value) => total + (value == 0 ? 1 : 0), 0);
        const wallCount = grid.reduce((total, value, index) => {
            if(value == 0) {
                const neighbors = this.getNeighbors(grid, gridSize, index);
                for(const value of Object.values(neighbors)) {
                    if(value == 1) {
                        total += 1;
                    }
                }
            }
            return total;
        }, 0);
        const ceilCount = floorCount;

        const count = floorCount + wallCount + ceilCount;

        const vertComponenets = 3 + 2 + 3;
        const vertCount = count * 4;
        const indexCount = count * 6;
        
        const vertices = new Float32Array(vertCount * vertComponenets);
        const indices = new Uint32Array(indexCount);

        const offset = - (gridSize / 2) * 4;

        const halfCellSize = cellSize / 2;

        let vertexOffset = 0;
        let indexOffset = 0;

        //Floor
        for(let i = 0; i < grid.length; i++) {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const value = grid[i];
            if(value == 0) {
                vertices[(vertexOffset + 0) * vertComponenets + 0] = offset + x * cellSize - halfCellSize;
                vertices[(vertexOffset + 0) * vertComponenets + 1] = 0;
                vertices[(vertexOffset + 0) * vertComponenets + 2] = offset + y * cellSize - halfCellSize;

                vertices[(vertexOffset + 0) * vertComponenets + 3] = 0;
                vertices[(vertexOffset + 0) * vertComponenets + 4] = 0;

                vertices[(vertexOffset + 0) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 0) * vertComponenets + 6] = 1;
                vertices[(vertexOffset + 0) * vertComponenets + 7] = 0;

                vertices[(vertexOffset + 1) * vertComponenets + 0] = offset + x * cellSize + halfCellSize;
                vertices[(vertexOffset + 1) * vertComponenets + 1] = 0;
                vertices[(vertexOffset + 1) * vertComponenets + 2] = offset + y * cellSize - halfCellSize;

                vertices[(vertexOffset + 1) * vertComponenets + 3] = 0.5;
                vertices[(vertexOffset + 1) * vertComponenets + 4] = 0;

                vertices[(vertexOffset + 1) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 1) * vertComponenets + 6] = 1;
                vertices[(vertexOffset + 1) * vertComponenets + 7] = 0;

                vertices[(vertexOffset + 2) * vertComponenets + 0] = offset + x * cellSize + halfCellSize;
                vertices[(vertexOffset + 2) * vertComponenets + 1] = 0;
                vertices[(vertexOffset + 2) * vertComponenets + 2] = offset + y * cellSize + halfCellSize;

                vertices[(vertexOffset + 2) * vertComponenets + 3] = 0.5;
                vertices[(vertexOffset + 2) * vertComponenets + 4] = 0.5;

                vertices[(vertexOffset + 2) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 2) * vertComponenets + 6] = 1;
                vertices[(vertexOffset + 2) * vertComponenets + 7] = 0;

                vertices[(vertexOffset + 3) * vertComponenets + 0] = offset + x * cellSize - halfCellSize;
                vertices[(vertexOffset + 3) * vertComponenets + 1] = 0;
                vertices[(vertexOffset + 3) * vertComponenets + 2] = offset + y * cellSize + halfCellSize;

                vertices[(vertexOffset + 3) * vertComponenets + 3] = 0;
                vertices[(vertexOffset + 3) * vertComponenets + 4] = 0.5;

                vertices[(vertexOffset + 3) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 3) * vertComponenets + 6] = 1;
                vertices[(vertexOffset + 3) * vertComponenets + 7] = 0;

                indices[indexOffset * 6 + 0] = vertexOffset + 0;
                indices[indexOffset * 6 + 1] = vertexOffset + 2;
                indices[indexOffset * 6 + 2] = vertexOffset + 1;
                indices[indexOffset * 6 + 3] = vertexOffset + 0;
                indices[indexOffset * 6 + 4] = vertexOffset + 3;
                indices[indexOffset * 6 + 5] = vertexOffset + 2;

                vertexOffset += 4;
                indexOffset++;
            }
        }

        //Wall
        for(let i = 0; i < grid.length; i++) {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const value = grid[i];
            if(value == 0) {
                const neighbors = this.getNeighbors(grid, gridSize, i);
                for(const [key, value] of Object.entries(neighbors)) {
                    if(value == 1) {
                        let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
                        let nx = 0, ny = 0, nz = 0;
                        if(key == 'west') {
                            x0 = offset + x * cellSize - halfCellSize;
                            y0 = offset + y * cellSize + halfCellSize;
                            x1 = offset + x * cellSize - halfCellSize;
                            y1 = offset + y * cellSize - halfCellSize;
                            nx = 1;
                        } else if(key == 'east') {
                            x0 = offset + x * cellSize + halfCellSize;
                            y0 = offset + y * cellSize - halfCellSize;
                            x1 = offset + x * cellSize + halfCellSize;
                            y1 = offset + y * cellSize + halfCellSize;
                            nx = -1;
                        } else if(key == 'north') {
                            x0 = offset + x * cellSize - halfCellSize;
                            y0 = offset + y * cellSize - halfCellSize;
                            x1 = offset + x * cellSize + halfCellSize;
                            y1 = offset + y * cellSize - halfCellSize;
                            nz = 1;
                        } else if(key == 'south') {
                            x0 = offset + x * cellSize + halfCellSize;
                            y0 = offset + y * cellSize + halfCellSize;
                            x1 = offset + x * cellSize - halfCellSize;
                            y1 = offset + y * cellSize + halfCellSize;
                            nz = -1;
                        }
                        vertices[(vertexOffset + 0) * vertComponenets + 0] = x0;
                        vertices[(vertexOffset + 0) * vertComponenets + 1] = cellHeight;
                        vertices[(vertexOffset + 0) * vertComponenets + 2] = y0;

                        vertices[(vertexOffset + 0) * vertComponenets + 3] = 0.5;
                        vertices[(vertexOffset + 0) * vertComponenets + 4] = 0;

                        vertices[(vertexOffset + 0) * vertComponenets + 5] = nx;
                        vertices[(vertexOffset + 0) * vertComponenets + 6] = ny;
                        vertices[(vertexOffset + 0) * vertComponenets + 7] = nz;

                        vertices[(vertexOffset + 1) * vertComponenets + 0] = x1;
                        vertices[(vertexOffset + 1) * vertComponenets + 1] = cellHeight;
                        vertices[(vertexOffset + 1) * vertComponenets + 2] = y1;

                        vertices[(vertexOffset + 1) * vertComponenets + 3] = 1;
                        vertices[(vertexOffset + 1) * vertComponenets + 4] = 0;

                        vertices[(vertexOffset + 1) * vertComponenets + 5] = nx;
                        vertices[(vertexOffset + 1) * vertComponenets + 6] = ny;
                        vertices[(vertexOffset + 1) * vertComponenets + 7] = nz;

                        vertices[(vertexOffset + 2) * vertComponenets + 0] = x1;
                        vertices[(vertexOffset + 2) * vertComponenets + 1] = 0;
                        vertices[(vertexOffset + 2) * vertComponenets + 2] = y1;

                        vertices[(vertexOffset + 2) * vertComponenets + 3] = 1;
                        vertices[(vertexOffset + 2) * vertComponenets + 4] = 1;

                        vertices[(vertexOffset + 2) * vertComponenets + 5] = nx;
                        vertices[(vertexOffset + 2) * vertComponenets + 6] = ny;
                        vertices[(vertexOffset + 2) * vertComponenets + 7] = nz;

                        vertices[(vertexOffset + 3) * vertComponenets + 0] = x0;
                        vertices[(vertexOffset + 3) * vertComponenets + 1] = 0;
                        vertices[(vertexOffset + 3) * vertComponenets + 2] = y0;

                        vertices[(vertexOffset + 3) * vertComponenets + 3] = 0.5;
                        vertices[(vertexOffset + 3) * vertComponenets + 4] = 1;

                        vertices[(vertexOffset + 3) * vertComponenets + 5] = nx;
                        vertices[(vertexOffset + 3) * vertComponenets + 6] = ny;
                        vertices[(vertexOffset + 3) * vertComponenets + 7] = nz;

                        indices[indexOffset * 6 + 0] = vertexOffset + 0;
                        indices[indexOffset * 6 + 1] = vertexOffset + 2;
                        indices[indexOffset * 6 + 2] = vertexOffset + 1;
                        indices[indexOffset * 6 + 3] = vertexOffset + 0;
                        indices[indexOffset * 6 + 4] = vertexOffset + 3;
                        indices[indexOffset * 6 + 5] = vertexOffset + 2;

                        vertexOffset += 4;
                        indexOffset++;
                    }
                }
            }
        }

        // //Ceil
        for(let i = 0; i < grid.length; i++) {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const value = grid[i];
            if(value == 0) {
                vertices[(vertexOffset + 0) * vertComponenets + 0] = offset + x * cellSize - halfCellSize;
                vertices[(vertexOffset + 0) * vertComponenets + 1] = cellHeight;
                vertices[(vertexOffset + 0) * vertComponenets + 2] = offset + y * cellSize + halfCellSize;

                vertices[(vertexOffset + 0) * vertComponenets + 3] = 0;
                vertices[(vertexOffset + 0) * vertComponenets + 4] = 0.5;
                
                vertices[(vertexOffset + 0) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 0) * vertComponenets + 6] = -1;
                vertices[(vertexOffset + 0) * vertComponenets + 7] = 0;

                vertices[(vertexOffset + 1) * vertComponenets + 0] = offset + x * cellSize + halfCellSize;
                vertices[(vertexOffset + 1) * vertComponenets + 1] = cellHeight;
                vertices[(vertexOffset + 1) * vertComponenets + 2] = offset + y * cellSize + halfCellSize;

                vertices[(vertexOffset + 1) * vertComponenets + 3] = 0.5;
                vertices[(vertexOffset + 1) * vertComponenets + 4] = 0.5;

                vertices[(vertexOffset + 1) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 1) * vertComponenets + 6] = -1;
                vertices[(vertexOffset + 1) * vertComponenets + 7] = 0;

                vertices[(vertexOffset + 2) * vertComponenets + 0] = offset + x * cellSize + halfCellSize;
                vertices[(vertexOffset + 2) * vertComponenets + 1] = cellHeight;
                vertices[(vertexOffset + 2) * vertComponenets + 2] = offset + y * cellSize - halfCellSize;

                vertices[(vertexOffset + 2) * vertComponenets + 3] = 0.5;
                vertices[(vertexOffset + 2) * vertComponenets + 4] = 1;

                vertices[(vertexOffset + 2) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 2) * vertComponenets + 6] = -1;
                vertices[(vertexOffset + 2) * vertComponenets + 7] = 0;

                vertices[(vertexOffset + 3) * vertComponenets + 0] = offset + x * cellSize - halfCellSize;
                vertices[(vertexOffset + 3) * vertComponenets + 1] = cellHeight;
                vertices[(vertexOffset + 3) * vertComponenets + 2] = offset + y * cellSize - halfCellSize;

                vertices[(vertexOffset + 3) * vertComponenets + 3] = 0;
                vertices[(vertexOffset + 3) * vertComponenets + 4] = 1;

                vertices[(vertexOffset + 3) * vertComponenets + 5] = 0;
                vertices[(vertexOffset + 3) * vertComponenets + 6] = -1;
                vertices[(vertexOffset + 3) * vertComponenets + 7] = 0;

                indices[indexOffset * 6 + 0] = vertexOffset + 0;
                indices[indexOffset * 6 + 1] = vertexOffset + 2;
                indices[indexOffset * 6 + 2] = vertexOffset + 1;
                indices[indexOffset * 6 + 3] = vertexOffset + 0;
                indices[indexOffset * 6 + 4] = vertexOffset + 3;
                indices[indexOffset * 6 + 5] = vertexOffset + 2;

                vertexOffset += 4;
                indexOffset++;
            }
        }

        const matrix = mat4.create();
        const material = new Material(gl);

        const image = await AssetManager.getImage('../res/textures/map2.png');
        const sampler = new TextureSampler(gl, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT, gl.REPEAT);
        material.colorTexture = new Texture(gl, image, sampler);
        
        const indexBuffer = new MeshBuffer(indices.buffer, 0, indices.length * indices.BYTES_PER_ELEMENT, indices.BYTES_PER_ELEMENT, gl.ELEMENT_ARRAY_BUFFER);
        const modelIndices = new MeshIndices(indices.length, gl.UNSIGNED_INT, 0, indexBuffer);
        const attributes = [];
        const vertexBuffer = new MeshBuffer(vertices.buffer, 0, vertices.length * vertices.BYTES_PER_ELEMENT, 
            vertices.BYTES_PER_ELEMENT * vertComponenets, gl.ARRAY_BUFFER);
        attributes[0] = new MeshAttribute(  'POSITION', vertices.length / vertComponenets, gl.FLOAT, 3, false,           0, vertexBuffer);
        attributes[1] = new MeshAttribute('TEXCOORD_0', vertices.length / vertComponenets, gl.FLOAT, 2, false,       3 * 4, vertexBuffer);
        attributes[2] = new MeshAttribute(    'NORMAL', vertices.length / vertComponenets, gl.FLOAT, 3, false, (3 + 2) * 4, vertexBuffer);
        
        const mesh = new ModelMesh(gl, matrix, material, program, gl.TRIANGLES, modelIndices, attributes);

        const model = new Model(gl, [mesh]);
        return model;
    }

    static getNeighbors(grid, size, index) {
        const x = index % size;
        const y = Math.floor(index / size);

        const neighbors = {
            west: x - 1 >= 0 ? grid[index - 1] : - 1,
            east: x + 1 <= size - 1 ? grid[index + 1] : - 1,
            north: y - 1 >= 0 ? grid[index - size] : - 1,
            south: y + 1 <= size - 1 ? grid[index + size] : - 1,
        };

        return neighbors;
    }
}
