#pragma once

#include <SDL3/SDL.h>

#include "../entity.h"

inline void draw_entity(SDL_Renderer* renderer, const Entity& e) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    SDL_FRect rect{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, &rect);
}
