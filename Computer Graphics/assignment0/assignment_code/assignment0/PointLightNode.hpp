#ifndef POINTLIGHT_NODE_H
#define POINTLIGHT_NODE_H
#include "gloo/SceneNode.hpp"
namespace GLOO {
class PointLightNode : public SceneNode {
public:
    PointLightNode();
    void Update(double delta_time) override;
    glm::vec3 GetPosition();
    void SetPosition(glm::vec3 new_position);
private:
    float x_coord, y_coord, z_coord;
};
}
#endif