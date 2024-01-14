#include "Triangle.hpp"

#include <iostream>
#include <stdexcept>

#include <glm/common.hpp>
#include <glm/gtx/string_cast.hpp>

#include "Plane.hpp"

namespace GLOO {
Triangle::Triangle(const glm::vec3& p0,
                   const glm::vec3& p1,
                   const glm::vec3& p2,
                   const glm::vec3& n0,
                   const glm::vec3& n1,
                   const glm::vec3& n2) {
  positions_.push_back(p0);
  positions_.push_back(p1);
  positions_.push_back(p2);
  normals_.push_back(n0);
  normals_.push_back(n1);
  normals_.push_back(n2);
}

Triangle::Triangle(const std::vector<glm::vec3>& positions,
                   const std::vector<glm::vec3>& normals) {
  positions_ = positions;
  normals_ = normals;
}

bool Triangle::Intersect(const Ray& ray, float t_min, HitRecord& record) const {
  // TODO: Implement ray-triangle intersection.
  glm::vec3 a = positions_[0];
  glm::vec3 b = positions_[1];
  glm::vec3 c = positions_[2];
  glm::mat3 A;
  glm::vec3 B;
  for (int i=0; i<3; i++) {
    A[i] = glm::vec3(a[i]-b[i], a[i]-c[i], ray.GetDirection()[i]);
    B[i] = a[i] - ray.GetOrigin()[i];
  }
  glm::vec3 x = glm::inverse(glm::transpose(A)) * B;
  if (x[0] + x[1] <= 1 && x[0] >= 0 && x[1] >= 0 && x[2] >= t_min && x[2] < record.time) {
    record.time = x[2];
    glm::vec3 normal = (1-x[0]-x[1])*normals_[0] + x[0]*normals_[1] + x[1]*normals_[2];
    record.normal = normal;
    return true;
  }
  return false;
}
}  // namespace GLOO
