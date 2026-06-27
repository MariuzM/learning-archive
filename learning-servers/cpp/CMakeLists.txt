cmake_minimum_required(VERSION 3.16)
project(cpp_server CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

set(OPENSSL_USE_STATIC_LIBS TRUE)

find_package(Drogon REQUIRED)

add_executable(server src/main.cpp)
target_include_directories(server PRIVATE vendor)
target_link_libraries(server PRIVATE Drogon::Drogon)
