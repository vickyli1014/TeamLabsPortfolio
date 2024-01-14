#include "TeapotNode.hpp"
#include "MeshViewerApp.hpp"
#include "gloo/shaders/PhongShader.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "gloo/MeshLoader.hpp"
#include "gloo/InputManager.hpp"
#include "glm/gtx/string_cast.hpp"

namespace GLOO {
TeapotNode::TeapotNode() {
// Constructor
    std::shared_ptr<PhongShader> shader = std::make_shared<PhongShader>();
    std::shared_ptr<VertexObject> mesh =
        MeshLoader::Import("assignment0/teapot.obj").vertex_obj;
    if (mesh == nullptr) {
        return;
    }
    CreateComponent<ShadingComponent>(shader);
    CreateComponent<RenderingComponent>(mesh);
    GetTransform().SetPosition(glm::vec3(0.f, 0.f, 0.f));
    GetTransform().SetRotation(glm::vec3(1.0f, 0.0f, 0.0f), 0.3f);

    CreateComponent<MaterialComponent>(
        std::make_shared<Material>(Material::GetDefault()));

    c_count = 0;
}

void TeapotNode::Update(double delta_time) {
// Update
    static bool prev_released = true;
    if (InputManager::GetInstance().IsKeyPressed('C')) {
        if (prev_released) {
            ToggleColor();
            c_count++;
        }
        prev_released = false;
    } else if (InputManager::GetInstance().IsKeyReleased('C')) {
        prev_released = true;
    }
}

void TeapotNode::ToggleColor() {
    auto material_component_ptr = GetComponentPtr<MaterialComponent>();
    if (material_component_ptr == nullptr) {
        return;
    }

    Material& material = material_component_ptr->GetMaterial();
    if (c_count % 2 == 1) {
        glm::vec3 default_ambient = material.GetDefault().GetAmbientColor();
        material.SetAmbientColor(default_ambient);
        material.SetDiffuseColor(default_ambient);
    } else {
        glm::vec3 other_ambient = glm::vec3(0.1f, 0.2f, 0.5f);
        material.SetAmbientColor(other_ambient);
        material.SetDiffuseColor(other_ambient);
    }
}

}
