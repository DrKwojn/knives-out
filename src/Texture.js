import { WebGL } from "./WebGL.js";

export class Texture {
    constructor(gl, image, sampler) {
        this.gl = gl;

        this.mipmap = false;
        if( sampler.min == gl.NEAREST_MIPMAP_NEAREST ||
            sampler.min == gl.LINEAR_MIPMAP_NEAREST  ||
            sampler.min == gl.NEAREST_MIPMAP_LINEAR  ||
            sampler.min == gl.LINEAR_MIPMAP_LINEAR   ||
            sampler.mag == gl.NEAREST_MIPMAP_NEAREST ||
            sampler.mag == gl.LINEAR_MIPMAP_NEAREST  ||
            sampler.mag == gl.NEAREST_MIPMAP_LINEAR  ||
            sampler.mag == gl.LINEAR_MIPMAP_LINEAR) {
                this.mipmap = true;
        }

        this.index = WebGL.createTexture(gl, {
            mip: this.mipmap,
            image: image
        });
        this.sampler = sampler;
    }
}

export class TextureSampler {
    constructor(gl, min, mag, wrapU, wrapV) {
        this.min = min || gl.LINEAR;
        this.mag = mag || gl.LINEAR;
        this.wrapU = wrapU || gl.REPEAT;
        this.wrapV = wrapV || gl.REPEAT;
        this.index = gl.createSampler();
        gl.samplerParameteri(this.index, gl.TEXTURE_MIN_FILTER, this.min);
        gl.samplerParameteri(this.index, gl.TEXTURE_MAG_FILTER, this.mag);
        gl.samplerParameteri(this.index, gl.TEXTURE_WRAP_S, this.wrapU);
        gl.samplerParameteri(this.index, gl.TEXTURE_WRAP_T, this.wrapV);
    }
}