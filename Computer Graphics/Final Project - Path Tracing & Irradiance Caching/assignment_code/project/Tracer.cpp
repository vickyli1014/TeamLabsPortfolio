#include "Tracer.hpp"

#include <glm/gtx/string_cast.hpp>
#include <stdexcept>
#include <algorithm>
#include <math.h>

#include "gloo/Transform.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/lights/AmbientLight.hpp"

#include "gloo/Image.hpp"
#include "Illuminator.hpp"

namespace GLOO {
void Tracer::Render(const Scene& scene, const std::string& output_file) {
  scene_ptr_ = &scene;

  auto& root = scene_ptr_->GetRootNode();
  tracing_components_ = root.GetComponentPtrsInChildren<TracingComponent>();
  light_components_ = root.GetComponentPtrsInChildren<LightComponent>();

  Image image(image_size_.x, image_size_.y);

  for (size_t y = 0; y < image_size_.y; y++) {
    for (size_t x = 0; x < image_size_.x; x++) {
      Ray curr_ray = camera_.GenerateRay(ScalePixel(x, y));
      HitRecord curr_record = HitRecord();
      glm::vec3 color = TraceRay(curr_ray, max_bounces_, curr_record);
      image.SetPixel(x, y, color); 
    }
  }

  if (output_file.size())
    image.SavePNG(output_file);
}


glm::vec3 Tracer::TraceRay(const Ray& ray,
                           size_t bounces,
                           HitRecord& record) const {
  Ray closest_hit_ray = Ray(ray.GetOrigin(), ray.GetDirection());
  int closest_hit_ind = -1;
  for (int i=0; i < tracing_components_.size(); i++) {
    Ray ray_copy = Ray(ray.GetOrigin(), ray.GetDirection());
    glm::mat4 transform_matrix = tracing_components_[i]->GetNodePtr()->GetTransform().GetLocalToWorldMatrix();
    ray_copy.ApplyTransform(glm::inverse(transform_matrix));
    bool hits_component = tracing_components_[i]->GetHittable().Intersect(ray_copy, camera_.GetTMin(), record);
    if (hits_component) {
      closest_hit_ind = i;
      closest_hit_ray = ray_copy;
    }
  }

  // if there was a hit 
  if (closest_hit_ind != -1) {
    // transform the position and normal back to normal position 
    glm::mat4 transform_matrix = tracing_components_[closest_hit_ind]->GetNodePtr()->GetTransform().GetLocalToWorldMatrix();
    glm::vec3 hit_position_before = closest_hit_ray.At(record.time);
    glm::vec4 hit_position_transformed = transform_matrix * glm::vec4(hit_position_before.x, hit_position_before.y, hit_position_before.z, 1.0);
    glm::vec3 hit_position = glm::vec3(hit_position_transformed[0], hit_position_transformed[1], hit_position_transformed[2]);
    glm::vec4 hit_normal_tranformed = glm::transpose(glm::inverse(transform_matrix)) * glm::vec4(record.normal.x, record.normal.y, record.normal.z, 0.f);
    glm::vec3 hit_normal = glm::normalize(glm::vec3(hit_normal_tranformed[0], hit_normal_tranformed[1], hit_normal_tranformed[2]));

    // direct illumination 
    glm::vec3 diffuse_illumination(0.f);
    glm::vec3 specular_illumination(0.f);
    glm::vec3 ambient_illumination(0.f);
    glm::vec3 k_diffuse = tracing_components_[closest_hit_ind]->GetNodePtr()->GetComponentPtr<MaterialComponent>()->GetMaterial().GetDiffuseColor();
    glm::vec3 k_specular = tracing_components_[closest_hit_ind]->GetNodePtr()->GetComponentPtr<MaterialComponent>()->GetMaterial().GetSpecularColor();
    glm::vec3 k_ambient = tracing_components_[closest_hit_ind]->GetNodePtr()->GetComponentPtr<MaterialComponent>()->GetMaterial().GetAmbientColor();
    float shininess_specular = tracing_components_[closest_hit_ind]->GetNodePtr()->GetComponentPtr<MaterialComponent>()->GetMaterial().GetShininess();
    glm::vec3 eye_to_surface_reflection = glm::normalize(glm::reflect(closest_hit_ray.GetDirection(), hit_normal));
    for (int i=0; i < light_components_.size(); i++) {
      glm::vec3 dir_to_light(0.f);
      float dist_to_light = 0.f;
      glm::vec3 intensity(0.f);

      if (light_components_[i]->GetLightPtr()->GetType() == LightType::Ambient) {
        // ambient shading
        auto ambient_light_ptr = static_cast<AmbientLight*>(light_components_[i]->GetLightPtr());
        ambient_illumination += ambient_light_ptr->GetAmbientColor() * k_ambient;
      } else {
        Illuminator::GetIllumination(*light_components_[i], hit_position, dir_to_light, intensity, dist_to_light);

        // casting shadow
        bool has_shadow = false;
        if (shadows_enabled_) {
          HitRecord shadow_record = HitRecord();
          float epsilon = 0.0001;
          Ray shadow_ray = Ray(hit_position + epsilon * dir_to_light, dir_to_light);
          for (int i=0; i < tracing_components_.size(); i++) {
            Ray shadow_ray_copy = Ray(shadow_ray.GetOrigin(), shadow_ray.GetDirection());
            glm::mat4 transform_matrix = tracing_components_[i]->GetNodePtr()->GetTransform().GetLocalToWorldMatrix();
            shadow_ray_copy.ApplyTransform(glm::inverse(transform_matrix));
            bool has_hit = tracing_components_[i]->GetHittable().Intersect(shadow_ray_copy, camera_.GetTMin(), shadow_record);
            if (has_hit) {
              glm::vec3 shadow_hit_pos = shadow_ray.At(shadow_record.time);
              if (glm::length(shadow_hit_pos - hit_position) < dist_to_light) {
                has_shadow = true;
              }
            }
          }
        }

        if (!has_shadow) {
          // diffuse shading
          float clamp_diffuse = glm::dot(dir_to_light, hit_normal);
          if (clamp_diffuse <= 0) {
            clamp_diffuse = 0;
          }
          diffuse_illumination += clamp_diffuse * intensity * k_diffuse;
          // specular shading
          float clamp_specular = glm::dot(dir_to_light, eye_to_surface_reflection);
          if (clamp_specular <= 0) {
            clamp_specular = 0;
          }
          specular_illumination += pow(clamp_specular, shininess_specular) * intensity * k_specular;
        }
      }
    }
    glm::vec3 direct_illumination = diffuse_illumination + specular_illumination + ambient_illumination;

    // indirect illumination
    glm::vec3 indirect_illumination(0.f);
    if (bounces > 0) {
      float epsilon = 0.0001;
      Ray bounces_ray = Ray(hit_position + epsilon * eye_to_surface_reflection, eye_to_surface_reflection);
      HitRecord bounces_record = HitRecord();
      indirect_illumination = TraceRay(bounces_ray, bounces-1, bounces_record);
    }

    glm::vec3 total_illumination = direct_illumination + (k_specular * indirect_illumination);
    return total_illumination;

  // if there was no hit 
  } else {
    return GetBackgroundColor(ray.GetDirection());
  }
}


glm::vec3 Tracer::GetBackgroundColor(const glm::vec3& direction) const {
  if (cube_map_ != nullptr) {
    return cube_map_->GetTexel(direction);
  } else
    return background_color_;
}

glm::vec2 Tracer::ScalePixel(int x, int y) const {
  float x_multiplier = (image_size_.x-1) / 2.f;
  float y_multiplier = (image_size_.y-1) / 2.f;
  return glm::vec2(x / x_multiplier - 1, y / y_multiplier - 1);
}
}  // namespace GLOO