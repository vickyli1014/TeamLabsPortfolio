
#include <cassert>
#include <iostream>
#include <glad/glad.h>
#include <glm/gtx/string_cast.hpp>

#include "Application.hpp"
#include "Scene.hpp"
#include "utils.hpp"
#include "gl_wrapper/BindGuard.hpp"
#include "gl_wrapper/Framebuffer.hpp"
#include "shaders/ShaderProgram.hpp"
#include "shaders/ShadowShader.hpp"
#include "components/ShadingComponent.hpp"
#include "components/CameraComponent.hpp"
#include "debug/PrimitiveFactory.hpp"

namespace {
const size_t kShadowWidth = 4096;
const size_t kShadowHeight = 4096;
const glm::mat4 kLightProjection =
    glm::ortho(-20.0f, 20.0f, -20.0f, 20.0f, 1.0f, 80.0f);
}  // namespace

namespace GLOO {
Renderer::Renderer(Application& application) : application_(application) {
  UNUSED(application_);
  // TODO: you may want to initialize your framebuffer and texture(s) here.
  shadow_depth_tex_ = make_unique<Texture>();
  shadow_depth_tex_->Reserve(GL_DEPTH_COMPONENT, kShadowWidth, kShadowHeight, GL_DEPTH_COMPONENT, GL_FLOAT);
  plain_texture_shader_ = make_unique<PlainTextureShader>();

  shadow_depth_buffer.Bind();
  shadow_depth_buffer.AssociateTexture(*shadow_depth_tex_, GL_DEPTH_ATTACHMENT);
  shadow_depth_buffer.Unbind();

  // To  a quad on in the lower-left of the screen, you can assign texture
  // to quad_ created below and then call quad_->GetVertexArray().Render().
  quad_ = PrimitiveFactory::CreateQuad();
}

void Renderer::SetRenderingOptions() const {
  GL_CHECK(glClearColor(0.0f, 0.0f, 0.0f, 0.0f));

  // Enable depth test.
  GL_CHECK(glEnable(GL_DEPTH_TEST));
  GL_CHECK(glDepthFunc(GL_LEQUAL));

  // Enable blending for multi-pass forward rendering.
  GL_CHECK(glEnable(GL_BLEND));
  GL_CHECK(glBlendFunc(GL_ONE, GL_ONE));
}

void Renderer::Render(const Scene& scene) const {
  SetRenderingOptions();
  RenderScene(scene);
  DebugShadowMap();
  // TODO: When debugging your shadow map, call DebugShadowMap to render a
  // quad at the bottom left corner to display the shadow map.
}

void Renderer::RecursiveRetrieve(const SceneNode& node,
                                 RenderingInfo& info,
                                 const glm::mat4& model_matrix) {
  // model_matrix is parent to world transformation.
  glm::mat4 new_matrix =
      model_matrix * node.GetTransform().GetLocalToParentMatrix();
  auto robj_ptr = node.GetComponentPtr<RenderingComponent>();
  if (robj_ptr != nullptr && node.IsActive())
    info.emplace_back(robj_ptr, new_matrix);

  size_t child_count = node.GetChildrenCount();
  for (size_t i = 0; i < child_count; i++) {
    RecursiveRetrieve(node.GetChild(i), info, new_matrix);
  }
}

Renderer::RenderingInfo Renderer::RetrieveRenderingInfo(
    const Scene& scene) const {
  RenderingInfo info;
  const SceneNode& root = scene.GetRootNode();
  // Efficient implementation without redundant matrix multiplications.
  RecursiveRetrieve(root, info, glm::mat4(1.0f));
  return info;
}

void Renderer::RenderShadow(LightComponent& light, RenderingInfo rendering_info) const {
  shadow_depth_buffer.Bind();
  GL_CHECK(glViewport(0, 0, kShadowWidth, kShadowHeight));
  GL_CHECK(glDepthMask(GL_TRUE));
  GL_CHECK(glColorMask(GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE));
  GL_CHECK(glClear(GL_DEPTH_BUFFER_BIT));

  for (const auto& pr : rendering_info) {
    auto robj_ptr = pr.first;
    SceneNode& node = *robj_ptr->GetNodePtr();
    auto shading_ptr = node.GetComponentPtr<ShadingComponent>();
    if (shading_ptr == nullptr) {
      std::cerr << "Some mesh is not attached with a shader during rendering!"
                << std::endl;
      continue;
    }
    // switch to shadow buffer
    ShadowShader* shader = new ShadowShader();
    BindGuard shader_bg(shader);

    // Set model_matrix
    shader->SetTargetNode(node, pr.second);
    // Set world_to_light_ndc_matrix
    glm::mat4 view_matrix = glm::inverse(light.GetNodePtr()->GetTransform().GetLocalToWorldMatrix());
    auto world_to_light_ndc = kLightProjection * view_matrix;
    shader->SetWorldToLightNDC(world_to_light_ndc);

    robj_ptr->Render();
  }
  shadow_depth_buffer.Unbind();
  GL_CHECK(glViewport(0, 0, application_.GetWindowSize().x, application_.GetWindowSize().y));
}

void Renderer::RenderScene(const Scene& scene) const {
  GL_CHECK(glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT));

