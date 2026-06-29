#pragma once

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

#include <array>
#include <format>
#include <print>

#include "text.h"

inline constexpr int GRAPH_SAMPLES = 240;
inline constexpr float GRAPH_X = 8;
inline constexpr float GRAPH_Y = 96;
inline constexpr float GRAPH_W = 240;
inline constexpr float GRAPH_H = 80;
inline constexpr float GRAPH_MAX_MS = 50;
inline constexpr float MS_60 = 16.67f;
inline constexpr float MS_30 = 33.33f;

struct FrameGraph {
    std::array<float, GRAPH_SAMPLES> samples = {};
    int head = 0;
    int count = 0;
};

inline void frame_graph_push(FrameGraph& g, float dt) {
    g.samples[g.head] = dt * 1000.0f;
    g.head = (g.head + 1) % GRAPH_SAMPLES;
    if (g.count < GRAPH_SAMPLES) g.count += 1;
}

inline void draw_threshold(SDL_Renderer* renderer, float ms) {
    const float frac = ms / GRAPH_MAX_MS;
    if (frac > 1.0f) return;
    const float y = GRAPH_Y + GRAPH_H - frac * GRAPH_H;
    SDL_FRect line{GRAPH_X, y, GRAPH_W, 1};
    SDL_SetRenderDrawColor(renderer, 90, 90, 110, 255);
    SDL_RenderFillRect(renderer, &line);
}

inline void draw_frame_graph(FrameGraph& g, SDL_Renderer* renderer, TTF_Font* font, float scale) {
    SDL_FRect bg{GRAPH_X, GRAPH_Y, GRAPH_W, GRAPH_H};
    SDL_SetRenderDrawColor(renderer, 20, 20, 24, 255);
    SDL_RenderFillRect(renderer, &bg);

    draw_threshold(renderer, MS_60);
    draw_threshold(renderer, MS_30);

    if (g.count == 0) return;

    float min_ms = g.samples[0];
    float max_ms = 0;
    float sum = 0;

    const int start = (g.head - g.count + GRAPH_SAMPLES) % GRAPH_SAMPLES;
    for (int i = 0; i < g.count; i++) {
        const float ms = g.samples[(start + i) % GRAPH_SAMPLES];
        if (ms < min_ms) min_ms = ms;
        if (ms > max_ms) max_ms = ms;
        sum += ms;

        float frac = ms / GRAPH_MAX_MS;
        if (frac > 1.0f) frac = 1.0f;
        const float h = frac * GRAPH_H;

        if (ms <= MS_60) {
            SDL_SetRenderDrawColor(renderer, 100, 200, 120, 255);
        } else if (ms <= MS_30) {
            SDL_SetRenderDrawColor(renderer, 230, 200, 80, 255);
        } else {
            SDL_SetRenderDrawColor(renderer, 230, 90, 90, 255);
        }
        SDL_FRect bar{GRAPH_X + static_cast<float>(i), GRAPH_Y + GRAPH_H - h, 1, h};
        SDL_RenderFillRect(renderer, &bar);
    }

    const float avg = sum / static_cast<float>(g.count);
    const float cur = g.samples[(g.head - 1 + GRAPH_SAMPLES) % GRAPH_SAMPLES];

    const std::string text = std::format("cur {:.1f} ms   min {:.1f}   avg {:.1f}   max {:.1f}", cur, min_ms, avg, max_ms);
    draw_text(renderer, font, text, GRAPH_X, GRAPH_Y + GRAPH_H + 4, SDL_Color{210, 210, 210, 255}, scale);
}
