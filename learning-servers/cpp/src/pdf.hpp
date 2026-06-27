#pragma once

#include <string>
#include <string_view>
#include <vector>

extern std::string JPEG;
extern std::vector<std::string> LINES;

std::string build_pdf(std::string_view heading);