  const SceneNode& root = scene.GetRootNode();
  auto rendering_info = RetrieveRenderingInfo(scene);
  auto light_ptrs = root.GetComponentPtrsInChildren<LightComponent>();
  if (light_ptrs.size() == 0) {
    // Make sure there are at least 2 passes of we don't forget to set color
    // mask back.
    return;
  }

  CameraComponent* camera = scene.GetActiveCameraPtr();

  {
    // Here we first do a depth pass (note that this has nothing to do with the
    // shadow map). The goal of this depth pass is to exclude pixels that are
    // not really visible from the camera, in later rendering passes. You can
    // safely leave this pass here without understanding/modifying it, for
    // assignment 5. If you are interested in learning more, see
    // https://www.khronos.org/opengl/wiki/Early_Fragment_Test#Optimization

    GL_CHECK(glDepthMask(GL_TRUE));
    bool color_mask = GL_FALSE;
    GL_CHECK(glColorMask(color_mask, color_mask, color_mask, color_mask));

    for (const auto& pr : rendering_info) {
      auto robj_ptr = pr.first;
      SceneNode& node = *robj_ptr->GetNodePtr();
      auto shading_ptr = node.GetComponentPtr<ShadingComponent>();
      if (shading_ptr == nullptr) {
        std::cerr << "Some mesh is not attached with a shader during rendering!"
                  << std::endl;
        continue;
      }
      ShaderProgram* shader = shading_ptr->GetShaderPtr();

      BindGuard shader_bg(shader);

      // Set various uniform variables in the shaders.
      shader->SetTargetNode(node, pr.second);
      shader->SetCamera(*camera);

      robj_ptr->Render();
    }
  }

  // The real shadow map/Phong shading passes.
  for (size_t light_id = 0; light_id < light_ptrs.size(); light_id++) {
    // TODO: render the shadow map viewed from the light.
    // This should be rendered to the shadow framebuffer instead of the default
    // one. You should only render shadow if the light can cast shadow (e.g.
    // directional light).

    LightComponent& light = *light_ptrs.at(light_id);
    if (light.GetLightPtr()->GetType() == LightType::Directional) {
      RenderShadow(light, rendering_info);
    }

    GL_CHECK(glDepthMask(GL_FALSE));
    bool color_mask = GL_TRUE;
    GL_CHECK(glColorMask(color_mask, color_mask, color_mask, color_mask));

    for (const auto& pr : rendering_info) {
      auto robj_ptr = pr.first;
      SceneNode& node = *robj_ptr->GetNodePtr();
      auto shading_ptr = node.GetComponentPtr<ShadingComponent>();
      if (shading_ptr == nullptr) {
        std::cerr << "Some mesh is not attached with a shader during rendering!"
                  << std::endl;
        continue;
      }
      ShaderProgram* shader = shading_ptr->GetShaderPtr();

      BindGuard shader_bg(shader);

      // Set various uniform variables in the shaders.
      shader->SetTargetNode(node, pr.second);
      shader->SetCamera(*camera);

      shader->SetLightSource(light);
      // TODO: pass in the shadow texture to the shader via SetShadowMapping if
      // the light can cast shadow.
      if (light.CanCastShadow()) {
        // pass in shadowshader texture into phongshader
        glm::mat4 view_matrix = glm::inverse(light.GetNodePtr()->GetTransform().GetLocalToWorldMatrix());
        auto world_to_light_ndc = kLightProjection * view_matrix;
        shader->SetShadowMapping(*shadow_depth_tex_, world_to_light_ndc);
      }

      robj_ptr->Render();
    }
  }

  // Re-enable writing to depth buffer.
  GL_CHECK(glDepthMask(GL_TRUE));
}

void Renderer::RenderTexturedQuad(const Texture& texture, bool is_depth) const {
  BindGuard shader_bg(plain_texture_shader_.get());
  plain_texture_shader_->SetVertexObject(*quad_);
  plain_texture_shader_->SetTexture(texture, is_depth);
  quad_->GetVertexArray().Render();
}

void Renderer::DebugShadowMap() const {
  GL_CHECK(glDisable(GL_DEPTH_TEST));
  GL_CHECK(glDisable(GL_BLEND));

  glm::ivec2 window_size = application_.GetWindowSize();
  glViewport(0, 0, window_size.x / 4, window_size.y / 4);
  RenderTexturedQuad(*shadow_depth_tex_, true);

  glViewport(0, 0, window_size.x, window_size.y);
}

}  // namespace GLOO
