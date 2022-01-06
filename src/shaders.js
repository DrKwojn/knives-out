
const lineVertex = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec4 aColor;

uniform mat4 uMvpMatrix;

out vec4 vColor;

void main() {
    vColor = aColor;
    gl_Position = uMvpMatrix * vec4(aPosition, 1.0);
}
`;

const lineFragment = `#version 300 es

precision mediump float;

in vec4 vColor;

out vec4 oColor;

void main() {
    oColor = vColor;
    //oColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

const modelVertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform mat4 uMvpMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uMvpMatrix * aPosition;
}
`;

const modelFragment = `#version 300 es

precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    //oColor = vec4(vTexCoord.xy, 0.0, 1.0);
    oColor = texture(uTexture, vTexCoord);
}
`;

export const shaders = {
    line: { vertex: lineVertex, fragment: lineFragment },
    //TODO: Rename this to model
    simple: { vertex: modelVertex, fragment: modelFragment },
};
