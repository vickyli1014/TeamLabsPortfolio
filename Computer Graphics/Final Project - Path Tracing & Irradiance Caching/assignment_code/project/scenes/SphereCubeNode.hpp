#ifndef SPHERE_CUBE_NODE_H_
#define SPHERE_CUBE_NODE_H_

#include "gloo/SceneNode.hpp"
#include "SphereNode.hpp"
#include "gloo/shaders/PhongShader.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "glm/gtx/string_cast.hpp"
#include "gloo/debug/PrimitiveFactory.hpp"

#include "gloo/components/LightComponent.hpp"
#include "gloo/lights/AmbientLight.hpp"
#include "gloo/lights/PointLight.hpp"
#include "gloo/lights/DirectionalLight.hpp"

#include "TracingComponent.hpp"
#include "hittable/Sphere.hpp"
#include "hittable/Cube.hpp"

namespace GLOO {
class SphereCubeNode :public SceneNode {
public:
    SphereCubeNode(bool add_sphere, bool delete_sphere, bool mirror) {
    add_sphere_ = add_sphere;
    delete_sphere_ = delete_sphere;
    mirror_ = mirror;

    // make materials
    diffuse_material = make_unique<Material>();
    diffuse_material->SetAmbientColor(glm::vec3(0.5f));
    diffuse_material->SetDiffuseColor(glm::vec3(0.5f));
    diffuse_material->SetSpecularColor(glm::vec3(0.5));

    mirror_material = make_unique<Material>();
    mirror_material->SetAmbientColor(glm::vec3(0.2));
    mirror_material->SetDiffuseColor(glm::vec3(0.2));
    mirror_material->SetSpecularColor(glm::vec3(0.9));
    mirror_material->SetShininess(30);

    // add directional light
    // auto point_light = std::make_shared<PointLight>();
    // point_light->SetDiffuseColor(glm::vec3(0.8f, 0.8f, 0.8f));
    // point_light->SetSpecularColor(glm::vec3(1.0f, 1.0f, 1.0f));
    // point_light->SetAttenuation(glm::vec3(0.025f));
    // auto point_light_node = make_unique<SceneNode>();
    // point_light_node->CreateComponent<LightComponent>(std::move(point_light));
    // point_light_node->GetTransform().SetPosition(glm::vec3(-4, 2, 5));
    // AddChild(std::move(point_light_node));

    // declare positions
    std::vector<glm::vec3> sphere_positions;
    sphere_positions.push_back(glm::vec3(0, 0, 0));
    std::vector<glm::vec3> cube_positions;
    cube_positions.push_back(glm::vec3(0, -.75, 0));

    // add spheres
    for (glm::vec3 position : sphere_positions) {
        AddSphere(position);
    }

    // add cubes
    for (glm::vec3 position : cube_positions) {
        AddCube(position);
    }

    if (add_sphere) {
        AddSphere(glm::vec3(2.0, 2.0, 0.f));
    }
    if (delete_sphere) {
        DeleteSphere(0);
    }
    }

    void AddSphere(glm::vec3 position) {
        auto sphere = make_unique<SceneNode>();
        sphere->GetTransform().SetPosition(position);
        if (mirror_) {
            sphere->CreateComponent<MaterialComponent>(mirror_material);
        } else {
            sphere->CreateComponent<MaterialComponent>(diffuse_material);
        }
        auto tracing_obj = std::make_shared<Sphere>(0.75);
        sphere->CreateComponent<TracingComponent>(tracing_obj);
        sphere_pointers.push_back(sphere.get());
        AddChild(std::move(sphere));
    }

    void AddCube(glm::vec3 position) {
        auto cube = make_unique<SceneNode>();
        cube->GetTransform().SetPosition(position);
        if (mirror_) {
            cube->CreateComponent<MaterialComponent>(mirror_material);
        } else {
            cube->CreateComponent<MaterialComponent>(diffuse_material);
        }
        auto tracing_obj = std::make_shared<Cube>();
        cube->CreateComponent<TracingComponent>(tracing_obj);
        cube_pointers.push_back(cube.get());
        AddChild(std::move(cube));
    }

    void DeleteSphere(int ind) {
        // doesn't really delete the sphere, only deletes the tracing component

        // first two children are lights
        auto sphere_point = sphere_pointers.at(ind);
        sphere_point->RemoveComponent<TracingComponent>();
    }

    void DeleteCube(int ind) {
        auto cube_point = cube_pointers.at(ind);
        cube_point->RemoveComponent<TracingComponent>();
    }

    void ChangeMaterial(int mat_id) {
        std::shared_ptr<Material> material;
        if (mat_id == 0) {
            material = diffuse_material;
        } else if (mat_id == 1) {
            material = mirror_material;
        }
        for (auto pointer : sphere_pointers) {
            pointer->RemoveComponent<MaterialComponent>();
            pointer->CreateComponent<MaterialComponent>(material);
        }
    }

    void MoveSphere(int sphere_ind, glm::vec3 position) {
        auto sphere_point = sphere_pointers.at(sphere_ind);
        sphere_point->GetTransform().SetPosition(position);
    }

    void MoveCube(int cube_ind, glm::vec3 position) {
        auto cube_point = cube_pointers.at(cube_ind);
        cube_point->GetTransform().SetPosition(position);
    }

    private:
        std::vector<SceneNode*> sphere_pointers;
        std::vector<SceneNode*> cube_pointers;
        std::shared_ptr<Material> diffuse_material;
        std::shared_ptr<Material> mirror_material;
        bool add_sphere_;
        bool delete_sphere_;
        bool mirror_;
};
}
#endif