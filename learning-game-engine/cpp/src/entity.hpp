#pragma once

#include <SDL3/SDL.h>
#include <cmath>

struct Color {
    Uint8 r, g, b, a;
};

struct Entity {
    float x, y;
    float vx, vy;
    float size;
    Color color;
};

inline void simulate(Entity& e, float dt, float win_w, float win_h) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    if (e.x < 0) {
        e.x = 0;
        e.vx = std::fabs(e.vx);
    }
    if (e.y < 0) {
        e.y = 0;
        e.vy = std::fabs(e.vy);
    }

    const float max_x = win_w - e.size;
    const float max_y = win_h - e.size;
    if (e.x > max_x) {
        e.x = max_x;
        e.vx = -std::fabs(e.vx);
    }
    if (e.y > max_y) {
        e.y = max_y;
        e.vy = -std::fabs(e.vy);
    }
}

inline void draw_entity(SDL_Renderer* renderer, const Entity& e) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    SDL_FRect rect{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, &rect);
}
