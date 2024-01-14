#include "Plane.hpp"

namespace GLOO {
Plane::Plane(const glm::vec3& normal, float d) {
  normal_ = normal;
  d_ = d;
}

bool Plane::Intersect(const Ray& ray, float t_min, HitRecord& record) const {
  if (glm::dot(normal_, ray.GetDirection()) == 0){
    return false;
  }

  float t = (d_ - glm::dot(normal_, ray.GetOrigin()))/glm::dot(normal_, ray.GetDirection());
  if (t > t_min && t < record.time) {
    record.time = t;
    record.normal = glm::normalize(normal_);
    return true;
  }
  return false;
}
}  // namespace GLOO
