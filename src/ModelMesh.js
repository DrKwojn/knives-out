import { WebGL } from "./WebGL.js";

export class ModelMesh {
    constructor(gl, matrix, material, program, mode, indices, attributes) {
        this.gl = gl;

        this.matrix = matrix;

        this.material = material;

        this.program = program;

        this.mode = mode;
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        if(indices) {
            const bufferView = new DataView(
                indices.buffer.buffer, 
                indices.buffer.offset, 
                indices.buffer.size
            );

            indices.ibo = WebGL.createBuffer(this.gl, {
                target: indices.buffer.target,
                data: bufferView
            });

            gl.bindBuffer(indices.buffer.target, indices.ibo);

            this.indices = indices;
        }

        //NOTE: We convert .gltf constnts into attribute indices
        const attributeMap = {
            POSITION   : 0,
            TEXCOORD_0 : 1,
            NORMAL     : 2,
        };        

        this.attributes = [];
        for(const name in attributes) {
            const attribute = attributes[name];
            attribute.index = attributeMap[attribute.name];
            if(attribute.index !== undefined) {
                const bufferView = new DataView(
                    attribute.buffer.buffer, 
                    attribute.buffer.offset, 
                    attribute.buffer.size
                );

                attribute.vbo = WebGL.createBuffer(this.gl, {
                    target: attribute.buffer.target,
                    data: bufferView
                });

                gl.bindBuffer(attribute.buffer.target, attribute.vbo);
                gl.enableVertexAttribArray(attribute.index);
                gl.vertexAttribPointer(
                    attribute.index,
                    attribute.componentCount,
                    attribute.componentType,
                    attribute.normalized,
                    attribute.buffer.stride,
                    attribute.offset
                );

                this.attributes.push(attribute);
            }
        }
    }
}

export class MeshAttribute {
    constructor(name, count, componentType, componentCount, normalized, offset, buffer) {
        this.name = name;
        this.count = count;
        this.componentType = componentType;
        this.componentCount = componentCount;
        this.normalized = normalized;
        this.offset = offset;
        this.buffer = buffer;

        this.index = null;
        this.vbo = null;
    }
}

export class MeshIndices {
    constructor(count, componentType, offset, buffer) {
        this.count = count;
        this.componentType = componentType;
        this.offset = offset;
        this.buffer = buffer;

        this.ibo = null;
    }
}

export class MeshBuffer {
    constructor(buffer, offset, size, stride, target) {
        this.buffer = buffer;
        this.offset = offset;
        this.size = size;
        this.stride = stride;
        this.target = target;
    }
}
