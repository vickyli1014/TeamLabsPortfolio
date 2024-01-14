#ifndef PATH_TRACER_VIEWER_APP_H_
#define PATH_TRACER_VIEWER_APP_H_

#include "gloo/Application.hpp"

namespace GLOO {
class PathTracerViewerApp : public Application {
 public:
  PathTracerViewerApp(const std::string& app_name, glm::ivec2 window_size);
  void SetupScene() override;
};
}  // namespace GLOO

#endif
