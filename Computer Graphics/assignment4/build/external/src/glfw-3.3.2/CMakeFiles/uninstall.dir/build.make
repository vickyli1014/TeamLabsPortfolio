# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.27

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:

#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:

# Disable VCS-based implicit rules.
% : %,v

# Disable VCS-based implicit rules.
% : RCS/%

# Disable VCS-based implicit rules.
% : RCS/%,v

# Disable VCS-based implicit rules.
% : SCCS/s.%

# Disable VCS-based implicit rules.
% : s.%

.SUFFIXES: .hpux_make_needs_suffix_list

# Command-line flag to silence nested $(MAKE).
$(VERBOSE)MAKESILENT = -s

#Suppress display of executed commands.
$(VERBOSE).SILENT:

# A target that is always out of date.
cmake_force:
.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /opt/homebrew/Cellar/cmake/3.27.4/bin/cmake

# The command to remove a file.
RM = /opt/homebrew/Cellar/cmake/3.27.4/bin/cmake -E rm -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /Users/vickyli/6.4400/assignment4

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /Users/vickyli/6.4400/assignment4/build

# Utility rule file for uninstall.

# Include any custom commands dependencies for this target.
include external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/compiler_depend.make

# Include the progress variables for this target.
include external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/progress.make

external/src/glfw-3.3.2/CMakeFiles/uninstall:
	cd /Users/vickyli/6.4400/assignment4/build/external/src/glfw-3.3.2 && /opt/homebrew/Cellar/cmake/3.27.4/bin/cmake -P /Users/vickyli/6.4400/assignment4/build/external/src/glfw-3.3.2/cmake_uninstall.cmake

uninstall: external/src/glfw-3.3.2/CMakeFiles/uninstall
uninstall: external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/build.make
.PHONY : uninstall

# Rule to build all files generated by this target.
external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/build: uninstall
.PHONY : external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/build

external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/clean:
	cd /Users/vickyli/6.4400/assignment4/build/external/src/glfw-3.3.2 && $(CMAKE_COMMAND) -P CMakeFiles/uninstall.dir/cmake_clean.cmake
.PHONY : external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/clean

external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/depend:
	cd /Users/vickyli/6.4400/assignment4/build && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /Users/vickyli/6.4400/assignment4 /Users/vickyli/6.4400/assignment4/external/src/glfw-3.3.2 /Users/vickyli/6.4400/assignment4/build /Users/vickyli/6.4400/assignment4/build/external/src/glfw-3.3.2 /Users/vickyli/6.4400/assignment4/build/external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/DependInfo.cmake "--color=$(COLOR)"
.PHONY : external/src/glfw-3.3.2/CMakeFiles/uninstall.dir/depend

