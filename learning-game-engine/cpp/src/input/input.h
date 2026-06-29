#pragma once

#include <SDL3/SDL.h>

struct Input {
    bool quit = false;
    bool debug = false;
    bool show_fps = true;
    bool vsync = false;
    int fps_cap = 0;
    float win_w = 0;
    float win_h = 0;
    float mouse_x = 0;
    float mouse_y = 0;
    bool mouse_clicked = false;
    bool mouse_down = false;
    bool up = false;
    bool down = false;
    bool left = false;
    bool right = false;
};

inline void process_events(Input& in) {
    in.mouse_clicked = false;

    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        if (event.type == SDL_EVENT_QUIT) {
            in.quit = true;
        } else if (event.type == SDL_EVENT_WINDOW_RESIZED) {
            in.win_w = static_cast<float>(event.window.data1);
            in.win_h = static_cast<float>(event.window.data2);
        } else if (event.type == SDL_EVENT_MOUSE_BUTTON_DOWN) {
            in.mouse_clicked = true;
            in.mouse_down = true;
            in.mouse_x = event.button.x;
            in.mouse_y = event.button.y;
        } else if (event.type == SDL_EVENT_MOUSE_BUTTON_UP) {
            in.mouse_down = false;
            in.mouse_x = event.button.x;
            in.mouse_y = event.button.y;
        } else if (event.type == SDL_EVENT_MOUSE_MOTION) {
            in.mouse_x = event.motion.x;
            in.mouse_y = event.motion.y;
        } else if (event.type == SDL_EVENT_KEY_DOWN) {
            switch (event.key.scancode) {
                case SDL_SCANCODE_ESCAPE: in.quit = true; break;
                case SDL_SCANCODE_GRAVE: in.debug = !in.debug; break;
                case SDL_SCANCODE_1: in.fps_cap = 15; break;
                case SDL_SCANCODE_2: in.fps_cap = 30; break;
                case SDL_SCANCODE_3: in.fps_cap = 45; break;
                case SDL_SCANCODE_4: in.fps_cap = 60; break;
                case SDL_SCANCODE_5: in.fps_cap = 0; break;
                case SDL_SCANCODE_UP: in.up = true; break;
                case SDL_SCANCODE_DOWN: in.down = true; break;
                case SDL_SCANCODE_LEFT: in.left = true; break;
                case SDL_SCANCODE_RIGHT: in.right = true; break;
                default: break;
            }
        } else if (event.type == SDL_EVENT_KEY_UP) {
            switch (event.key.scancode) {
                case SDL_SCANCODE_UP: in.up = false; break;
                case SDL_SCANCODE_DOWN: in.down = false; break;
                case SDL_SCANCODE_LEFT: in.left = false; break;
                case SDL_SCANCODE_RIGHT: in.right = false; break;
                default: break;
            }
        }
    }
}
