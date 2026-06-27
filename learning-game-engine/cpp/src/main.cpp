#include <SDL3/SDL.h>
#include <cmath>

static constexpr float WIDTH = 960;
static constexpr float HEIGHT = 540;
static constexpr float BOX_SIZE = 80;

struct Box {
    float x, y;
    float vx, vy;
};

static void simulate(Box& box, float dt) {
    box.x += box.vx * dt;
    box.y += box.vy * dt;

    if (box.x < 0) { box.x = 0; box.vx = std::fabs(box.vx); }
    if (box.y < 0) { box.y = 0; box.vy = std::fabs(box.vy); }

    const float max_x = WIDTH - BOX_SIZE;
    const float max_y = HEIGHT - BOX_SIZE;
    if (box.x > max_x) { box.x = max_x; box.vx = -std::fabs(box.vx); }
    if (box.y > max_y) { box.y = max_y; box.vy = -std::fabs(box.vy); }
}

static void draw(SDL_Renderer* renderer, const Box& box) {
    SDL_SetRenderDrawColor(renderer, 26, 26, 31, 255);
    SDL_RenderClear(renderer);

    SDL_SetRenderDrawColor(renderer, 77, 166, 242, 255);
    SDL_FRect rect{box.x, box.y, BOX_SIZE, BOX_SIZE};
    SDL_RenderFillRect(renderer, &rect);

    SDL_RenderPresent(renderer);
}

int main() {
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        SDL_Log("SDL_Init failed: %s", SDL_GetError());
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow("Learning Engine - C++ (milestone 1)", WIDTH, HEIGHT, 0);
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

    Box box{100, 100, 220, 170};

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
            }
        }

        simulate(box, dt);
        draw(renderer, box);

        SDL_Delay(10);
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();
    return 0;
}
