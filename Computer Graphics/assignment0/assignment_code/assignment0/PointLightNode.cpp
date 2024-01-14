#include "PointLightNode.hpp"
#include "MeshViewerApp.hpp"
#include "gloo/components/LightComponent.hpp"
#include "gloo/external.hpp"
#include "gloo/lights/PointLight.hpp"
#include "gloo/InputManager.hpp"
#include "glm/gtx/string_cast.hpp"

namespace GLOO {
PointLightNode::PointLightNode() {
  auto point_light = std::make_shared<PointLight>();
  point_light->SetDiffuseColor(glm::vec3(0.8f, 0.8f, 0.8f));
  point_light->SetSpecularColor(glm::vec3(1.0f, 1.0f, 1.0f));
  point_light->SetAttenuation(glm::vec3(1.0f, 0.09f, 0.032f));

  CreateComponent<LightComponent>(point_light);
  x_coord = 0.0f;
  y_coord = 4.0f;
  z_coord = 5.f;
  GetTransform().SetPosition(glm::vec3(x_coord, y_coord, z_coord));
}

void PointLightNode::Update(double delta_time) {
  // Up
  if (InputManager::GetInstance().IsKeyPressed(265)) {
    y_coord = y_coord + 0.1f;
  }  
  // Down
  if (InputManager::GetInstance().IsKeyPressed(264)){
    y_coord = y_coord - 0.1f;
  }  
  // Left
  if (InputManager::GetInstance().IsKeyPressed(263)) {
    x_coord = x_coord - 0.1f;
  }  
  // Right
  if (InputManager::GetInstance().IsKeyPressed(262)) {
    x_coord = x_coord + 0.1f;
  }
 
  glm::vec3 new_position = glm::vec3(x_coord, y_coord, z_coord);
  SetPosition(new_position);
  // std::cout << glm::to_string(new_position) <<std::endl;
}

glm::vec3 PointLightNode::GetPosition() {
  return glm::vec3(x_coord, y_coord, z_coord);
}

void PointLightNode::SetPosition(glm::vec3 new_position) {
  GetTransform().SetPosition(new_position);
}

}