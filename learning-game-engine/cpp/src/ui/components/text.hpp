#pragma once

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

inline void draw_text(SDL_Renderer* renderer, TTF_Font* font, const char* text, float x, float y, SDL_Color color, float scale) {
    SDL_Surface* surf = TTF_RenderText_Blended(font, text, 0, color);
    SDL_Texture* tex = SDL_CreateTextureFromSurface(renderer, surf);
    const float tw = static_cast<float>(surf->w) / scale;
    const float th = static_cast<float>(surf->h) / scale;
    SDL_FRect dst{x, y, tw, th};
    SDL_RenderTexture(renderer, tex, nullptr, &dst);
    SDL_DestroySurface(surf);
    SDL_DestroyTexture(tex);
}

inline void draw_text_centered(SDL_Renderer* renderer, TTF_Font* font, const char* text, const SDL_FRect& rect, SDL_Color color, float scale) {
    int w, h;
    TTF_GetStringSize(font, text, 0, &w, &h);
    const float tw = static_cast<float>(w) / scale;
    const float th = static_cast<float>(h) / scale;
    draw_text(renderer, font, text, rect.x + (rect.w - tw) / 2, rect.y + (rect.h - th) / 2, color, scale);
}
