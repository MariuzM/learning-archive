#include <SDL3/SDL.h>

#include "entity.hpp"
#include "platform.hpp"
#include "utils/fps.hpp"

static constexpr float WIDTH = 960;
static constexpr float HEIGHT = 540;
static constexpr float BOX_SIZE = 80;

int main() {
    App app;
    if (!app.init("Learning Engine - C++ (milestone 1)", WIDTH, HEIGHT)) {
        app.deinit();
        return 1;
    }

    Entity player{100, 100, 220, 170, BOX_SIZE, {77, 166, 242, 255}};
    Entity player2{500, 300, -180, 200, BOX_SIZE, {242, 140, 64, 255}};
    FpsCounter fps;
    if (!fps.init("../assets/Karla-Regular.ttf", app.scale)) {
        SDL_Log("Font load failed: %s", SDL_GetError());
        app.deinit();
        return 1;
    }
    float win_w = WIDTH;
    float win_h = HEIGHT;

    Uint64 last = SDL_GetTicks();
    bool quit = false;
    while (!quit) {
        const Uint64 now = SDL_GetTicks();
        const float dt = static_cast<float>(now - last) / 1000.0f;
        last = now;

        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_EVENT_QUIT) {
                quit = true;
            } else if (event.type == SDL_EVENT_KEY_DOWN) {
                if (event.key.scancode == SDL_SCANCODE_ESCAPE) quit = true;
            } else if (event.type == SDL_EVENT_WINDOW_RESIZED) {
                win_w = static_cast<float>(event.window.data1);
                win_h = static_cast<float>(event.window.data2);
            }
        }

        simulate(player, dt, win_w, win_h);
        simulate(player2, dt, win_w, win_h);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        draw_entity(app.renderer, player);
        draw_entity(app.renderer, player2);
        fps.draw(app.renderer, dt);
        SDL_RenderPresent(app.renderer);

        SDL_Delay(10);
    }

    app.deinit();
    return 0;
}
