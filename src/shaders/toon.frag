#version 300 es

// CSCI 4611 Assignment 5: Artistic Rendering
// You should modify this fragment shader to implement a toon shading model
// As a starting point, you should copy and paste the shader code from
// phong.frag into this file. You can find it in the GopherGfx library.
// You can then modify it to use the diffuse and specular ramps. 

precision mediump float;

#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

const int MAX_LIGHTS = 8;

uniform vec3 eyePosition;

uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositions[MAX_LIGHTS];
uniform vec3 ambientIntensities[MAX_LIGHTS];
uniform vec3 diffuseIntensities[MAX_LIGHTS];
uniform vec3 specularIntensities[MAX_LIGHTS];

uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

uniform int useTexture;
uniform sampler2D textureImage;

uniform sampler2D diffuseRamp;
uniform sampler2D specularRamp;

in vec3 vertPosition;
in vec3 vertNormal;
in vec4 vertColor;
in vec2 uv;

out vec4 fragColor;

void main() 
{
        vec3 illumination = vec3(0, 0, 0);
    for(int i=0; i < numLights; i++)
    {
        // Ambient component
        illumination += kAmbient * ambientIntensities[i];

        // Normalize the interpolated normal vector
        vec3 n = normalize(vertNormal);

        // Compute the vector from the vertex position to the light
        vec3 l;
        if(lightTypes[i] == DIRECTIONAL_LIGHT)
            l = normalize(lightPositions[i]);
        else
            l = normalize(lightPositions[i] - vertPosition);

        // Diffuse component
        float x = 0.5 * dot(n, l) + 0.5;
        float y = 0.0;
        vec2 coords = vec2(x, y);
        vec3 diffuseComponent = texture(diffuseRamp,coords).rgb;
        illumination += diffuseComponent * kDiffuse * diffuseIntensities[i];

        // Compute the vector from the vertex to the eye
        vec3 e = normalize(eyePosition - vertPosition);

        // Compute the light vector reflected about the normal
        vec3 r = reflect(-l, n);

        // Specular component
        float x2 = pow(max(dot(e, r), 0.0), shininess);
        float y2 = 0.0;
        vec2 coord2 = vec2(x2, y2);
        vec3 specularComponent = texture(specularRamp, coord2).rgb;

        vec3 spec = texture(specularRamp, coords).rgb;
        illumination += specularComponent * kSpecular * specularIntensities[i];
    }

    fragColor = vertColor;
    fragColor.rgb *= illumination;

    if(useTexture != 0)
    {
        fragColor *= texture(textureImage, uv);
    }
}