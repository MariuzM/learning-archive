#include <SDL3/SDL.h>

#include "input/input.h"
#include "platform/platform.h"
#include "render/sprite.h"
#include "scene/world.h"
#include "ui/components/graph.h"
#include "ui/fps.h"
#include "ui/ui.h"

static constexpr float WIDTH = 960;
static constexpr float HEIGHT = 540;

int main() {
    App app;
    if (!app.init("Learning Engine - C++ (milestone 1)", WIDTH, HEIGHT)) {
        app.deinit();
        return 1;
    }

    World world;

    FpsCounter fps;
    if (!fps.init("../assets/Karla-Regular.ttf", app.scale)) {
        SDL_Log("Font load failed: %s", SDL_GetError());
        app.deinit();
        return 1;
    }

    SDL_Texture* hero_sprite = load_sprite(app.renderer, "../assets/hero.bmp");

    Input input;
    input.win_w = WIDTH;
    input.win_h = HEIGHT;

    FrameGraph graph;
    bool applied_vsync = false;

    Uint64 last = SDL_GetTicks();
    while (!input.quit) {
        const Uint64 now = SDL_GetTicks();
        const float dt = static_cast<float>(now - last) / 1000.0f;
        last = now;

        frame_graph_push(graph, dt);
        process_events(input);

        world.update(input, dt);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        world.render(app.renderer, hero_sprite);

        if (input.show_fps) {
            fps.draw(app.renderer, dt);
        }
        if (input.debug) {
            draw_debug(input, app.renderer, fps.font, app.scale);
            draw_frame_graph(graph, app.renderer, fps.font, app.scale);
        }
        if (input.vsync != applied_vsync) {
            SDL_SetRenderVSync(app.renderer, input.vsync ? 1 : 0);
            applied_vsync = input.vsync;
        }

        SDL_RenderPresent(app.renderer);

        if (input.fps_cap > 0) {
            const Uint32 target_ms = 1000 / input.fps_cap;
            const Uint32 elapsed = static_cast<Uint32>(SDL_GetTicks() - now);
            if (elapsed < target_ms) SDL_Delay(target_ms - elapsed);
        }
    }

    if (hero_sprite) SDL_DestroyTexture(hero_sprite);
    app.deinit();
    return 0;
}
