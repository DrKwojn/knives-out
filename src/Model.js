import { mat4 } from "../lib/gl-matrix-module.js";
import { GltfFile } from "./GltfFile.js";
import { Material } from "./Material.js";
import { MeshAttribute, MeshBuffer, MeshIndices, ModelMesh } from "./ModelMesh.js";

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

    static heightmap(gl, program, width, height) {
        const w = width;
        const h = height

        const x = Math.floor(w / 2);
        const y = Math.floor(h / 2);
        const vertices = new Float32Array((h + 1) * (w + 1) * 3);
        for(let vy = 0; vy <= h; vy++) {
            for(let vx = 0; vx <= w; vx++) {
                const index = (vy * (w + 1) + vx) * 3;
                vertices[index + 0] = vx - x;
                vertices[index + 1] = 0;
                vertices[index + 2] = vy - y;
            }
        }

        const indices = new Uint32Array(w * h * 6);
        for(let iy = 0; iy < h; iy++) {
            for(let ix = 0; ix < w; ix++) {
                const index = (iy * w + ix) * 6;
                const vIndex0 = (iy + 0) * (w + 1) + (ix + 0);
                const vIndex1 = (iy + 0) * (w + 1) + (ix + 1);
                const vIndex2 = (iy + 1) * (w + 1) + (ix + 1);
                const vIndex3 = (iy + 1) * (w + 1) + (ix + 0);
                indices[index + 0] = vIndex0;
                indices[index + 1] = vIndex2;
                indices[index + 2] = vIndex1;
                indices[index + 3] = vIndex0;
                indices[index + 4] = vIndex3;
                indices[index + 5] = vIndex2;
            }
        }

        const matrix = mat4.create();
        const material = new Material(this.gl);
        const indexBuffer = new MeshBuffer(indices.buffer, 0, indices.length * indices.BYTES_PER_ELEMENT, indices.BYTES_PER_ELEMENT, gl.ELEMENT_ARRAY_BUFFER);
        const modelIndices = new MeshIndices(indices.length, gl.UNSIGNED_INT, 0, indexBuffer);
        const attributes = [];
        const vertexBuffer = new MeshBuffer(vertices.buffer, 0, vertices.length * vertices.BYTES_PER_ELEMENT, vertices.BYTES_PER_ELEMENT * 3, gl.ARRAY_BUFFER);
        attributes[0] = new MeshAttribute('POSITION', vertices.length / 3, gl.FLOAT, 3, false, 0, vertexBuffer);
        const mesh = new ModelMesh(gl, matrix, material, program, gl.TRIANGLES, modelIndices, attributes);
        const model = new Model(gl, [mesh]);
        return model;
    }
}
