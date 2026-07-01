#pragma once

#include <SDL3/SDL.h>

struct Color {
    Uint8 r, g, b, a;
};

struct Entity {
    float x, y;
    float vx, vy;
    float size;
    Color color;
    bool solid;
};
