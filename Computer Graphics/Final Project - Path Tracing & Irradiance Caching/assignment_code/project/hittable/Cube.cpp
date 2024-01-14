#include "Cube.hpp"
#include <glm/gtx/string_cast.hpp>
#include <iostream>
namespace GLOO {

Cube::Cube() {
  normals_.push_back(glm::vec3(-1, 0, 0));
  normals_.push_back(glm::vec3(0, -1, 0));
  normals_.push_back(glm::vec3(0, 0, -1));
  normals_.push_back(glm::vec3(1, 0, 0));
  normals_.push_back(glm::vec3(0, 1, 0));
  normals_.push_back(glm::vec3(0, 0, 1));
  d = 0.75;
  ds_.push_back(d);
  ds_.push_back(d);
  ds_.push_back(d);
  ds_.push_back(d);
  ds_.push_back(d);
  ds_.push_back(d);
}

bool Cube::Intersect(const Ray& ray, float t_min, HitRecord& record) const {
  bool intersect = false;
  for (int i=0; i<normals_.size(); i++) {
    auto normal_ = normals_[i];
    auto d_ = ds_[i];
    if (glm::dot(normal_, ray.GetDirection()) == 0){
      continue;
    }
    float t = (d_ - glm::dot(normal_, ray.GetOrigin()))/glm::dot(normal_, ray.GetDirection());
    if (t > t_min && t < record.time) {
      bool intersection_in = true;
      auto point = ray.GetOrigin() + t * ray.GetDirection();
      // check the point intersects the cube
      for (int i=0; i<3; i++) {
        if (point[i] < -d || point[i] > d) {
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
  }
  return intersect;
}

int Cube::GetHittableType() const {
  return 1;
}
}  // namespace GLOO
