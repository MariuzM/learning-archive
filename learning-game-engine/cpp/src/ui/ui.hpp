#pragma once

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

#include "../input/input.hpp"
#include "components/button.hpp"

inline constexpr int FPS_CAPS[] = {15, 30, 45, 60, 0};
inline constexpr const char* FPS_LABELS[] = {"15", "30", "45", "60", "OFF"};
inline constexpr int FPS_COUNT = 5;

inline constexpr float BTN_X = 8;
inline constexpr float BTN_Y = 34;
inline constexpr float BTN_W = 44;
inline constexpr float BTN_H = 24;
inline constexpr float BTN_GAP = 6;
inline constexpr float TOGGLE_W = 60;
inline constexpr float CAP_Y = BTN_Y + BTN_H + BTN_GAP;

inline SDL_FRect fps_toggle_rect() {
    return SDL_FRect{BTN_X, BTN_Y, TOGGLE_W, BTN_H};
}

inline SDL_FRect cap_button_rect(int i) {
    return SDL_FRect{BTN_X + static_cast<float>(i) * (BTN_W + BTN_GAP), CAP_Y, BTN_W, BTN_H};
}

inline void draw_debug(Input& input, SDL_Renderer* renderer, TTF_Font* font, float scale) {
    button(Button{"FPS", fps_toggle_rect(), input.show_fps, [&] { input.show_fps = !input.show_fps; }},
           input, renderer, font, scale);

    for (int i = 0; i < FPS_COUNT; i++) {
        const int cap = FPS_CAPS[i];
        button(Button{FPS_LABELS[i], cap_button_rect(i), cap == input.fps_cap, [&input, cap] { input.fps_cap = cap; }},
               input, renderer, font, scale);
    }
}
