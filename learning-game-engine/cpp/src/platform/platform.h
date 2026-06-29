#pragma once

#include <SDL3/SDL.h>

struct App {
    SDL_Window* window = nullptr;
    SDL_Renderer* renderer = nullptr;
    float scale = 1;

    bool init(const char* title, float w, float h) {
        if (!SDL_Init(SDL_INIT_VIDEO)) {
            SDL_Log("SDL_Init failed: %s", SDL_GetError());
            return false;
        }

        window = SDL_CreateWindow(title, w, h, SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIGH_PIXEL_DENSITY);
        if (!window) {
            SDL_Log("SDL_CreateWindow failed: %s", SDL_GetError());
            return false;
        }

        renderer = SDL_CreateRenderer(window, nullptr);
        if (!renderer) {
            SDL_Log("SDL_CreateRenderer failed: %s", SDL_GetError());
            return false;
        }

        scale = SDL_GetWindowPixelDensity(window);
        SDL_SetRenderScale(renderer, scale, scale);
        SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);
        return true;
    }

    void deinit() {
        if (renderer) SDL_DestroyRenderer(renderer);
        if (window) SDL_DestroyWindow(window);
        SDL_Quit();
    }
};
