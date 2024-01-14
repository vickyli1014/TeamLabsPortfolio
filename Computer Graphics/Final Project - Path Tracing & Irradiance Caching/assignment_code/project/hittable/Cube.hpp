#ifndef CUBE_H_
#define CUBE_H_

#include "HittableBase.hpp"
#include <vector>

namespace GLOO {
class Cube : public HittableBase {
 public:
  Cube();
  bool Intersect(const Ray& ray, float t_min, HitRecord& record) const override;
  int GetHittableType() const override;
 private:
  std::vector<glm::vec3> normals_;
  std::vector<float> ds_;
  float d;
};
}  // namespace GLOO

#endif
