#ifndef SKELETON_NODE_H_
#define SKELETON_NODE_H_

#include "gloo/SceneNode.hpp"
#include "gloo/VertexObject.hpp"
#include "gloo/shaders/ShaderProgram.hpp"
#include "gloo/MeshData.hpp"

#include <vector>

namespace GLOO {
class SkeletonNode : public SceneNode {
 public:
  enum class DrawMode { Skeleton, SSD };
  struct EulerAngle {
    float rx, ry, rz;
  };

  SkeletonNode(const std::string& filename);
  void LinkRotationControl(const std::vector<EulerAngle*>& angles);
  void Update(double delta_time) override;
  void OnJointChanged();

 private:
  void LoadAllFiles(const std::string& prefix);
  void LoadSkeletonFile(const std::string& path);
  void LoadMeshFile(const std::string& filename);
  void LoadAttachmentWeights(const std::string& path);

  void ToggleDrawMode();
  void DecorateTree();

  void CalculateBInverse();
  void CalculateT();
  void PlotSkin();
  void UpdateSkinPosition();
  void ComputeNormals();

  // std::vector<std::unique_ptr<SceneNode>> joint_node_ptrs;
  std::vector<SceneNode*> joint_node_ptrs;
  std::unique_ptr<SceneNode> root_;
  std::shared_ptr<VertexObject> bind_mesh;
  std::vector<std::vector<float>> weights;
  std::vector<SceneNode*> sphere_nodes_ptrs_;
  std::vector<SceneNode*> cylinder_nodes_ptrs_;
  std::vector<glm::mat4> B_inverse_;
  std::vector<glm::mat4> T_;
  PositionArray original_position;


  DrawMode draw_mode_;
  SceneNode* skin_node_pointer;
  // Euler angles of the UI sliders.
  std::vector<EulerAngle*> linked_angles_;
};
}  // namespace GLOO

#endif
