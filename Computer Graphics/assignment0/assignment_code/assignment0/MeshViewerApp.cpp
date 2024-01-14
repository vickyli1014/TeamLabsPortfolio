#include "MeshViewerApp.hpp"

#include "glm/gtx/string_cast.hpp"

#include "gloo/shaders/PhongShader.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "gloo/components/CameraComponent.hpp"
#include "gloo/components/LightComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/MeshLoader.hpp"
#include "gloo/lights/PointLight.hpp"
#include "gloo/lights/AmbientLight.hpp"
#include "gloo/lights/DirectionalLight.hpp"
#include "gloo/cameras/BasicCameraNode.hpp"
#include "TeapotNode.hpp"
#include "PointLightNode.hpp"

namespace GLOO {
MeshViewerApp::MeshViewerApp(const std::string& app_name,
                             glm::ivec2 window_size)
    : Application(app_name, window_size) {
}

void MeshViewerApp::SetupScene() {
  SceneNode& root = scene_->GetRootNode();

  auto camera_node = make_unique<BasicCameraNode>();
  camera_node->GetTransform().SetPosition(glm::vec3(0.0f, 1.5f, 10.0f));
  scene_->ActivateCamera(camera_node->GetComponentPtr<CameraComponent>());
  root.AddChild(std::move(camera_node));

  auto ambient_light = std::make_shared<AmbientLight>();
  ambient_light->SetAmbientColor(glm::vec3(0.2f));
  root.CreateComponent<LightComponent>(ambient_light);

  auto directional_light = std::make_shared<DirectionalLight>();
  directional_light->SetDiffuseColor(glm::vec3(0.8f, 0.8f, 0.8f));
  directional_light->SetSpecularColor(glm::vec3(1.0f, 1.0f, 1.0f));
  directional_light->SetDirection(glm::vec3(0.0f, 0.0f, -10.0f));
  root.CreateComponent<LightComponent>(directional_light);
  root.AddChild(make_unique<PointLightNode>());
  root.AddChild(make_unique<TeapotNode>());
}
}  // namespace GLOO
