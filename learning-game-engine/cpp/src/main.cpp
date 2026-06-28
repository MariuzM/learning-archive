#include <SDL3/SDL.h>

#include "game/entity.hpp"
#include "input/input.hpp"
#include "platform/platform.hpp"
#include "ui/components/graph.hpp"
#include "ui/fps.hpp"
#include "ui/ui.hpp"

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

    Input input;
    input.win_w = WIDTH;
    input.win_h = HEIGHT;

    FrameGraph graph;

    Uint64 last = SDL_GetTicks();
    while (!input.quit) {
        const Uint64 now = SDL_GetTicks();
        const float dt = static_cast<float>(now - last) / 1000.0f;
        last = now;

        frame_graph_push(graph, dt);
        process_events(input);

        simulate(player, dt, input.win_w, input.win_h);
        simulate(player2, dt, input.win_w, input.win_h);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        draw_entity(app.renderer, player);
        draw_entity(app.renderer, player2);
        if (input.show_fps) fps.draw(app.renderer, dt);
        if (input.debug) {
            draw_debug(input, app.renderer, fps.font, app.scale);
            draw_frame_graph(graph, app.renderer, fps.font, app.scale);
        }
        SDL_RenderPresent(app.renderer);

        if (input.fps_cap > 0) {
            const Uint32 target_ms = 1000 / input.fps_cap;
            const Uint32 elapsed = static_cast<Uint32>(SDL_GetTicks() - now);
            if (elapsed < target_ms) SDL_Delay(target_ms - elapsed);
        }
    }

    app.deinit();
    return 0;
}
