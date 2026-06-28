#pragma once

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

#include <functional>
#include <string_view>

#include "../../input/input.hpp"
#include "text.hpp"

struct Button {
    std::string_view label;
    SDL_FRect rect;
    bool active;
    std::function<void()> on_click;
};

inline bool inside(const SDL_FRect& r, float x, float y) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

inline void button(const Button& b, const Input& input, SDL_Renderer* renderer, TTF_Font* font, float scale) {
    SDL_FRect r = b.rect;
    if (b.active) {
        SDL_SetRenderDrawColor(renderer, 77, 166, 242, 255);
    } else {
        SDL_SetRenderDrawColor(renderer, 50, 50, 58, 255);
    }
    SDL_RenderFillRect(renderer, &r);

    const SDL_Color text_color = b.active ? SDL_Color{0, 0, 0, 255} : SDL_Color{230, 230, 230, 255};
    draw_text_centered(renderer, font, b.label, b.rect, text_color, scale);

    if (input.mouse_clicked && inside(b.rect, input.mouse_x, input.mouse_y)) {
        if (b.on_click) b.on_click();
    }
}
