#include "CurveNode.hpp"

#include "gloo/debug/PrimitiveFactory.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "gloo/shaders/PhongShader.hpp"
#include "gloo/shaders/SimpleShader.hpp"
#include "gloo/InputManager.hpp"
#include "glm/gtx/string_cast.hpp"

namespace GLOO {
CurveNode::CurveNode(std::string spline_type, std::vector<glm::vec3> control_points)
    : spline_type_(spline_type), control_points_(control_points),
    BBezier({
        {1, 0, 0, 0},
        {-3, 3, 0, 0},
        {3, -6, 3, 0},
        {-1, 3, -3, 1}
      }),
      BBSpline({
        {1/6.f, 4/6.f, 1/6.f, 0/6.f},
        {-3/6.f, 0/6.f, 3/6.f, 0/6.f},
        {3/6.f, -6/6.f, 3/6.f, 0/6.f},
        {-1/6.f, 3/6.f, -3/6.f, 1/6.f}
      }) {
  // TODO: this node should represent a single spline curve.
  // Think carefully about what data defines a curve and how you can
  // render it.

  // construct geometry matrix
  if (control_points.size() >= 3) {
    for (int i = 0; i < 4; ++i) {
        geometry_matrix[i] = control_points[i];
    }
  }
  std::cout<<"geometry: " << glm::to_string(geometry_matrix)<<std::endl;

  // Initialize the VertexObjects and shaders used to render the control points,
  // the curve, and the tangent line.
  sphere_mesh_ = PrimitiveFactory::CreateSphere(0.015f, 25, 25);
  curve_polyline_ = std::make_shared<VertexObject>();
  tangent_line_ = std::make_shared<VertexObject>();
  shader_ = std::make_shared<PhongShader>();
  polyline_shader_ = std::make_shared<SimpleShader>();


  InitCurve();
  PlotCurve();
}

void CurveNode::Update(double delta_time) {
  // Prevent multiple toggle.
  static bool prev_released = true;

  if (InputManager::GetInstance().IsKeyPressed('T')) {
    if (prev_released) {
      // TODO: implement toggling spline bases.
      ToggleSplineBasis();
    }
    prev_released = false;
  } else if (InputManager::GetInstance().IsKeyPressed('B')) {
    if (prev_released) {
      // TODO: implement converting conrol point geometry from Bezier to
      // B-Spline basis.
      ConvertGeometry("bezier_bspline");
    }
    prev_released = false;
  } else if (InputManager::GetInstance().IsKeyPressed('Z')) {
    if (prev_released) {
      // TODO: implement converting conrol point geometry from B-Spline to
      // Bezier basis.
      ConvertGeometry("bspline_bezier");
    }
    prev_released = false;
  } else {
    prev_released = true;
  }
}

void CurveNode::ToggleSplineBasis() {
  // TODO: implement toggling between Bezier and B-Spline bases.
  // done
  Material& material = GetComponentPtr<MaterialComponent>()->GetMaterial();
  // std::cout << material << std::endl;
  glm::vec3 new_color;
  if (spline_basis_ == BBezier) {
    spline_basis_ = BBSpline;
    new_color = BSpline_color;
  } else {
    new_color = Bezier_color;
    spline_basis_ = BBezier;
  }
  // std::cout << glm::to_string(material.GetAmbientColor()) << std::endl;
  material.SetAmbientColor(new_color);
  material.SetDiffuseColor(new_color);
  PlotCurve();
  PlotControlPoints();
}

// Need something in arguments that indicate which direction to convert
void CurveNode::ConvertGeometry(std::string direction) {
  // TODO: implement converting the control points between bases.
  // control points from bezier to bspline:
  glm::mat4 b1;
  glm::mat4 b2;
  if (direction == "bezier_bspline") {
    b1 = BBezier;
    b2 = BBSpline;
  } else {
    b1 = BBSpline;
    b2 = BBezier;
  }

  glm::mat4 b2_inv = glm::inverse(b2);
  geometry_matrix = geometry_matrix * b1 * b2_inv;

  PlotCurve();
  PlotControlPoints();
}

CurvePoint CurveNode::EvalCurve(float t) {
  // TODO: implement evaluating the spline curve at parameter value t.
  glm::vec4 canonical_monomial(1, t, pow(t, 2), pow(t, 3));
  glm::vec4 canonical_monomial_derivative(0, 1, 2*t, 3*t*t);
  glm::vec3 position = geometry_matrix * spline_basis_ * canonical_monomial;

  glm::vec3 tangent = geometry_matrix * spline_basis_ * canonical_monomial_derivative;

  tangent = glm::normalize(tangent) * 0.25f;
  CurvePoint cp = {position, tangent};

  return cp;
}

void CurveNode::InitCurve() {
  // TODO: create all of the  nodes and components necessary for rendering the
  // curve, its control points, and its tangent line. You will want to use the
  // VertexObjects and shaders that are initialized in the class constructor.

  if (spline_type_ == "Bezier curve") {
    spline_basis_ = BBezier;
    sphere_color_pointer = &Bezier_color;
  } else {
    spline_basis_ = BBSpline;
    sphere_color_pointer = &BSpline_color;
  }
  auto sphere_material = std::make_shared<Material>(*sphere_color_pointer, *sphere_color_pointer, *sphere_color_pointer, 0);
  CreateComponent<MaterialComponent>(sphere_material);


  for (glm::vec3 cp : control_points_) {
    auto point_node = make_unique<SceneNode>();
    control_point_nodes.push_back(point_node.get());

    point_node -> CreateComponent<ShadingComponent>(shader_);
    point_node->CreateComponent<RenderingComponent>(sphere_mesh_);

    Material& material = GetComponentPtr<MaterialComponent>()->GetMaterial();
    point_node->CreateComponent<MaterialComponent>(sphere_material);

    point_node->GetTransform().SetPosition(cp);
    AddChild(std::move(point_node));
  }

  PlotControlPoints();
  PlotTangentLine();
}

void CurveNode::PlotCurve() {
  // TODO: plot the curve by updating the positions of its VertexObject.
  
  std::cout<<"geometry: " << glm::to_string(geometry_matrix)<<std::endl;
  std::cout<<"basis: " << glm::to_string(spline_basis_)<<std::endl;
  auto positions = make_unique<PositionArray>();
  auto indices = make_unique<IndexArray>();
  for (int i=0; i<=N_SUBDIV_; i++) {
    double j = i*1.0/N_SUBDIV_;
    
    glm::vec4 canonical_monomial(1, j, pow(j, 2), pow(j, 3));
    glm::vec3 position = geometry_matrix * spline_basis_ * canonical_monomial;
    positions->push_back(position);
    indices->push_back(i);
    if (i<N_SUBDIV_) {
      indices->push_back(i+1);
    }
  }

  curve_polyline_->UpdatePositions(std::move(positions));
  curve_polyline_->UpdateIndices(std::move(indices));

  auto line_node = make_unique<SceneNode>();
  auto shader = std::make_shared<SimpleShader>();
  line_node->CreateComponent<ShadingComponent>(shader);
  auto& rc = line_node->CreateComponent<RenderingComponent>(curve_polyline_);
  rc.SetDrawMode(DrawMode::Lines);

  glm::vec3 color(1.f, 1.f, 1.f);
  auto material = std::make_shared<Material>(color, color, color, 0);
  line_node->CreateComponent<MaterialComponent>(material);

  AddChild(std::move(line_node));
}

void CurveNode::PlotControlPoints() {
  for (int i=0; i<4; i++) {
    control_point_nodes[i]->GetTransform().SetPosition(geometry_matrix[i]);
  }
}

void CurveNode::PlotTangentLine() {
  // TODO: implement plotting a line tangent to the curve.
  // Below is a sample implementation for rendering a line segment
  // onto the screen. Note that this is just an example. This code
  // currently has nothing to do with the spline.
 
  double t = 0.25;
  CurvePoint cp = EvalCurve(t);

  auto line = std::make_shared<VertexObject>();

  auto positions = make_unique<PositionArray>();
  positions->push_back(cp.P - cp.T);
  positions->push_back(cp.P + cp.T);

  auto indices = make_unique<IndexArray>();
  indices->push_back(0);
  indices->push_back(1);

  line->UpdatePositions(std::move(positions));
  line->UpdateIndices(std::move(indices));

  auto shader = std::make_shared<SimpleShader>();

  auto line_node = make_unique<SceneNode>();
  line_node->CreateComponent<ShadingComponent>(shader);

  auto& rc = line_node->CreateComponent<RenderingComponent>(line);
  rc.SetDrawMode(DrawMode::Lines);

  glm::vec3 color(1.f, 1.f, 1.f);
  auto material = std::make_shared<Material>(color, color, color, 0);
  line_node->CreateComponent<MaterialComponent>(material);

  AddChild(std::move(line_node));
}
}  // namespace GLOO
