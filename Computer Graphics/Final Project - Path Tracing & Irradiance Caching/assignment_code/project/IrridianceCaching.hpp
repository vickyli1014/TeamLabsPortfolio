#ifndef IRRIDIANCE_CACHING_H_
#define IRRIDIANCE_CACHING_H_

#include "gloo/Scene.hpp"
#include "gloo/Material.hpp"
#include "gloo/lights/LightBase.hpp"
#include "gloo/components/LightComponent.hpp"

#include "Ray.hpp"
#include "HitRecord.hpp"
#include "TracingComponent.hpp"
#include "CubeMap.hpp"
#include "PerspectiveCamera.hpp"

#include <glm/gtx/string_cast.hpp>

namespace GLOO {
class IrridianceCaching {
 public:
  IrridianceCaching(const CameraSpec& camera_spec,
         const glm::ivec2& image_size,
         size_t max_bounces,
         const glm::vec3& background_color,
         const CubeMap* cube_map,
         bool shadows_enabled)
      : camera_(camera_spec),
        image_size_(image_size),
        max_bounces_(max_bounces),
        background_color_(background_color),
        cube_map_(cube_map),
        shadows_enabled_(shadows_enabled),
        scene_ptr_(nullptr) {
  }
  void Render(const Scene& scene, const std::string& output_file);

 private:
  glm::vec3 TraceDirectRay(const Ray& ray, size_t bounces, HitRecord& record) const;

  glm::vec3 GetBackgroundColor(const glm::vec3& direction) const;
  glm::vec2 ScalePixel(int x, int y) const;

  float HarmonicMean(float n, glm::vec3 position, glm::vec3 hit_normal);
  HitRecord RandomHit(glm::vec3 hit_position, glm::vec3 hit_normal);
  glm::vec3 IndirectIllumination(const Ray& ray, HitRecord& record);
  glm::vec3 TracePath(const Ray& ray,
                           size_t bounces,
                           HitRecord& record) const;

  PerspectiveCamera camera_;
  glm::ivec2 image_size_;
  size_t max_bounces_;

  std::vector<TracingComponent*> tracing_components_;
  std::vector<LightComponent*> light_components_;
  glm::vec3 background_color_;
  const CubeMap* cube_map_;
  bool shadows_enabled_;


  struct Irridiance {
    glm::vec3 position;
    glm::vec3 normal;
    glm::vec3 irr_val;
    float harmonic_mean_distance;
  };
  std::vector<Irridiance> cache_;

  const Scene* scene_ptr_;
};
}  // namespace GLOO

#endif
