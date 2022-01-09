
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
uniform mat4 uProjection;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    //gl_Position = uMvpMatrix * vec4(aPosition, 1);
    vec3 vertexPosition = (uMvpMatrix * vec4(aPosition, 1)).xyz;
    gl_Position = uProjection * vec4(vertexPosition, 1);
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

uniform mat4 uMvpMatrix;
uniform mat4 uProjection;
uniform vec3 uLightPosition;
uniform vec3 uLightAttenuation;

out vec3 vEye;
out vec3 vLight;
out vec3 vNormal;
out vec2 vTexCoord;
out float vAttenuation;

void main() {
    vec3 vertexPosition = (uMvpMatrix * vec4(aPosition, 1)).xyz;
    vec3 lightPosition = (uMvpMatrix * vec4(uLightPosition, 1)).xyz;
    vEye = -vertexPosition;
    vLight = lightPosition - vertexPosition;
    vNormal = (uMvpMatrix * vec4(aNormal, 0)).xyz;
    vTexCoord = aTexCoord;

    float d = distance(vertexPosition, lightPosition);
    vAttenuation = 1.0 / dot(uLightAttenuation, vec3(1, d, d * d));

    gl_Position = uProjection * vec4(vertexPosition, 1);
}
`;

const lightFragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;

uniform float uShininess;
    
in vec3 vEye;
in vec3 vLight;
in vec3 vNormal;
in vec2 vTexCoord;
in float vAttenuation;

out vec4 oColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vLight);
    vec3 E = normalize(vEye);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), uShininess);

    vec3 ambient = uAmbientColor;
    vec3 diffuse = uDiffuseColor * lambert;
    vec3 specular = uSpecularColor * phong;

    vec3 light = (ambient + diffuse + specular) * vAttenuation;

    oColor = texture(uTexture, vTexCoord) * vec4(light, 1);
}
`;

const lightsVertex = `#version 300 es
precision mediump float;
layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec3 vVertexPosition;
out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vVertexPosition = (uViewModel * vec4(aPosition, 1)).xyz;
    vNormal = aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * vec4(vVertexPosition, 1);
}
`;

const lightsFragment = `#version 300 es
precision mediump float;

uniform mat4 uViewModel;

uniform mediump sampler2D uTexture;

uniform vec3 uAmbientColor[4];
uniform vec3 uDiffuseColor[4];
uniform vec3 uSpecularColor[4];

uniform float uShininess[4];
uniform vec3 uLightPosition[4];
uniform vec3 uLightAttenuation[4];

in vec3 vVertexPosition;
in vec3 vNormal;
in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = vec4(0.0);

    for (int i = 0; i < 4; i++) {
        vec3 lightPosition = (uViewModel * vec4(uLightPosition[i], 1)).xyz;
        float d = distance(vVertexPosition, lightPosition);
        float attenuation = 1.0 / dot(uLightAttenuation[i], vec3(1, d, d * d));

        vec3 N = (uViewModel * vec4(vNormal, 0)).xyz;
        vec3 L = normalize(lightPosition - vVertexPosition);
        vec3 E = normalize(-vVertexPosition);
        vec3 R = normalize(reflect(-L, N));

        float lambert = max(0.0, dot(L, N));
        float phong = pow(max(0.0, dot(E, R)), uShininess[i]);

        vec3 ambient = uAmbientColor[i];
        vec3 diffuse = uDiffuseColor[i] * lambert;
        vec3 specular = uSpecularColor[i] * phong;

        vec3 light = (ambient + diffuse + specular) * attenuation;

        oColor += texture(uTexture, vTexCoord) * vec4(light, 1);
    }
}
`;

export const shaders = {
    line: { vertex: lineVertex, fragment: lineFragment },
    //TODO: Rename this to model
    simple: { vertex: modelVertex, fragment: modelFragment },
    //phong: { vertex: lightVertex, fragment: lightFragment },
    phong: { vertex: lightsVertex, fragment: lightsFragment },
};
