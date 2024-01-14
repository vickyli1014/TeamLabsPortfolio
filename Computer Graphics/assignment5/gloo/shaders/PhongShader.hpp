#ifndef GLOO_PHONG_SHADER_H_
#define GLOO_PHONG_SHADER_H_

#include "ShaderProgram.hpp"

namespace GLOO {
class PhongShader : public ShaderProgram {
 public:
  PhongShader();
  void SetTargetNode(const SceneNode& node,
                     const glm::mat4& model_matrix) const override;
  void SetCamera(const CameraComponent& camera) const override;
  void SetLightSource(const LightComponent& componentt) const override;

  void SetShadowMapping(
      const Texture& shadow_texture,
      const glm::mat4& world_to_light_ndc_matrix) const override;

  void print() override {
    std::cout << "phong" << std::endl;
  }

 private:
  void AssociateVertexArray(VertexArray& vertex_array) const;
};
}  // namespace GLOO

#endif
