#version 330 core

out vec4 frag_color;

struct AmbientLight {
    bool enabled;
    vec3 ambient;
};

struct PointLight {
    bool enabled;
    vec3 position;
    vec3 diffuse;
    vec3 specular;
    vec3 attenuation;
};

struct DirectionalLight {
    bool enabled;
    vec3 direction;
    vec3 diffuse;
    vec3 specular;
};
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

in vec3 world_position;
in vec3 world_normal;
in vec2 tex_coord;

vec4 shadow_coord;

uniform vec3 camera_position;
uniform mat4 world_to_light_ndc_matrix;

uniform sampler2D ambient_texture;
uniform sampler2D diffuse_texture;
uniform sampler2D specular_texture;
uniform sampler2D shadow_texture;

uniform bool ambient_use_texture;
uniform bool diffuse_use_texture;
uniform bool specular_use_texture;

uniform Material material; // material properties of the object
uniform AmbientLight ambient_light;
uniform PointLight point_light; 
uniform DirectionalLight directional_light;
vec3 CalcAmbientLight();
vec3 CalcPointLight(vec3 normal, vec3 view_dir);
vec3 CalcDirectionalLight(vec3 normal, vec3 view_dir);

void main() {
    vec3 normal = normalize(world_normal);
    vec3 view_dir = normalize(camera_position - world_position);

    frag_color = vec4(0.0);

    if (ambient_light.enabled) {
        frag_color += vec4(CalcAmbientLight(), 1.0);
    }
    
    if (point_light.enabled) {
        frag_color += vec4(CalcPointLight(normal, view_dir), 1.0);
    }

    if (directional_light.enabled) {
        frag_color += vec4(CalcDirectionalLight(normal, view_dir), 1.0);
    }
}

vec3 GetAmbientColor() {
    if (ambient_use_texture) {
        return vec3(texture(ambient_texture, tex_coord));
    }
    return material.ambient;
}

vec3 GetDiffuseColor() {
    if (ambient_use_texture) {
        return vec3(texture(diffuse_texture, tex_coord));
    }
    return material.diffuse;
}

vec3 GetSpecularColor() {
    if (ambient_use_texture) {
        return vec3(texture(specular_texture, tex_coord));
    }
    return material.specular;
}

vec3 GetShadowSample() {
    float x = (shadow_coord[0] + 1) / 2;
    float y = (shadow_coord[1] + 1) / 2;
    return vec3(texture(shadow_texture, vec2(x, y)));
}

vec3 CalcAmbientLight() {
    return ambient_light.ambient * GetAmbientColor();
}

vec3 CalcPointLight(vec3 normal, vec3 view_dir) {
    PointLight light = point_light;
    vec3 light_dir = normalize(light.position - world_position);

    float diffuse_intensity = max(dot(normal, light_dir), 0.0);
    vec3 diffuse_color = diffuse_intensity * light.diffuse * GetDiffuseColor();

    vec3 reflect_dir = reflect(-light_dir, normal);
    float specular_intensity = pow(
        max(dot(view_dir, reflect_dir), 0.0), material.shininess);
    vec3 specular_color = specular_intensity * 
        light.specular * GetSpecularColor();

    float distance = length(light.position - world_position);
    float attenuation = 1.0 / (light.attenuation.x + 
        light.attenuation.y * distance + 
        light.attenuation.z * (distance * distance));

    return attenuation * (diffuse_color + specular_color);
}

vec2 co = gl_FragCoord.xy;
float rand() {
    float f = fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    co.x = f;
    co.y = fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    return co.x;
}

float CalcShadow(vec3 light_dir) {
    float bias = max(0.002 * (1.0 - dot(world_normal, light_dir)), 0.002);

    vec3 proj_coords = shadow_coord.xyz / shadow_coord.w;
    proj_coords = proj_coords * 0.5 + 0.5;
    float current_depth = proj_coords.z;
    float shadow = 0.0;
    vec2 texel_size = 1.0 / textureSize(shadow_texture, 0);
    for (int x = -1; x<=1; x++) {
        for (int y=-1; y<=1; y++) {
            vec2 dr = vec2(rand(), rand()) * 0.0002;
            vec2 pcf_coord = proj_coords.xy + vec2(x, y) * texel_size + dr;
            float pcf_depth = texture(shadow_texture, pcf_coord).r;
            shadow += current_depth - bias > pcf_depth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    return shadow;
}

vec3 CalcDirectionalLight(vec3 normal, vec3 view_dir) {
    shadow_coord = (world_to_light_ndc_matrix * vec4(world_position, 1.0));
    float shadow_depth = GetShadowSample().z;
    float object_depth = shadow_coord.z;

    DirectionalLight light = directional_light;
    vec3 light_dir = normalize(-light.direction);
    float diffuse_intensity = max(dot(normal, light_dir), 0.0);
    vec3 diffuse_color = diffuse_intensity * light.diffuse * GetDiffuseColor();

    vec3 reflect_dir = reflect(-light_dir, normal);
    float specular_intensity = pow(
        max(dot(view_dir, reflect_dir), 0.0), material.shininess);
    vec3 specular_color = specular_intensity * 
        light.specular * GetSpecularColor();

    vec3 final_color = diffuse_color + specular_color;

    final_color *= 1.0 - CalcShadow(light_dir);

    return final_color;
}

