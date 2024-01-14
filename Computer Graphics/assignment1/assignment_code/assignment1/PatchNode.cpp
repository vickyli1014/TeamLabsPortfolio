#include "PatchNode.hpp"

#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/shaders/PhongShader.hpp"
#include "glm/gtx/string_cast.hpp"

namespace GLOO {
PatchNode::PatchNode(std::string spline_type, std::vector<glm::vec3> control_points)
{
  shader_ = std::make_shared<PhongShader>();
  patch_mesh_ = std::make_shared<VertexObject>();

  // TODO: this node should represent a single tensor product patch.
  // Think carefully about what data defines a patch and how you can
  // render it.
  
  // pass in 4 control points
  for (int i=0; i<16; i++) {
    int row = i/4;
    int col = i%4;
    x_coords[col][row] = control_points[i][0];
    y_coords[col][row] = control_points[i][1];
    z_coords[col][row] = control_points[i][2];
  }

  PlotPatch(spline_type);
}

glm::vec4 get_B(std::string spline_type, double u) {
    glm::vec4 b_u;
    if (spline_type == "Bezier patch") {
      b_u[0] = pow(1-u, 3);
      b_u[1] = 3*u*pow(1-u,2);
      b_u[2] = 3*pow(u,2)*(1-u);
      b_u[3] = pow(u, 3);
    } else {
      glm::mat4 b_spline(
        1/6.f, 4/6.f, 1/6.f, 0/6.f,
        -3/6.f, 0/6.f, 3/6.f, 0/6.f,
        3/6.f, -6/6.f, 3/6.f, 0/6.f,
        -1/6.f, 3/6.f, -3/6.f, 1/6.f);
      glm::vec4 monomial(1, u, pow(u, 2), u*u*u);
      b_u = b_spline*monomial;
    }
    return b_u;
}

glm::vec4 get_B_prime(std::string spline_type, double u) {
    glm::vec4 b_u;
    if (spline_type == "Bezier patch") {
      b_u[0] = -3*pow(1-u, 2);
      b_u[1] = 3*(u-1)*(3*u-1);
      b_u[2] = 6*u-9*pow(u,2);
      b_u[3] = 3*pow(u,2);
    } else {
      glm::mat4 b_spline(
        1/6.f, 4/6.f, 1/6.f, 0/6.f,
        -3/6.f, 0/6.f, 3/6.f, 0/6.f,
        3/6.f, -6/6.f, 3/6.f, 0/6.f,
        -1/6.f, 3/6.f, -3/6.f, 1/6.f);
      glm::vec4 monomial_der(0, 1, 2*u, 3*u*u);
      b_u = b_spline*monomial_der;
    }
    return b_u;
}


void PatchNode::PlotPatch(std::string spline_type) {
  auto positions = make_unique<PositionArray>();
  auto normals = make_unique<NormalArray>();
  auto indices = make_unique<IndexArray>();

  // get positions
  for (int i=0; i<N_SUBDIV_; i++) {
    float u=i *1.0/(N_SUBDIV_-1);
    glm::vec4 b_u = get_B(spline_type,u);

    for (int j=0; j<N_SUBDIV_; j++) {
      double v=1.0*j/(N_SUBDIV_-1);
        glm::vec4 b_v = get_B(spline_type,v);

        glm::vec3 position;
        position[0] = glm::dot((b_u * x_coords), b_v);
        position[1] = glm::dot(b_u * y_coords, b_v);
        position[2] = glm::dot(b_u * z_coords, b_v);

        positions->push_back(position);

        // get normal
        glm::vec4 b_u_partial = get_B_prime(spline_type,u);
        glm::vec4 b_v_partial = get_B_prime(spline_type,v);
        glm::vec3 partial_u;
        glm::vec3 partial_v;
        partial_u[0] = glm::dot(b_u_partial * x_coords, b_v);
        partial_u[1] = glm::dot(b_u_partial * y_coords, b_v);
        partial_u[2] = glm::dot(b_u_partial * z_coords, b_v);
        partial_v[0] = glm::dot(b_u * x_coords, b_v_partial);
        partial_v[1] = glm::dot(b_u * y_coords, b_v_partial);
        partial_v[2] = glm::dot(b_u * z_coords, b_v_partial);
        glm::vec3 normal = glm::normalize(glm::cross(partial_u, partial_v));

        normals->push_back(-normal);
    }
  }

  // get indices
  for (int i=0; i<N_SUBDIV_; i++) {
    for (int j=0; j<N_SUBDIV_; j++) {
      if (i == N_SUBDIV_-1 || j == N_SUBDIV_-1) {
        continue;
      }
      // indices->push_back(i*N_SUBDIV_+j);
      // indices->push_back(i*N_SUBDIV_+j+1);
      // indices->push_back((i+1)*N_SUBDIV_+j);
      // indices->push_back((i+1)*N_SUBDIV_+j);
      // indices->push_back(i*N_SUBDIV_+j+1);
      // indices->push_back((i+1)*N_SUBDIV_+j+1);

      // indices->push_back(i*N_SUBDIV_+j-1);
      // indices->push_back(i*N_SUBDIV_+j);
      // indices->push_back((i-1)*N_SUBDIV_+j-1);
      // indices->push_back(i*N_SUBDIV_+j);
      // indices->push_back((i-1)*N_SUBDIV_+j-1);
      // indices->push_back((i-1)*N_SUBDIV_+j);


      indices->push_back(i*N_SUBDIV_ + j+1);
      indices->push_back(i*N_SUBDIV_ + j) ;
      indices->push_back((i+1)*N_SUBDIV_ + j + 1);

      indices->push_back((i+1)*N_SUBDIV_ + j + 1);
      indices->push_back(i*N_SUBDIV_ + j);
      indices->push_back((i+1)*N_SUBDIV_ + j);

      // int k=i+1;
      // indices->push_back(k*N_SUBDIV_ + j);
      // indices->push_back(k*N_SUBDIV_ + j + 1);
      // indices->push_back((k-1)*N_SUBDIV_ + j+1);
    }
  }
  

// TODO: fill "positions", "normals", and "indices"

  patch_mesh_->UpdatePositions(std::move(positions));
  patch_mesh_->UpdateNormals(std::move(normals));
  patch_mesh_->UpdateIndices(std::move(indices));

  // auto shader = std::make_shared<SimpleShader>();

  auto patch_node = make_unique<SceneNode>();
  patch_node->CreateComponent<ShadingComponent>(shader_);

  patch_node->CreateComponent<RenderingComponent>(patch_mesh_);
  // rc.SetDrawMode(DrawMode::Lines);

  // glm::vec3 color(1.f, 1.f, 1.f);
  // auto material = std::make_shared<Material>(color, color, color, 0);
  patch_node->CreateComponent<MaterialComponent>(
      std::make_shared<Material>(Material::GetDefault()));

  AddChild(std::move(patch_node));
}
}  // namespace GLOO
