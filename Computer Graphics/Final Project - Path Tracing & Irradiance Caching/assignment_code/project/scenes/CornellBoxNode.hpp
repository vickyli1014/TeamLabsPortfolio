#ifndef CORNELL_BOX_NODE_H_
#define CORNELL_BOX_NODE_H_

#include "gloo/SceneNode.hpp"
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
#include "hittable/Cube.hpp"
#include "hittable/Plane.hpp"

namespace GLOO {
class CornellBoxNode : public SceneNode {
public:
    CornellBoxNode() {
        // ambient light
        // auto ambient_light = std::make_shared<AmbientLight>();
        // ambient_light->SetAmbientColor(glm::vec3(1.f));
        // auto ambient_light_node = make_unique<SceneNode>();
        // ambient_light_node->CreateComponent<LightComponent>(std::move(ambient_light));
        // AddChild(std::move(ambient_light_node));

        // // directional light
        // auto point_light = std::make_shared<PointLight>();
        // point_light->SetDiffuseColor(glm::vec3(0.5f));
        // point_light->SetSpecularColor(glm::vec3(0.5f));
        // point_light->SetAttenuation(glm::vec3(0.08f));
        // auto point_light_node = make_unique<SceneNode>();
        // point_light_node->CreateComponent<LightComponent>(std::move(point_light));
        // point_light_node->GetTransform().SetPosition(glm::vec3(0, 4, 0));
        // AddChild(std::move(point_light_node));

        // materials
        white_material = std::make_shared<Material>();
        white_material->SetAmbientColor(glm::vec3(0.5));
        white_material->SetDiffuseColor(glm::vec3(0.5));
        white_material->SetSpecularColor(glm::vec3(0.3));

        blue_material = std::make_shared<Material>();
        blue_material->SetAmbientColor(glm::vec3(0.1, 0.5, 1.0));
        blue_material->SetDiffuseColor(glm::vec3(0.1, 0.5, 1.0));
        blue_material->SetSpecularColor(glm::vec3(0.03));
        // blue_material->SetShininess(30);

        yellow_material = std::make_shared<Material>();
        yellow_material->SetAmbientColor(glm::vec3(1.0, 0.9, 0.1));
        yellow_material->SetDiffuseColor(glm::vec3(1.0, 0.9, 0.1));
        yellow_material->SetSpecularColor(glm::vec3(0.03));
        // yellow_material->SetShininess(30);

        // make six planes
        normals_.push_back(glm::vec3(-1, 0, 0));
        normals_.push_back(glm::vec3(0, -1, 0));
        // normals_.push_back(glm::vec3(0, 0, -1));
        normals_.push_back(glm::vec3(1, 0, 0));
        normals_.push_back(glm::vec3(0, 1, 0));
        normals_.push_back(glm::vec3(0, 0, 1));

        for (int i=0; i < normals_.size(); i++) {
            auto side = make_unique<SceneNode>();
            if (normals_[i] == glm::vec3(1, 0, 0)) {
                side->CreateComponent<MaterialComponent>(yellow_material);
            } else if (normals_[i] == glm::vec3(-1, 0, 0)) {
                side->CreateComponent<MaterialComponent>(blue_material);
            } else {
                side->CreateComponent<MaterialComponent>(white_material);
            }
            side->GetTransform().SetPosition(glm::vec3(0.f));
            auto tracing_obj = std::make_shared<Plane>(normals_[i], displacement);
            side->CreateComponent<TracingComponent>(tracing_obj);
            side_pointers.push_back(side.get());
            AddChild(std::move(side));
        }
    
    }

private:
    std::shared_ptr<Material> white_material;
    std::shared_ptr<Material> blue_material;
    std::shared_ptr<Material> yellow_material;
    std::vector<glm::vec3> normals_;
    std::vector<glm::vec3> positions_;
    std::vector<SceneNode*> side_pointers;
    float displacement = -4;
};
}
#endif