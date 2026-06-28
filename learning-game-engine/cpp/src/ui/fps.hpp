#pragma once

#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>

struct FpsCounter {
    float value = 0;
    float accum = 0;
    int frames = 0;
    TTF_Font* font = nullptr;
    SDL_Texture* texture = nullptr;
    float tw = 0, th = 0;
    float scale = 1;
    int last_shown = -1;

    bool init(const char* font_path, float render_scale) {
        scale = render_scale;
        if (!TTF_Init()) return false;
        font = TTF_OpenFont(font_path, 16.0f * render_scale);
        return font != nullptr;
    }

    void draw(SDL_Renderer* renderer, float dt) {
        accum += dt;
        frames += 1;
        if (accum >= 0.5f) {
            value = static_cast<float>(frames) / accum;
            frames = 0;
            accum = 0;
        }

        const int shown = static_cast<int>(value + 0.5f);
        if (!texture || shown != last_shown) {
            last_shown = shown;
            if (texture) SDL_DestroyTexture(texture);

            char buf[32];
            SDL_snprintf(buf, sizeof(buf), "FPS: %d", shown);
            SDL_Color white{230, 230, 230, 255};
            SDL_Surface* surf = TTF_RenderText_Blended(font, buf, 0, white);
            texture = SDL_CreateTextureFromSurface(renderer, surf);
            tw = static_cast<float>(surf->w);
            th = static_cast<float>(surf->h);
            SDL_DestroySurface(surf);
        }

        SDL_FRect dst{8, 8, tw / scale, th / scale};
        SDL_RenderTexture(renderer, texture, nullptr, &dst);
    }
};
