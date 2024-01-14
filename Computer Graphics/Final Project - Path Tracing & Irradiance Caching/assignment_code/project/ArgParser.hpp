#ifndef ARG_PARSER_H_
#define ARG_PARSER_H_

#include <string>

class ArgParser {
 public:
  ArgParser(int argc, const char* argv[]);

  std::string input_scene;
  std::string output_file;
  std::string depth_file;
  std::string algo;
  size_t width;
  size_t height;

  // Rendering options.
  float depth_min;
  float depth_max;
  size_t bounces;
  bool shadows;
  bool add_sphere;
  bool delete_sphere;
  bool material_mirror;

  // Supersampling.
  bool jitter;
  bool filter;

 private:
  void SetDefaultValues();
};

#endif  // ARG_PARSER_H
