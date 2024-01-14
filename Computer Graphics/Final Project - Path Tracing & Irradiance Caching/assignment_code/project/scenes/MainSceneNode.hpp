#ifndef MAIN_SCENE_NODE_H_
#define MAIN_SCENE_NODE_H_

#include "gloo/SceneNode.hpp"
#include "gloo/shaders/PhongShader.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "glm/gtx/string_cast.hpp"
#include "gloo/debug/PrimitiveFactory.hpp"

#include "gloo/components/LightComponent.hpp"
#include "gloo/lights/AmbientLight.hpp"
#include "gloo/lights/PointLight.hpp"
#include "gloo/lights/DirectionalLight.hpp"

#include "TracingComponent.hpp"
#include "hittable/Cube.hpp"
#include "hittable/Plane.hpp"

#include "CornellBoxNode.hpp"
#include "CubeSpheresNode.hpp"
#include "SphereColumnNode.hpp"
#include "SphereCubeNode.hpp"
#include "SpherePyramidNode.hpp"

namespace GLOO {
class MainSceneNode : public SceneNode {
public:
    MainSceneNode(std::string scene_name, bool add_sphere, bool delete_sphere, bool mirror) {
        // ambient light
        auto ambient_light = std::make_shared<AmbientLight>();
        ambient_light->SetAmbientColor(glm::vec3(0.8));
        auto ambient_light_node = make_unique<SceneNode>();
        ambient_light_node->CreateComponent<LightComponent>(std::move(ambient_light));
        AddChild(std::move(ambient_light_node));

        // point light
        auto point_light = std::make_shared<PointLight>();
        point_light->SetDiffuseColor(glm::vec3(0.5f));
        point_light->SetSpecularColor(glm::vec3(0.5f));
        point_light->SetAttenuation(glm::vec3(0.08f));
        auto point_light_node = make_unique<SceneNode>();
        point_light_node->CreateComponent<LightComponent>(std::move(point_light));
        point_light_node->GetTransform().SetPosition(glm::vec3(2, 3, -0.5));
        AddChild(std::move(point_light_node));

        auto cornell_box_node = make_unique<CornellBoxNode>();
        AddChild(std::move(cornell_box_node));
        auto cube_spheres_node = make_unique<CubeSpheresNode>(add_sphere, delete_sphere, mirror);
        auto sphere_pyramid_node = make_unique<SpherePyramidNode>(add_sphere, delete_sphere, mirror);
        auto sphere_cube_node = make_unique<SphereCubeNode>(add_sphere, delete_sphere, mirror);
        auto sphere_column_node = make_unique<SphereColumnNode>(add_sphere, delete_sphere, mirror);

        if (scene_name == "cubeSpheres") {
            AddChild(std::move(cube_spheres_node));
        } else if (scene_name == "spherePyramid") {
            AddChild(std::move(sphere_pyramid_node));
        } else if (scene_name == "sphereCube") {
            AddChild(std::move(sphere_cube_node));
        } else {
            AddChild(std::move(sphere_column_node));
        }

        // AddChild(std::move(cube_spheres_node));
        // AddChild(std::move(sphere_pyramid_node));
        // AddChild(std::move(sphere_cube_node));
        // AddChild(std::move(sphere_column_node));
    }

private:
};
}
#endif