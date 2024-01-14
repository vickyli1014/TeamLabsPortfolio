#include "Plane.hpp"

namespace GLOO {
Plane::Plane(const glm::vec3& normal, float d) {
  normal_ = normal;
  d_ = d;
}

bool Plane::Intersect(const Ray& ray, float t_min, HitRecord& record) const {
  bool intersect = false;
  auto d = -4;
    if (glm::dot(normal_, ray.GetDirection()) == 0){
      return false;
    }
    float t = (d_ - glm::dot(normal_, ray.GetOrigin()))/glm::dot(normal_, ray.GetDirection());
    if (t > t_min && t < record.time) {
      bool intersection_in = true;
      auto point = ray.GetOrigin() + t * ray.GetDirection();
      // check the point intersects the cube
      for (int i=0; i<3; i++) {
        if (point[i] > -d || point[i] < d) {
          intersection_in = false;
        }
      }
      // std::cout << glm::to_string(point) << std::endl;
      if (intersection_in && t < record.time) {
        record.time = t;
        record.normal = glm::normalize(normal_);
        intersect = true;
      }
    }
  return intersect;
}

int Plane::GetHittableType() const {
  return 3;
}

}  // namespace GLOO
