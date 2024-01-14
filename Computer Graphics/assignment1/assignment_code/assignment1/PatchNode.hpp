#ifndef PATCH_NODE_H_
#define PATCH_NODE_H_

#include <string>
#include <vector>

#include "gloo/SceneNode.hpp"
#include "gloo/VertexObject.hpp"
#include "gloo/shaders/ShaderProgram.hpp"

#include "CurveNode.hpp"

namespace GLOO {
struct PatchPoint {
  glm::vec3 P;
  glm::vec3 N;
};

class PatchNode : public SceneNode {
 public:
  PatchNode(std::string spline_type, std::vector<glm::vec3> control_points);

 private:
  void PlotPatch(std::string spline_type);

  std::vector<glm::mat4> Gs_;
  SplineBasis spline_basis_;
  std::string spline_type_;

  std::shared_ptr<VertexObject> patch_mesh_;
  std::shared_ptr<ShaderProgram> shader_;

  glm::mat4 x_coords;
  glm::mat4 y_coords;
  glm::mat4 z_coords;

  const int N_SUBDIV_ = 50;
};
}  // namespace GLOO

#endif
