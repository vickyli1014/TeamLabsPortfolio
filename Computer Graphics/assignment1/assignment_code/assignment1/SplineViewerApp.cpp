#include "SplineViewerApp.hpp"

#include <fstream>

#include "gloo/cameras/ArcBallCameraNode.hpp"
#include "gloo/lights/AmbientLight.hpp"
#include "gloo/lights/PointLight.hpp"
#include "gloo/components/LightComponent.hpp"
#include "glm/gtx/string_cast.hpp"

#include "CurveNode.hpp"
#include "PatchNode.hpp"

namespace GLOO {

SplineViewerApp::SplineViewerApp(const std::string& app_name,
                                 glm::ivec2 window_size,
                                 const std::string& filename)
    : Application(app_name, window_size), filename_(filename) {
}

void SplineViewerApp::SetupScene() {
  SceneNode& root = scene_->GetRootNode();

  LoadFile(filename_, root);

  auto camera_node = make_unique<ArcBallCameraNode>();
  scene_->ActivateCamera(camera_node->GetComponentPtr<CameraComponent>());
  root.AddChild(std::move(camera_node));

  auto ambient_light = std::make_shared<AmbientLight>();
  ambient_light->SetAmbientColor(glm::vec3(0.7f));
  root.CreateComponent<LightComponent>(ambient_light);

  auto point_light = std::make_shared<PointLight>();
  point_light->SetDiffuseColor(glm::vec3(0.9f, 0.9f, 0.9f));
  point_light->SetSpecularColor(glm::vec3(1.0f, 1.0f, 1.0f));
  point_light->SetAttenuation(glm::vec3(1.0f, 0.09f, 0.032f));
  auto point_light_node = make_unique<SceneNode>();
  point_light_node->CreateComponent<LightComponent>(point_light);
  point_light_node->GetTransform().SetPosition(glm::vec3(0.0f, 4.0f, 5.f));
  root.AddChild(std::move(point_light_node));
}

void SplineViewerApp::LoadFile(const std::string& filename, SceneNode& root) {
  std::fstream fs(GetAssetDir() + filename);
  if (!fs) {
    std::cerr << "ERROR: Unable to open file " + filename + "!" << std::endl;
    return;
  }

  std::string spline_type;
  std::getline(fs, spline_type);

  std::vector<glm::vec3> control_points;
  std::string line;
  for (size_t i = 0; std::getline(fs, line); i++) {
    std::stringstream ss(line);
    float x, y, z;
    ss >> x >> y >> z;
    control_points.push_back(glm::vec3(x, y, z));
  }
  // control_points.push_back(glm::vec3(0, 0, 0));

  if (spline_type == "Bezier curve") {
    std::cout << "Bezier \n" << std::endl;
    for (int i=0; i<control_points.size()-1; i+=3) {
      std::vector<glm::vec3> curve_control_points;
      for (int j=i; j<=i+3; j++) {
        curve_control_points.push_back(control_points[j]);
    std::cout << "j:" << j << glm::to_string(control_points[j]) << std::endl;
      }
    std::cout << "curve:" << glm::to_string(curve_control_points[0]) << std::endl;
      auto curve_node = make_unique<CurveNode>(spline_type, curve_control_points);
      root.AddChild(std::move(curve_node));
    }
  } else if (spline_type == "B-Spline curve") {
    std::cout << "Bspline \n" << std::endl;
    for (int i=0; i<control_points.size()-3; i++) {
      std::vector<glm::vec3> curve_control_points;
      for (int j=i; j<=i+3; j++) {
        curve_control_points.push_back(control_points[j]);
      }
      auto curve_node = make_unique<CurveNode>(spline_type, curve_control_points);
      root.AddChild(std::move(curve_node));
    }
  } else if (spline_type == "Bezier patch") {
    std::cout << "Bezier patch " << std::endl;
    for (int i=0; i<control_points.size(); i+=16) {
      std::vector<glm::vec3> patch_control_points;
      for (int j=i; j<i+16; j++) {
        patch_control_points.push_back(control_points[j]);
      }
      auto patch_node = make_unique<PatchNode>(spline_type, patch_control_points);
      root.AddChild(std::move(patch_node));
      // break;
    }

  }

  // auto curve_node = make_unique<CurveNode>(spline_type, control_points);
  // root.AddChild(std::move(curve_node));


  // TODO: set up patch or curve nodes here.
  // The first line of the user-specified file is spline_type, and the specified
  // control points are in control_points, a std::vector of glm::vec3 objects.
  // Depending on the specified spline type, create the appropriate node(s)
  // parameterized by the control points.
}
}  // namespace GLOO
