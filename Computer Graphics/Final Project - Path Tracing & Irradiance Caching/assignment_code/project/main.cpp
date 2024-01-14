#include <iostream>
#include <chrono>

#include "gloo/Scene.hpp"
#include "gloo/components/MaterialComponent.hpp"
#include "scenes/SphereColumnNode.hpp"
#include "scenes/SpherePyramidNode.hpp"
#include "scenes/SphereCubeNode.hpp"
#include "scenes/CubeSpheresNode.hpp"
#include "scenes/CornellBoxNode.hpp"
#include "scenes/MainSceneNode.hpp"

#include "hittable/Sphere.hpp"
#include "Tracer.hpp"
#include "PathTracer.hpp"
#include "IrridianceCaching.hpp"
#include "SceneParser.hpp"
#include "ArgParser.hpp"
#include "CameraSpec.hpp"
#include <time.h>

using namespace GLOO;

/***
 * scene: cubeSpheres, sphereColumn, sphereCube, spherePyramid
 * output: (whatever they want, string)
 * algorithm: PT, IC
 * size: (whatevery they want, int)
 * bounces: (whatever they want, int)
***/

int main(int argc, const char* argv[]) {
  // auto main_scene_node = make_unique<MainSceneNode>();
  // auto scene = make_unique<Scene>(std::move(main_scene_node));

  // CameraSpec camera = {glm::vec3(0, 0, 18), glm::vec3(0, 0, -1), glm::vec3(0, 1, 0), 30};
  // glm::vec3 background_color(0);
  // std::unique_ptr<CubeMap> cube_map;

  // int bounces = 5;
  // int dimension = 300;
  // bool shadows = true;

  // // IrridianceCaching tracer(camera,
  // //               glm::ivec2(dimension, dimension),
  // //               bounces, background_color, cube_map.get(), shadows);

  // PathTracer tracer(camera,
  //               glm::ivec2(dimension, dimension),
  //               bounces, background_color, cube_map.get(), shadows);
      
  // tracer.Render(*scene, "pathTracing_mirror_test.png");
  // return 0;


  clock_t tStart = clock();

  ArgParser arg_parser(argc, argv);
  auto main_scene_node = make_unique<MainSceneNode>(arg_parser.input_scene, arg_parser.add_sphere, arg_parser.delete_sphere, arg_parser.material_mirror);
  auto scene = make_unique<Scene>(std::move(main_scene_node));

  CameraSpec camera = {glm::vec3(0, 0, 18), glm::vec3(0, 0, -1), glm::vec3(0, 1, 0), 30};
  glm::vec3 background_color(0);
  std::unique_ptr<CubeMap> cube_map;

  // int bounces = arg_parser.bounces;
  // int width = arg_parser.width;
  // int height = arg_parser.height;
  // bool shadows = arg_parser.shadows;

  PathTracer pt_tracer(camera,
                glm::ivec2(arg_parser.width, arg_parser.height),
                arg_parser.bounces, background_color, cube_map.get(), arg_parser.shadows);

  IrridianceCaching ir_tracer(camera,
                glm::ivec2(arg_parser.width, arg_parser.height),
                arg_parser.bounces, background_color, cube_map.get(), arg_parser.shadows);

  if (arg_parser.algo == "PT") {
    pt_tracer.Render(*scene, arg_parser.output_file);
  } else {
    ir_tracer.Render(*scene, arg_parser.output_file);
  }
  printf("Time taken: %.2fs\n", (double)(clock() - tStart)/CLOCKS_PER_SEC);
  return 0;
}

// #include <iostream>
// #include <chrono>

// #include "PathTracerViewerApp.hpp"

// using namespace GLOO;

// int main() {
//   std::unique_ptr<PathTracerViewerApp> app =
//       make_unique<PathTracerViewerApp>("Path Tracer", glm::ivec2(1440, 900));

//   app->SetupScene();

//   using Clock = std::chrono::high_resolution_clock;
//   using TimePoint =
//       std::chrono::time_point<Clock, std::chrono::duration<double>>;
//   TimePoint last_tick_time = Clock::now();
//   TimePoint start_tick_time = last_tick_time;
//   while (!app->IsFinished()) {
//     TimePoint current_tick_time = Clock::now();
//     double delta_time = (current_tick_time - last_tick_time).count();
//     double total_elapsed_time = (current_tick_time - start_tick_time).count();
//     app->Tick(delta_time, total_elapsed_time);
//     last_tick_time = current_tick_time;
//   }
//   return 0;
// }
