import { vec3 } from "../lib/gl-matrix-module.js";
import { WebGL } from "./WebGL.js";

export class PhysicsDebugRenderer {
    constructor(gl, programs) {
        this.gl = gl;
        this.program = programs.line;

        this.camera = null;

        //gl.enable(gl.DEPTH_TEST);
        //gl.enable(gl.CULL_FACE);
        //gl.clearColor(1.0, 1.0, 1.0, 1.0);
        //gl.clearColor(0.2, 0.1, 0.3, 1.0);

        this.vertices = [];

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
    }

    addLine(point0, point1, color) {
        this.vertices.push([[...point0], color]);
        this.vertices.push([[...point1], color]);
    }

    addAABB(position, aabb, color) {
        const min = vec3.add(vec3.create(), position, aabb.min);
        const max = vec3.add(vec3.create(), position, aabb.max);

        const p0 = vec3.fromValues(min[0], min[1], min[2]);
        const p1 = vec3.fromValues(max[0], min[1], min[2]);
        const p2 = vec3.fromValues(max[0], max[1], min[2]);
        const p3 = vec3.fromValues(min[0], max[1], min[2]);
        const p4 = vec3.fromValues(min[0], min[1], max[2]);
        const p5 = vec3.fromValues(max[0], min[1], max[2]);
        const p6 = vec3.fromValues(max[0], max[1], max[2]);
        const p7 = vec3.fromValues(min[0], max[1], max[2]);

        this.addLine(p0, p1, color);
        this.addLine(p1, p2, color);
        this.addLine(p2, p3, color);
        this.addLine(p3, p0, color);
        this.addLine(p4, p5, color);
        this.addLine(p5, p6, color);
        this.addLine(p6, p7, color);
        this.addLine(p7, p4, color);
        this.addLine(p0, p4, color);
        this.addLine(p1, p5, color);
        this.addLine(p2, p6, color);
        this.addLine(p3, p7, color);
    }

    render() {
        const gl = this.gl;

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindVertexArray(this.vao);

        gl.useProgram(this.program.program);
        
        const matrix = this.camera.getMatrix();
        gl.uniformMatrix4fv(this.program.uniforms.uMvpMatrix, false, matrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        const verticesFlat = this.vertices.flat().flat();
        const buffer = Float32Array.from(verticesFlat);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,
            3,
            gl.FLOAT,
            false,
            (3 + 4) * 4,
            0
        );
        
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(
            1,
            4,
            gl.FLOAT,
            false,
            (3 + 4) * 4,
            3 * 4
        );

        gl.drawArrays(gl.LINES, 0, this.vertices.length);

        //console.log(this.vertices);
        this.vertices = [];
    }
}
