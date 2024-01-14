#ifndef GLOO_SHADOW_SHADER_H_
#define GLOO_SHADOW_SHADER_H_

#include "ShaderProgram.hpp"

namespace GLOO {
// A simple shader for debug purposes.
class ShadowShader : public ShaderProgram {
 public:
  ShadowShader();
  void SetTargetNode(const SceneNode& node,
                     const glm::mat4& model_matrix) const override;
  void SetWorldToLightNDC(const glm::mat4& world_to_light_NDC_matrix) const;
        
  void print() override {
    std::cout << "shadow" << std::endl;
  }

 private:
  void AssociateVertexArray(VertexArray& vertex_array) const;
};
}  // namespace GLOO

#endif
