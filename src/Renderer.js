import { vec3, mat4 } from "../lib/gl-matrix-module.js";
import { WebGL } from "./WebGL.js";
import { TextureSampler } from "./Texture.js";

export class Renderer {

    constructor(gl, programs) {
        this.gl = gl;
        this.programs = programs;

        this.defaultTexture = WebGL.createDefaultTexture(gl);
        this.defaultSampler = new TextureSampler(gl);

        this.camera = null;

        this.lights = [];
    }

    render() {
        const gl = this.gl;

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        //gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearColor(0.2, 0.1, 0.3, 1.0);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    renderModel(matrix, model) {
        const gl = this.gl;

        const vp = this.camera.getView();
        const mvp = mat4.multiply(mat4.create(), vp, matrix);
        model.meshes.forEach(mesh => {
            const material = mesh.material;
            
            gl.bindVertexArray(mesh.vao);

            gl.useProgram(mesh.program.program);

            //NOTE: Make sure we alyways have 4 lights
            //console.log(this.lights);
            for(let index = 0; index < this.lights.length; index++) {
                const light = this.lights[index];

                let color = vec3.clone(light.ambientColor);
                vec3.scale(color, color, 1.0 / 255.0);
                gl.uniform3fv(mesh.program.uniforms['uAmbientColor[' + index + ']'], color);
                color = vec3.clone(light.diffuseColor);
                vec3.scale(color, color, 1.0 / 255.0);
                gl.uniform3fv(mesh.program.uniforms['uDiffuseColor[' + index + ']'], color);
                color = vec3.clone(light.specularColor);
                vec3.scale(color, color, 1.0 / 255.0);
                gl.uniform3fv(mesh.program.uniforms['uSpecularColor[' + index + ']'], color);
                
                gl.uniform1f(mesh.program.uniforms['uShininess[' + index + ']'], light.shininess);
                gl.uniform3fv(mesh.program.uniforms['uLightPosition[' + index + ']'], light.position);
                gl.uniform3fv(mesh.program.uniforms['uLightAttenuation[' + index + ']'], light.attenuatuion);
            }

            const matrix = mat4.multiply(mat4.create(), mvp, mesh.matrix);
            gl.uniformMatrix4fv(mesh.program.uniforms.uViewModel, false, matrix);

            gl.uniformMatrix4fv(mesh.program.uniforms.uProjection, false, this.camera.projection);

            gl.uniform1i(mesh.program.uniforms.uTexture, 0);

            const texture = material.colorTexture;
            if (texture) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture.index);
                gl.bindSampler(0, texture.sampler.index);
            } else {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.defaultTexture);
                gl.bindSampler(0, this.defaultSampler.index);
            }

            if (mesh.indices) {
                gl.drawElements(mesh.mode, mesh.indices.count, mesh.indices.componentType, 0);
            } else {
                const count = mesh.attributes[Object.keys(mesh.attributes)[0]].count;
                gl.drawArrays(mesh.mode, 0, count);
            }
        });
    }
}