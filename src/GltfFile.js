import { vec3, quat, mat4 } from '../lib/gl-matrix-module.js';
import { AssetManager } from './AssetManager.js';
import { Model } from './Model.js';
import { Material } from './Material.js';
import { MeshAttribute, MeshBuffer, MeshIndices, ModelMesh } from './ModelMesh.js';
import { TextureSampler, Texture } from './Texture.js';

export class GltfFile {
    constructor(gl, program, baseURL, file) {
        this.gl = gl;
        this.program = program;
        this.baseURL = baseURL;
        this.file = file;
    }

    static async load(gl, program, path, nameOrIndex = 0) {
        const file = await AssetManager.getJson(path);
        const url = new URL(path, window.location);
        const baseURL = new URL('.', url);
        const gltf = new GltfFile(gl, program, baseURL, file);
        return gltf.createModel(nameOrIndex);
    }

    async createModel(nameOrIndex) {
        let index = -1;
        if (typeof nameOrIndex === 'number') {
            if (nameOrIndex >= 0 && nameOrIndex < this.file.nodes.length) {
                index = nameOrIndex;
            }
        } else {
            index = this.file.nodes.findIndex(element => {
                return element.name === nameOrIndex;
            });
        }

        if(index < 0) {
            console.log('Node with name or index of ' + nameOrIndex + ' not found');
            return null;
        }

        const root = this.file.nodes[index];

        const meshes = [];
        await this.parseNodeTree(meshes, root);

        return new Model(this.gl, meshes);
    }

    async parseNodeTree(meshes, node) {
        let matrix = node.matrix !== undefined ? mat4.clone(node.matrix) : mat4.create();

        const translation = node.translation !== undefined ? vec3.clone(node.translation) : vec3.fromValues(0, 0, 0);
        const rotation = node.rotation !== undefined ? quat.clone(node.rotation) : quat.fromValues(0, 0, 0, 1);
        const scale = node.scale !== undefined ? vec3.clone(node.scale) : vec3.fromValues(1, 1, 1);
        matrix = mat4.fromRotationTranslationScale(matrix, rotation, translation, scale);

        //TODO: If the matrix is dependent on parent values we need to recurse up to multiply the matrices

        if(node.mesh !== undefined) {
            const mesh = this.file.meshes[node.mesh];
            if(mesh !== undefined) {
                await this.parseMesh(meshes, matrix, mesh);
            }
        }

        if (node.children) {
            for(childIndex of node.children) {
                await this.parseNodeTree(meshes, this.file.nodes[childIndex]);
            }
        }
    }

    async parseMesh(meshes, matrix, mesh) {
        for(const primitive of mesh.primitives) {
            const attributes = [];
            for(const attribute in primitive.attributes) {
                attributes[attribute] = await this.parseAttribute(this.file.accessors[primitive.attributes[attribute]], attribute, this.gl.ARRAY_BUFFER);
            }

            const mode = primitive.mode !== undefined ? primitive.mode : this.gl.TRIANGLES;
            const indices = primitive.indices !== undefined ? await this.parseIndices(this.file.accessors[primitive.indices]) : null;
            const material = await this.parseMaterial(this.file.materials[primitive.material]);

            meshes.push(new ModelMesh(this.gl, matrix, material, this.program, mode, indices, attributes));
        }
    }

    async parseIndices(accessor) {
        const buffer = await this.parseBufferView(this.file.bufferViews[accessor.bufferView], this.gl.ELEMENT_ARRAY_BUFFER);
        const offset = accessor.byteOffset !== undefined ? accessor.byteOffset : 0;
        const count = accessor.count;
        const componentType = accessor.componentType;

        return new MeshIndices(count, componentType, offset, buffer);
    }

    async parseAttribute(accessor, name, target) {
        const buffer = await this.parseBufferView(this.file.bufferViews[accessor.bufferView], target);
        const offset = accessor.byteOffset !== undefined ? accessor.byteOffset : 0;
        const count = accessor.count;
        const componentType = accessor.componentType;

        const typeComponentCount = {
            SCALAR: 1,
            VEC2  : 2,
            VEC3  : 3,
            VEC4  : 4,
            MAT2  : 4,
            MAT3  : 9,
            MAT4  : 16,
        };
        const componentCount = typeComponentCount[accessor.type];

        const normalized = accessor.normalized !== undefined ? accessor.normalized : false;
        return new MeshAttribute(name, count, componentType, componentCount, normalized, offset, buffer)
    }

    async parseBufferView(bufferView, target) {
        const uri = this.file.buffers[bufferView.buffer].uri;
        const url = new URL(uri, this.baseURL);
        const buffer = await AssetManager.getBuffer(url);
        const offset = bufferView.byteOffset !== undefined ? bufferView.byteOffset : 0;
        const stride = bufferView.byteStride !== undefined ? bufferView.byteStride : null;
        const size = bufferView.byteLength;
        return new MeshBuffer(buffer, offset, size, stride, target);
    }

    async parseMaterial(material) {
        const modelMaterial = new Material(this.gl);

        if (material.pbrMetallicRoughness !== undefined) {
            if (material.pbrMetallicRoughness.baseColorTexture !== undefined) {
                modelMaterial.colorTexture = await this.parseTexture(this.file.textures[material.pbrMetallicRoughness.baseColorTexture.index])
            }
        }

        return modelMaterial;
    }

    async parseTexture(texture) {
        const image = this.file.images[texture.source];

        if(image.uri === undefined) {
            console.log('Image has no uri');
            return null;
        }

        const url = new URL(image.uri, this.baseURL);
        const imageBuffer = await AssetManager.getImage(url);
        
        if(image.bufferView !== undefined) {
            //TODO: We need to handle this if a model needs it
            console.log('This texture uses buffer to store the image this is not yet implemented!')
        }
        
        const sampler = await this.parseSampler(this.file.samplers[texture.sampler]);
        return new Texture(this.gl, imageBuffer, sampler);
    }

    async parseSampler(sampler) {
        const min = sampler.minFilter !== undefined ? sampler.minFilter : this.gl.LINEAR;
        const mag = sampler.magFilter !== undefined ? sampler.magFilter : this.gl.LINEAR;
        const wrapU = sampler.wrapS !== undefined ? sampler.wrapS : this.gl.REPEAT;
        const wrapV = sampler.wrapT !== undefined ? sampler.wrapT : this.gl.REPEAT;
        return new TextureSampler(this.gl, min, mag, wrapU, wrapV);
    }
}
