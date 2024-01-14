#ifndef GLOO_RENDERER_H_
#define GLOO_RENDERER_H_

#include "components/LightComponent.hpp"
#include "components/RenderingComponent.hpp"
#include "gl_wrapper/Texture.hpp"
#include "shaders/PlainTextureShader.hpp"
#include "gl_wrapper/Framebuffer.hpp"

#include <unordered_map>


namespace GLOO {
class Scene;
class Application;
class Renderer {
 public:
  Renderer(Application& application);
  void Render(const Scene& scene) const;

 private:
  using RenderingInfo = std::vector<std::pair<RenderingComponent*, glm::mat4>>;
  void RenderScene(const Scene& scene) const;
  void SetRenderingOptions() const;

  RenderingInfo RetrieveRenderingInfo(const Scene& scene) const;
  static void RecursiveRetrieve(const SceneNode& node,
                                RenderingInfo& info,
                                const glm::mat4& model_matrix);
  std::unique_ptr<VertexObject> quad_;

  void RenderTexturedQuad(const Texture& texture, bool is_depth) const;
  void DebugShadowMap() const;
  void RenderShadow(LightComponent& light, RenderingInfo rendering_info) const;

  std::unique_ptr<Texture> shadow_depth_tex_;
  std::unique_ptr<PlainTextureShader> plain_texture_shader_;
  Application& application_;
  Framebuffer shadow_depth_buffer;
};
}  // namespace GLOO

#endif
