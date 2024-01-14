#include "SimulationApp.hpp"

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
#include "gloo/cameras/ArcBallCameraNode.hpp"
#include "gloo/debug/AxisNode.hpp"
#include "gloo/debug/PrimitiveFactory.hpp"

#include "SimpleParticleNode.hpp"
#include "PendulumNode.hpp"
#include "ClothNode.hpp"
#include "ParticleState.hpp"
#include "SimpleParticleSystem.hpp"


namespace GLOO {
SimulationApp::SimulationApp(const std::string& app_name,
                             glm::ivec2 window_size,
                             IntegratorType integrator_type,
                             float integration_step)
    : Application(app_name, window_size),
      integrator_type_(integrator_type),
      integration_step_(integration_step) {
  // TODO: remove the following two lines and use integrator type and step to
  // create integrators; the lines below exist only to suppress compiler
  // warnings.
  UNUSED(integrator_type_);
  UNUSED(integration_step_);
}

void SimulationApp::SetupScene() {
  SceneNode& root = scene_->GetRootNode();

  auto camera_node = make_unique<ArcBallCameraNode>(45.f, 0.75f, 5.0f);
  scene_->ActivateCamera(camera_node->GetComponentPtr<CameraComponent>());
  root.AddChild(std::move(camera_node));

  root.AddChild(make_unique<AxisNode>('A'));

  auto ambient_light = std::make_shared<AmbientLight>();
  ambient_light->SetAmbientColor(glm::vec3(0.2f));
  root.CreateComponent<LightComponent>(ambient_light);

  auto point_light = std::make_shared<PointLight>();
  point_light->SetDiffuseColor(glm::vec3(0.8f, 0.8f, 0.8f));
  point_light->SetSpecularColor(glm::vec3(1.0f, 1.0f, 1.0f));
  point_light->SetAttenuation(glm::vec3(1.0f, 0.09f, 0.032f));
  auto point_light_node = make_unique<SceneNode>();
  point_light_node->CreateComponent<LightComponent>(point_light);
  point_light_node->GetTransform().SetPosition(glm::vec3(0.0f, 2.0f, 4.f));
  root.AddChild(std::move(point_light_node));

  auto shader_ = std::make_shared<PhongShader>();
  std::shared_ptr<GLOO::VertexObject> sphere_mesh_ = PrimitiveFactory::CreateSphere(0.05f, 25, 25);

  // simple
  glm::vec3 position(0.1f);
  ParticleState simple_state = {std::vector<glm::vec3>(1, position), std::vector<glm::vec3>(1, position)};
  auto simple_particle_node = make_unique<SimpleParticleNode>(simple_state, integrator_type_, integration_step_);
  simple_particle_node->CreateComponent<ShadingComponent>(shader_);
  simple_particle_node->CreateComponent<RenderingComponent>(sphere_mesh_);
  root.AddChild(std::move(simple_particle_node));

  // pendulum
  glm::vec3 particle1(0.0f);
  glm::vec3 particle2(0.0f, -0.15f, 0.0f);
  glm::vec3 particle3(0.0f, -0.2f, 0.0f);
  glm::vec3 particle4(0.0f, -0.25f, 0.0f);
  std::vector<glm::vec3> positions;
  positions.push_back(particle1); positions.push_back(particle2); positions.push_back(particle3); positions.push_back(particle4);
  // positions.push_back(particle1); positions.push_back(particle2);
  std::vector<glm::vec3> velocities;
  velocities.push_back(particle1); velocities.push_back(particle2); velocities.push_back(particle3); velocities.push_back(particle4);
  // velocities.push_back(particle1); velocities.push_back(particle2);
  ParticleState pend_state = {positions, velocities};
  auto pendulum_node = make_unique<PendulumNode>(pend_state, integrator_type_, integration_step_);
  pendulum_node->GetTransform().SetPosition(glm::vec3(-1.f, 2.f, 0.f));
  root.AddChild(std::move(pendulum_node));
  
  // cloth
  auto cloth_node = make_unique<ClothNode>(integrator_type_, integration_step_);
  cloth_node->GetTransform().SetPosition(glm::vec3(2.f, 2.f, 0.f));
  root.AddChild(std::move(cloth_node));

}
}  // namespace GLOO
