#include <SDL3/SDL.h>
#include <cmath>

#include "utils/fps.hpp"

static constexpr float WIDTH = 960;
static constexpr float HEIGHT = 540;
static constexpr float BOX_SIZE = 80;

struct Color {
    Uint8 r, g, b, a;
};

struct Entity {
    float x, y;
    float vx, vy;
    float size;
    Color color;
};

static void simulate(Entity& e, float dt, float win_w, float win_h) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    if (e.x < 0) {
        e.x = 0;
        e.vx = std::fabs(e.vx);
    }
    if (e.y < 0) {
        e.y = 0;
        e.vy = std::fabs(e.vy);
    }

    const float max_x = win_w - e.size;
    const float max_y = win_h - e.size;
    if (e.x > max_x) {
        e.x = max_x;
        e.vx = -std::fabs(e.vx);
    }
    if (e.y > max_y) {
        e.y = max_y;
        e.vy = -std::fabs(e.vy);
    }
}

static void draw_entity(SDL_Renderer* renderer, const Entity& e) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    SDL_FRect rect{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, &rect);
}

int main() {
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow("Learning Engine - C++ (milestone 1)",
                                          WIDTH, HEIGHT, SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIGH_PIXEL_DENSITY);
    if (!window) {
        SDL_Log("SDL_CreateWindow failed: %s", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    SDL_Renderer* renderer = SDL_CreateRenderer(window, nullptr);
    if (!renderer) {
        SDL_Log("SDL_CreateRenderer failed: %s", SDL_GetError());
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    const float scale = SDL_GetWindowPixelDensity(window);
    SDL_SetRenderScale(renderer, scale, scale);

    Entity player{100, 100, 220, 170, BOX_SIZE, {77, 166, 242, 255}};
    Entity player2{500, 300, -180, 200, BOX_SIZE, {242, 140, 64, 255}};
    FpsCounter fps;
    if (!fps.init("../assets/Karla-Regular.ttf", scale)) {
        SDL_Log("Font load failed: %s", SDL_GetError());
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

        SDL_SetRenderDrawColor(renderer, 26, 26, 31, 255);
        SDL_RenderClear(renderer);
        draw_entity(renderer, player);
        draw_entity(renderer, player2);
        fps.draw(renderer, dt);
        SDL_RenderPresent(renderer);

        SDL_Delay(10);
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
