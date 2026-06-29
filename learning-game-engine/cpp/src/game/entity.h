#pragma once

#include <SDL3/SDL.h>

#include <algorithm>
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

inline void move_hero(Entity& e, float dt, float win_w, float win_h) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    e.x = std::clamp(e.x, 0.0f, win_w - e.size);
    e.y = std::clamp(e.y, 0.0f, win_h - e.size);
}

inline bool point_in_entity(const Entity& e, float px, float py) {
    return px >= e.x && px <= e.x + e.size && py >= e.y && py <= e.y + e.size;
}

inline void drag_hero(Entity& e, float px, float py, float off_x, float off_y, float win_w, float win_h) {
    e.x = px - off_x;
    e.y = py - off_y;

    e.x = std::clamp(e.x, 0.0f, win_w - e.size);
    e.y = std::clamp(e.y, 0.0f, win_h - e.size);
}

inline void clamp_bounds(Entity& e, float win_w, float win_h) {
    e.x = std::clamp(e.x, 0.0f, win_w - e.size);
    e.y = std::clamp(e.y, 0.0f, win_h - e.size);
}

inline void resolve_collision(Entity& a, Entity& b) {
    const float ox = std::fmin(a.x + a.size, b.x + b.size) - std::fmax(a.x, b.x);
    const float oy = std::fmin(a.y + a.size, b.y + b.size) - std::fmax(a.y, b.y);
    if (ox <= 0 || oy <= 0) return;

    if (ox < oy) {
        const float push = ox / 2;
        if (a.x < b.x) {
            a.x -= push;
            b.x += push;
        } else {
            a.x += push;
            b.x -= push;
        }
        a.vx = -a.vx;
        b.vx = -b.vx;
    } else {
        const float push = oy / 2;
        if (a.y < b.y) {
            a.y -= push;
            b.y += push;
        } else {
            a.y += push;
            b.y -= push;
        }
        a.vy = -a.vy;
        b.vy = -b.vy;
    }
}

inline void draw_entity(SDL_Renderer* renderer, const Entity& e) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    SDL_FRect rect{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, &rect);
}
