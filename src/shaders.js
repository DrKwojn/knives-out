
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

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform mat4 uMvpMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uMvpMatrix * vec4(aPosition, 1);
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

const lightVertex = `#version 300 es
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uViewModel;
uniform mat4 uProjection;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;

out vec2 vTexCoord;
out vec3 vLight;

void main() {
    vec3 vertexPosition = (uViewModel * vec4(aPosition, 1)).xyz;
    vec3 lightPosition = (uViewModel * vec4(uLightPosition, 1)).xyz;

    vec3 N = (uViewModel * vec4(aNormal, 0)).xyz;
    vec3 L = normalize(lightPosition - vertexPosition);

    float lambert = max(0.0, dot(L, N));

    float diffuse = lambert;

    vLight = diffuse * uLightColor;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * vec4(vertexPosition, 1);
}
`;

const lightFragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;
in vec3 vLight;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord) * vec4(vLight, 1);
}
`;

export const shaders = {
    line: { vertex: lineVertex, fragment: lineFragment },
    //TODO: Rename this to model
    simple: { vertex: modelVertex, fragment: modelFragment },
    phong: { vertex: lightVertex, fragment: lightFragment },
};
