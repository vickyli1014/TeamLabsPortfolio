#include "SphereNode.hpp"
#include "PathTracerViewerApp.hpp"
#include "gloo/shaders/PhongShader.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "gloo/MeshLoader.hpp"
#include "gloo/InputManager.hpp"
#include "glm/gtx/string_cast.hpp"
#include "gloo/debug/PrimitiveFactory.hpp"

namespace GLOO {
SphereNode::SphereNode() {
// Constructor
    std::shared_ptr<PhongShader> shader = std::make_shared<PhongShader>();
    std::shared_ptr<VertexObject> sphere_mesh_ = PrimitiveFactory::CreateSphere(0.12f, 25, 25);
    if (sphere_mesh_ == nullptr) {
        return;
    }
    CreateComponent<ShadingComponent>(shader);
    CreateComponent<RenderingComponent>(sphere_mesh_);
    GetTransform().SetPosition(glm::vec3(0.f, 0.f, 0.f));

    auto sphere_material = std::make_shared<Material>(glm::vec3(1.f, 0.f, 0.f), glm::vec3(1.f, 0.f, 0.f), glm::vec3(1.f, 0.f, 0.f), 0);
    CreateComponent<MaterialComponent>(sphere_material);
}
}
