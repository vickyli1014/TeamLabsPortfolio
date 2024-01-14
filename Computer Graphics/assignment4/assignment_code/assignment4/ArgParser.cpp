#include "ArgParser.hpp"

#include <cstring>
#include <cassert>
#include <cstdio>
#include <cstdlib>
#include <iostream>

ArgParser::ArgParser(int argc, const char* argv[]) {
  SetDefaultValues();

  for (int i = 1; i < argc; i++) {
    // rendering output
    if (!strcmp(argv[i], "-input")) {
      i++;
      assert(i < argc);
      input_file = argv[i];
    } else if (!strcmp(argv[i], "-output")) {
      i++;
      assert(i < argc);
      output_file = argv[i];
    } else if (!strcmp(argv[i], "-size")) {
      i++;
      assert(i < argc);
      width = atoi(argv[i]);
      i++;
      assert(i < argc);
      height = atoi(argv[i]);
    } else if (!strcmp(argv[i], "-bounces")) {
      i++;
      assert(i < argc);
      bounces = atoi(argv[i]);
    } else if (!strcmp(argv[i], "-shadows")) {
      shadows = true;
    } else {
      printf("Unknown command line argument %d: '%s'\n", i, argv[i]);
      exit(1);
    }
  }

  std::cout << "Args:\n";
  std::cout << "- input: " << input_file << std::endl;
  std::cout << "- output: " << output_file << std::endl;
  std::cout << "- width: " << width << std::endl;
  std::cout << "- height: " << height << std::endl;
  std::cout << "- bounces: " << bounces << std::endl;
  std::cout << "- shadows: " << shadows << std::endl;
}

void ArgParser::SetDefaultValues() {
  input_file = "";
  output_file = "";
  normals_file = "";
  width = 200;
  height = 200;

  bounces = 0;
  shadows = false;
}
