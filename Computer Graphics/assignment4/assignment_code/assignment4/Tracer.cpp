#include "Tracer.hpp"

#include <glm/gtx/string_cast.hpp>
#include <stdexcept>
#include <algorithm>

#include "gloo/Transform.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/lights/AmbientLight.hpp"

#include "gloo/Image.hpp"
#include "Illuminator.hpp"

#include "Ray.hpp"
#include "Illuminator.hpp"

namespace GLOO {
void Tracer::Render(const Scene& scene, const std::string& output_file) {
  scene_ptr_ = &scene;

  auto& root = scene_ptr_->GetRootNode();
  tracing_components_ = root.GetComponentPtrsInChildren<TracingComponent>();
  light_components_ = root.GetComponentPtrsInChildren<LightComponent>();

  Image image(image_size_.x, image_size_.y);

  for (auto tracer: tracing_components_) {
    world_to_local.push_back(glm::inverse(tracer->GetNodePtr()->GetTransform().GetLocalToWorldMatrix()));
  }

  for (size_t y = 0; y < image_size_.y; y++) {
    for (size_t x = 0; x < image_size_.x; x++) {
      Ray ray = camera_.GenerateRay(glm::vec2(x/(image_size_.x/2.0f)-1, y/(image_size_.y/2.0f)-1));
      HitRecord hr = HitRecord();
      // find color using TraceRay and save it to the pixel
      glm::vec3 color = TraceRay(ray, max_bounces_, hr);
      image.SetPixel(x, y, color);
      std::cout << "end color: " << glm::to_string(color) << std::endl;
      std::cout << "original ray: " << glm::to_string(ray.GetDirection()) << std::endl;
      return;
      // TODO: For each pixel, cast a ray, and update its value in the image.
      if (y < 100) {
        std::cout << glm::to_string(color) << std::endl;
        std::cout << x << " " << y << std::endl;
      }
    }
  }
  if (output_file.size())
    image.SavePNG(output_file);
}

SceneNode* Tracer::FindIntersection(const Ray& ray,
                           HitRecord& record) const {
  SceneNode* node_ptr = nullptr;
  for (int i=0; i<tracing_components_.size(); i++) {
    auto tracer = tracing_components_[i];
    auto transformation = world_to_local[i];
    Ray ray_local = Ray(ray.GetOrigin(), ray.GetDirection());
    ray_local.ApplyTransform(transformation);
    if (tracer->GetHittable().Intersect(ray_local, camera_.GetTMin(), record)) {
      node_ptr = tracer->GetNodePtr();
    }
  }
  return node_ptr;
}

glm::vec3 Tracer::TraceRay(const Ray& ray,
                           size_t bounces,
                           HitRecord& record) const {
  // TODO: Compute the color for the cast ray.
  if (bounces > max_bounces_) {
    return glm::vec3(0.f);
  }

  SceneNode* node_ptr = FindIntersection(ray, record);
  if (node_ptr == nullptr) {
    std::cout << "nonintersect ray: " << glm::to_string(ray.GetDirection()) << std::endl;
    std::cout << "background color: " << glm::to_string(GetBackgroundColor(ray.GetDirection())) << std::endl;
    return GetBackgroundColor(ray.GetDirection());
  }

  glm::vec3 k_diffuse = node_ptr->GetComponentPtr<MaterialComponent>()->GetMaterial().GetDiffuseColor();
  glm::vec3 k_specular = node_ptr->GetComponentPtr<MaterialComponent>()->GetMaterial().GetSpecularColor();
  glm::vec3 color(0.f);
  glm::vec3 hit_pos = ray.GetOrigin() + ray.GetDirection() * record.time;
  glm::mat4 local_to_world_transformation = node_ptr->GetTransform().GetLocalToWorldMatrix();
  glm::vec3 perfect_reflection;
  record.normal = glm::transpose(glm::inverse(local_to_world_transformation)) * glm::vec4(record.normal, 1.0f);
  record.normal = glm::normalize(record.normal);
  
  // for every light
  float epsilon = 0.01f;
  for (auto light : light_components_) {
    glm::vec3 dir_to_light; glm::vec3 intensity; float dist_to_light;
    Illuminator::GetIllumination(*light, hit_pos, dir_to_light, intensity, dist_to_light);
    Ray shadow_ray(hit_pos + epsilon * dir_to_light, dir_to_light);
    bool direct_light = true;

    if (shadows_enabled_) {
      HitRecord shadow_hr;
      SceneNode* intersection_ptr = FindIntersection(shadow_ray, shadow_hr);
      if (intersection_ptr != nullptr && glm::length(hit_pos - shadow_ray.At(shadow_hr.time)) < dist_to_light) 
        direct_light = false;
    }

    if (light->GetLightPtr()->GetType() == LightType::Ambient){
        auto ambient_ptr = static_cast<AmbientLight*>(light->GetLightPtr());
        auto ambient = ambient_ptr->GetAmbientColor() * node_ptr->GetComponentPtr<MaterialComponent>()->GetMaterial().GetDiffuseColor();
        color += ambient;
    } else {
      // color += diffuse shading
      float clamp_diff = glm::dot(dir_to_light, record.normal);
      clamp_diff = fmax(clamp_diff, 0.f);
      auto illum_diffuse = clamp_diff * intensity * k_diffuse;

      // color += specular shading
      auto shininess = node_ptr->GetComponentPtr<MaterialComponent>()->GetMaterial().GetShininess();
      auto surface_to_eye = ray.GetDirection();
      perfect_reflection = surface_to_eye - (2 * glm::dot(surface_to_eye, record.normal) * record.normal);
      float clamp_spec = glm::dot(dir_to_light, perfect_reflection);
      clamp_spec = fmax(clamp_spec, 0.f);
      auto illum_specular = pow(clamp_spec, shininess) * intensity * k_specular;

      if (direct_light) {
        color += illum_diffuse;
        color += illum_specular;
      }

    }
  }
  // color += indirect shading
  perfect_reflection = glm::normalize(perfect_reflection);
  Ray reflection_ray(hit_pos + epsilon*perfect_reflection, perfect_reflection);
  auto reflection_record = HitRecord();
  auto indirect = TraceRay(reflection_ray, bounces-1, reflection_record);
  // std::cout << bounces << " " << glm::to_string(indirect) << std::endl;
  // std::cout << glm::to_string(indirect) << std::endl;
  std::cout << "color: " << glm::to_string(color) << std::endl;
  std::cout << "kspecular: " << glm::to_string(k_specular) << std::endl;
  color += k_specular * indirect;
  return color;
}


glm::vec3 Tracer::GetBackgroundColor(const glm::vec3& direction) const {
  if (cube_map_ != nullptr) {
    return cube_map_->GetTexel(direction);
  } else
    return background_color_;
}


}  // namespace GLOO
