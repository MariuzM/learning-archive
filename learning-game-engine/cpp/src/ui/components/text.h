#pragma once

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

#include <string_view>

inline void draw_text(SDL_Renderer* renderer, TTF_Font* font, std::string_view text, float x, float y, SDL_Color color, float scale) {
    SDL_Surface* surf = TTF_RenderText_Blended(font, text.data(), text.size(), color);
    SDL_Texture* tex = SDL_CreateTextureFromSurface(renderer, surf);
    const float tw = static_cast<float>(surf->w) / scale;
    const float th = static_cast<float>(surf->h) / scale;
    SDL_FRect dst{x, y, tw, th};
    SDL_RenderTexture(renderer, tex, nullptr, &dst);
    SDL_DestroySurface(surf);
    SDL_DestroyTexture(tex);
}

inline void draw_text_centered(SDL_Renderer* renderer, TTF_Font* font, std::string_view text, const SDL_FRect& rect, SDL_Color color, float scale) {
    int w, h;
    TTF_GetStringSize(font, text.data(), text.size(), &w, &h);
    const float tw = static_cast<float>(w) / scale;
    const float th = static_cast<float>(h) / scale;
    draw_text(renderer, font, text, rect.x + (rect.w - tw) / 2, rect.y + (rect.h - th) / 2, color, scale);
}
