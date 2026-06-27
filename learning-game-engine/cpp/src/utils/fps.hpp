#pragma once

#include <SDL3/SDL.h>

struct FpsCounter {
    float value = 0;
    float accum = 0;
    int frames = 0;

    void draw(SDL_Renderer* renderer, float dt) {
        accum += dt;
        frames += 1;
        if (accum >= 0.5f) {
            value = static_cast<float>(frames) / accum;
            frames = 0;
            accum = 0;
        }

        SDL_SetRenderDrawColor(renderer, 230, 230, 230, 255);
        SDL_RenderDebugTextFormat(renderer, 8, 8, "FPS: %d", static_cast<int>(value + 0.5f));
    }
};
