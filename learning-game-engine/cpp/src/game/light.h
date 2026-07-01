#pragma once

#include <SDL3/SDL.h>

#include <array>
#include <cmath>

#include "entity.h"

inline constexpr int LIGHT_SEGMENTS = 64;
inline constexpr float SHADOW_DIST = 3000.0f;

inline void draw_light(SDL_Renderer* renderer, float cx, float cy, float radius, SDL_FColor col) {
    const SDL_FColor center = col;
    const SDL_FColor edge{col.r, col.g, col.b, 0};

    std::array<SDL_Vertex, LIGHT_SEGMENTS + 1> verts;
    std::array<int, LIGHT_SEGMENTS * 3> indices;

    verts[0] = SDL_Vertex{{cx, cy}, center, {0, 0}};
    for (int i = 0; i < LIGHT_SEGMENTS; ++i) {
        const float ang = (static_cast<float>(i) / LIGHT_SEGMENTS) * (2.0f * static_cast<float>(M_PI));
        const float px = cx + std::cos(ang) * radius;
        const float py = cy + std::sin(ang) * radius;
        verts[i + 1] = SDL_Vertex{{px, py}, edge, {0, 0}};

        indices[i * 3 + 0] = 0;
        indices[i * 3 + 1] = i + 1;
        indices[i * 3 + 2] = ((i + 1) % LIGHT_SEGMENTS) + 1;
    }

    SDL_RenderGeometry(renderer, nullptr, verts.data(), verts.size(), indices.data(), indices.size());
}

inline SDL_FPoint project_from(SDL_FPoint p, float cx, float cy) {
    const float dx = p.x - cx;
    const float dy = p.y - cy;
    const float len = std::sqrt(dx * dx + dy * dy);
    if (len == 0) return p;
    return SDL_FPoint{p.x + (dx / len) * SHADOW_DIST, p.y + (dy / len) * SHADOW_DIST};
}

inline void fill_quad(SDL_Renderer* renderer, SDL_FPoint p0, SDL_FPoint p1, SDL_FPoint p2, SDL_FPoint p3, SDL_FColor col) {
    const std::array<SDL_Vertex, 4> verts{
        SDL_Vertex{p0, col, {0, 0}},
        SDL_Vertex{p1, col, {0, 0}},
        SDL_Vertex{p2, col, {0, 0}},
        SDL_Vertex{p3, col, {0, 0}},
    };
    const std::array<int, 6> indices{0, 1, 2, 0, 2, 3};
    SDL_RenderGeometry(renderer, nullptr, verts.data(), verts.size(), indices.data(), indices.size());
}

inline void cast_shadow(SDL_Renderer* renderer, float cx, float cy, const Entity& box, SDL_FColor col) {
    const std::array<SDL_FPoint, 4> corners{
        SDL_FPoint{box.x, box.y},
        SDL_FPoint{box.x + box.size, box.y},
        SDL_FPoint{box.x + box.size, box.y + box.size},
        SDL_FPoint{box.x, box.y + box.size},
    };
    const std::array<SDL_FPoint, 4> normals{
        SDL_FPoint{0, -1},
        SDL_FPoint{1, 0},
        SDL_FPoint{0, 1},
        SDL_FPoint{-1, 0},
    };

    for (int i = 0; i < 4; ++i) {
        const SDL_FPoint a = corners[i];
        const SDL_FPoint b = corners[(i + 1) % 4];

        const float mx = (a.x + b.x) * 0.5f;
        const float my = (a.y + b.y) * 0.5f;
        const float lx = cx - mx;
        const float ly = cy - my;

        if (normals[i].x * lx + normals[i].y * ly < 0) {
            const SDL_FPoint a_far = project_from(a, cx, cy);
            const SDL_FPoint b_far = project_from(b, cx, cy);
            fill_quad(renderer, a, b, b_far, a_far, col);
        }
    }
}
