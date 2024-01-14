#ifndef CURVE_NODE_H_
#define CURVE_NODE_H_

#include <string>
#include <vector>

#include "gloo/SceneNode.hpp"
#include "gloo/VertexObject.hpp"
#include "gloo/shaders/ShaderProgram.hpp"

namespace GLOO {

enum class SplineBasis { Bezier, BSpline };

struct CurvePoint {
  glm::vec3 P;
  glm::vec3 T;
};

class CurveNode : public SceneNode {
 public:
  CurveNode(std::string spline_type, std::vector<glm::vec3> control_points);
  void Update(double delta_time) override;

 private:
  void ToggleSplineBasis();
  void ConvertGeometry(std::string direction);
  CurvePoint EvalCurve(float t);
  void InitCurve();
  void PlotCurve();
  void PlotControlPoints();
  void PlotTangentLine();

  glm::mat4 spline_basis_;

  std::string spline_type_;
  std::vector<glm::vec3> control_points_;
  glm::mat4x3 geometry_matrix;
  std::vector<SceneNode*> control_point_nodes;

  std::shared_ptr<VertexObject> sphere_mesh_;
  std::shared_ptr<VertexObject> curve_polyline_;
  std::shared_ptr<VertexObject> tangent_line_;

  std::shared_ptr<ShaderProgram> shader_;
  std::shared_ptr<ShaderProgram> polyline_shader_;

  const glm::mat4 BBezier;
  const glm::mat4 BBSpline;

  glm::vec3 *sphere_color_pointer;
  glm::vec3 Bezier_color = glm::vec3(1.f, 0.f, 0.f);
  glm::vec3 BSpline_color = glm::vec3(0.f, 1.f, 0.f);

  const int N_SUBDIV_ = 50;
};
}  // namespace GLOO

#endif
