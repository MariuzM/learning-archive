#pragma once

#include <SDL3/SDL.h>

#include "../entity.h"

inline SDL_Texture* load_sprite(SDL_Renderer* renderer, const char* path) {
    SDL_Surface* surf = SDL_LoadBMP(path);
    if (!surf) return nullptr;
    SDL_Texture* texture = SDL_CreateTextureFromSurface(renderer, surf);
    SDL_DestroySurface(surf);
    if (texture) SDL_SetTextureBlendMode(texture, SDL_BLENDMODE_BLEND);
    return texture;
}

inline void draw_sprite(SDL_Renderer* renderer, SDL_Texture* texture, const Entity& e) {
    SDL_FRect dst{e.x, e.y, e.size, e.size};
    SDL_RenderTexture(renderer, texture, nullptr, &dst);
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
    SDL_RenderRect(renderer, &dst);
}
