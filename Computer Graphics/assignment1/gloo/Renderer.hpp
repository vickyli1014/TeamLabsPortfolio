#ifndef GLOO_RENDERER_H_
#define GLOO_RENDERER_H_

#include "components/LightComponent.hpp"
#include "components/RenderingComponent.hpp"



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


  Application& application_;
};
}  // namespace GLOO

#endif
