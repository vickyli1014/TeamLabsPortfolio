#ifndef TRIANGLE_H_
#define TRIANGLE_H_

#include <vector>

#include "HittableBase.hpp"

namespace GLOO {
class Triangle : public HittableBase {
 public:
  Triangle(const glm::vec3& p0,
           const glm::vec3& p1,
           const glm::vec3& p2,
           const glm::vec3& n0,
           const glm::vec3& n1,
           const glm::vec3& n2);
  Triangle(const std::vector<glm::vec3>& positions,
           const std::vector<glm::vec3>& normals);

  bool Intersect(const Ray& ray, float t_min, HitRecord& record) const override;
  glm::vec3 GetPosition(size_t i) const {
    return positions_[i];
  }
  glm::vec3 GetNormal(size_t i) const {
    return normals_[i];
  }

 private:
  std::vector<glm::vec3> positions_;
  std::vector<glm::vec3> normals_;
};
}  // namespace GLOO

#endif
