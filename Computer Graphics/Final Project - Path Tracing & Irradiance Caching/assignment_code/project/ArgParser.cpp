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
    if (!strcmp(argv[i], "-scene")) {
      i++;
      assert(i < argc);
      input_scene = argv[i];
    } else if (!strcmp(argv[i], "-output")) {
      i++;
      assert(i < argc);
      output_file = argv[i];
    } else if (!strcmp(argv[i], "-algorithm")) {
      i++;
      assert(i < argc);
      algo = argv[i];
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
      i++;
      assert(i < argc);
      std::string val = argv[i];
      if (val == "true") {
        shadows = true;
      }
    } else if (!strcmp(argv[i], "-add_sphere")) {
      i++;
      assert(i < argc);
      std::string val = argv[i];
      if (val == "true") {
        add_sphere = true;
      }
    } else if (!strcmp(argv[i], "-delete_sphere")) {
      i++;
      assert(i < argc);
      std::string val = argv[i];
      if (val == "true") {
        delete_sphere = true;
      }
    } else if (!strcmp(argv[i], "-material_mirror")) {
      i++;
      assert(i < argc);
      std::string val = argv[i];
      if (val == "true") {
        material_mirror = true;
      }
    } else {
      printf("Unknown command line argument %d: '%s'\n", i, argv[i]);
      exit(1);
    }
  }

  std::cout << "Args:\n";
  std::cout << "- input: " << input_scene << std::endl;
  std::cout << "- output: " << output_file << std::endl;
  std::cout << "- algorithm: " << algo << std::endl;
  std::cout << "- width: " << width << std::endl;
  std::cout << "- height: " << height << std::endl;
  std::cout << "- bounces: " << bounces << std::endl;
  std::cout << "- shadows: " << shadows << std::endl;
  std::cout << "- add_sphere: " << add_sphere << std::endl;
  std::cout << "- delete_sphere: " << delete_sphere << std::endl;
  std::cout << "- material_mirror: " << material_mirror << std::endl;
}

void ArgParser::SetDefaultValues() {
  input_scene = "";
  output_file = "";
  algo = "";
  width = 200;
  height = 200;

  bounces = 0;
  shadows = false;
  add_sphere = false;
  delete_sphere = false;
  material_mirror = false;
}