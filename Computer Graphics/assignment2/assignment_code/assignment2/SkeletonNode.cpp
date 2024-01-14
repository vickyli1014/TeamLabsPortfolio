#include "SkeletonNode.hpp"
#include <glm/gtx/string_cast.hpp>
#include <glm/gtx/normal.hpp>
#include <map>

#include "gloo/utils.hpp"
#include "gloo/InputManager.hpp"
#include "gloo/MeshLoader.hpp"
#include "gloo/debug/PrimitiveFactory.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/shaders/PhongShader.hpp"
#include "gloo/MeshData.hpp"

#include <sstream>
#include <fstream>

namespace GLOO {
SkeletonNode::SkeletonNode(const std::string& filename)
    : SceneNode(), draw_mode_(DrawMode::Skeleton) {
  LoadAllFiles(filename);
  CalculateBInverse();
  DecorateTree();
  original_position = bind_mesh->GetPositions();

  // Force initial update.
  PlotSkin();
  OnJointChanged();
}

void SkeletonNode::ToggleDrawMode() {
  draw_mode_ =
      draw_mode_ == DrawMode::Skeleton ? DrawMode::SSD : DrawMode::Skeleton;

  if (draw_mode_ == DrawMode::Skeleton) {
    skin_node_pointer->SetActive(false);
  } else {
    skin_node_pointer->SetActive(true);
  }
  // TODO: implement here toggling between skeleton mode and SSD mode.
  // The current mode is draw_mode_;
  // Hint: you may find SceneNode::SetActive convenient here as
  // inactive nodes will not be picked up by the renderer.
}

void SkeletonNode::DecorateTree() {
  // TODO: set up addtional nodes, add necessary components here.
  // You should create one set of nodes/components for skeleton mode
  // (spheres for joints and cylinders for bones), and another set for
  // SSD mode (you could just use a single node with a RenderingComponent
  // that is linked to a VertexObject with the mesh information. Then you
  // only need to update the VertexObject - updating vertex positions and
  // recalculating the normals, etc.).

  // The code snippet below shows how to add a sphere node to a joint.
  // Suppose you have created member variables shader_ of type
  // std::shared_ptr<PhongShader>, and sphere_mesh_ of type
  // std::shared_ptr<VertexObject>.
  // Here sphere_nodes_ptrs_ is a std::vector<SceneNode*> that stores the
  // pointer so the sphere nodes can be accessed later to change their
  // positions. joint_ptr is assumed to be one of the joint node you created
  // from LoadSkeletonFile (e.g. you've stored a std::vector<SceneNode*> of
  // joint nodes as a member variable and joint_ptr is one of the elements).
  //
  auto shader_ = std::make_shared<PhongShader>();
  std::shared_ptr<GLOO::VertexObject> sphere_mesh_ = PrimitiveFactory::CreateSphere(0.02f, 25, 25);
  std::shared_ptr<GLOO::VertexObject> cylinder_mesh_ = PrimitiveFactory::CreateCylinder(0.015f, 1, 25);
  for (SceneNode* joint_ptr : joint_node_ptrs) {
    auto sphere_node = make_unique<SceneNode>();
    sphere_node->CreateComponent<ShadingComponent>(shader_);
    sphere_node->CreateComponent<RenderingComponent>(sphere_mesh_);
    sphere_nodes_ptrs_.push_back(sphere_node.get());
    joint_ptr->AddChild(std::move(sphere_node));
  }

  // create a cylinder node for all children nodes
  for (SceneNode* joint_ptr : joint_node_ptrs) {
    if (joint_ptr != joint_node_ptrs[0]) { 
      auto parent_pointer = joint_ptr->GetParentPtr();
      auto cylinder_node = make_unique<SceneNode>();
      cylinder_node->CreateComponent<ShadingComponent>(shader_);
      cylinder_node->CreateComponent<RenderingComponent>(cylinder_mesh_);

      auto child_position = (joint_ptr->GetTransform().GetPosition());
      auto child_position_normalized = glm::normalize(child_position);
      auto distance = glm::length(child_position);
      cylinder_node->GetTransform().SetScale(glm::vec3(1.0f, distance, 1.0f));
      
      glm::vec3 axis = glm::cross(glm::vec3(0, 1, 0), child_position_normalized);
      float angle = glm::acos(glm::dot(glm::vec3(0, 1, 0), child_position_normalized));
      cylinder_node->GetTransform().SetRotation(glm::normalize(axis),angle); 

      cylinder_nodes_ptrs_.push_back(cylinder_node.get());
      parent_pointer->AddChild(std::move(cylinder_node));
    }
  }
}

void SkeletonNode::Update(double delta_time) {
  // Prevent multiple toggle.
  static bool prev_released = true;
  if (InputManager::GetInstance().IsKeyPressed('S')) {
    if (prev_released) {
      ToggleDrawMode();
    }
    prev_released = false;
  } else if (InputManager::GetInstance().IsKeyReleased('S')) {
    prev_released = true;
  }
}

void SkeletonNode::OnJointChanged() {
  // TODO: this method is called whenever the values of UI sliders change.
  // The new Euler angles (represented as EulerAngle struct) can be retrieved
  // from linked_angles_ (a std::vector of EulerAngle*).
  // The indices of linked_angles_ align with the order of the joints in .skel
  // files. For instance, *linked_angles_[0] corresponds to the first line of
  // the .skel file.
  for (int i=0; i<joint_node_ptrs.size(); i++) {
    auto joint_ptr = joint_node_ptrs[i];
    if (linked_angles_.size() != 0){
      auto angle = *linked_angles_[i];
      auto quat_rot = glm::quat(glm::vec3(angle.rx, angle.ry, angle.rz));
      joint_ptr->GetTransform().SetRotation(quat_rot);
    }
    CalculateT();
    UpdateSkinPosition();
    ComputeNormals();
  }
}

void SkeletonNode::CalculateBInverse() {
    for (auto joint_ptr : joint_node_ptrs) {
        auto B = joint_ptr->GetTransform().GetLocalToWorldMatrix();
        B_inverse_.push_back(glm::inverse(B));
    }
}

void SkeletonNode::CalculateT() {
  T_.clear();
  for (auto joint_ptr : joint_node_ptrs) {
      T_.push_back(joint_ptr->GetTransform().GetLocalToWorldMatrix());
  }
}

void SkeletonNode::PlotSkin() {
  ComputeNormals();
  auto shader_ = std::make_shared<PhongShader>();
  auto skin_node = make_unique<SceneNode>();
  skin_node->CreateComponent<ShadingComponent>(shader_);
  skin_node->CreateComponent<RenderingComponent>(bind_mesh);
  skin_node->CreateComponent<MaterialComponent>(
      std::make_shared<Material>(Material::GetDefault()));
  skin_node->SetActive(false);
  skin_node_pointer = skin_node.get();
  AddChild(std::move(skin_node));
}

void SkeletonNode::UpdateSkinPosition() {
  auto new_positions = make_unique<PositionArray>();
  for (int i=0; i<original_position.size(); i++) {
    auto position = original_position[i];
    glm::mat4 matrix(0.f);
    glm::vec4 new_position(0.f, 0.f, 0.f, 0.f);
    for (int j=0; j<B_inverse_.size()-1; j++) {
      auto T = T_[j+1];
      // auto T = joint_node_ptrs[j+1]->GetTransform().GetLocalToWorldMatrix();
      auto B_inv = B_inverse_[j+1];
      auto w_ij = weights[i][j];
      matrix += w_ij * T * B_inv;
      
    }
    new_position = matrix * glm::vec4(position, 1.f);
    new_positions->push_back(new_position);
  }
  bind_mesh->UpdatePositions(std::move(new_positions));
}

void SkeletonNode::ComputeNormals() {
  auto normals = make_unique<NormalArray>();
  std::vector<glm::vec3> face_normals;
  // every 3 indices is a triangle
  auto indices = bind_mesh->GetIndices();
  auto positions = bind_mesh->GetPositions();
  std::map<int, std::vector<int>> position_to_indices;
  // get face normals
  for (int i=0; i<indices.size(); i+=3){
    auto v1 = positions[indices[i]];
    auto v2 = positions[indices[i+1]];
    auto v3 = positions[indices[i+2]];

    // to tell which faces are incident to each vertex, both are indices
    // from index of position to list of incident face normal index
    position_to_indices[indices[i]].push_back(i/3);
    position_to_indices[indices[i+1]].push_back(i/3);
    position_to_indices[indices[i+2]].push_back(i/3);
    auto a = position_to_indices[indices[i]];

    // area is half the length of the normal
    auto face_normal = glm::triangleNormal(v1, v2, v3);
    // auto face_normal = glm::cross(v1-v2, v1-v3);
    face_normals.push_back(face_normal);
  }

  for (int i=0; i<positions.size(); i++) {
    std::vector<int> face_indices = position_to_indices[i];
    glm::vec3 normal(0.f);
    float total_area = 0.f;

    for (auto ind : face_indices) {
      auto face_norm = face_normals.at(ind);
      auto face_area = .5f * glm::length(face_norm);
      total_area += face_area;
      normal += face_area * face_norm;
    }
    normal = glm::normalize(normal);
    normals->push_back(normal);
    // normals->push_back(glm::normalize(glm::vec3(1.0f)));
  }
  bind_mesh->UpdateNormals(std::move(normals));
}


void SkeletonNode::LinkRotationControl(const std::vector<EulerAngle*>& angles) {
  linked_angles_ = angles;
}

void SkeletonNode::LoadSkeletonFile(const std::string& path) {
  // TODO: load skeleton file and build the tree of joints.
  std::fstream s{path};
 
  if (!s.is_open()) {
    std::cout << "failed to open " << path << '\n';
  } else { 
    for (std::string line; std::getline(s, line); ){
      // read line
      std::stringstream ss;
      ss << line;

      glm::vec3 position; int parent_ind;
      ss >> position[0]; ss >> position[1]; ss >> position[2];
      ss >> parent_ind;
      auto joint_node = make_unique<SceneNode>();

      if (parent_ind != -1) {
        auto parent_node_ptr = (joint_node_ptrs[parent_ind]);
        joint_node->GetTransform().SetPosition(position);
        joint_node_ptrs.push_back(joint_node.get());
        parent_node_ptr->AddChild(std::move(joint_node));
      } else {
        joint_node->GetTransform().SetPosition(position);
        joint_node_ptrs.push_back(joint_node.get());
        root_ = std::move(joint_node); 
        AddChild(std::move(root_));
      }
    }
  }
  s.close();
}

void SkeletonNode::LoadMeshFile(const std::string& filename) {
  bind_mesh =
    MeshLoader::Import(filename).vertex_obj;
  // TODO: store the bind pose mesh in your preferred way.
}

void SkeletonNode::LoadAttachmentWeights(const std::string& path) {
  std::fstream s{path};
  if (!s.is_open()) {
    std::cout << "failed to open " << path << '\n';
  } else { 
    std::string line;
    while (std::getline(s, line)) {
        std::vector<float> numbers;
        std::istringstream iss(line);
        float num;

        while (iss >> num) {
            numbers.push_back(num);
        }
        weights.push_back(numbers);
    }
    s.close();
  }
}

void SkeletonNode::LoadAllFiles(const std::string& prefix) {
  std::string prefix_full = GetAssetDir() + prefix;
  LoadSkeletonFile(prefix_full + ".skel");
  LoadMeshFile(prefix + ".obj");
  LoadAttachmentWeights(prefix_full + ".attach");
}

}  // namespace GLOO
