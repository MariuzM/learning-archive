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
static constexpr float HERO_SPEED = 320;

int main() {
    App app;
    if (!app.init("Learning Engine - C++ (milestone 1)", WIDTH, HEIGHT)) {
        app.deinit();
        return 1;
    }

    Entity player{100, 100, 220, 170, BOX_SIZE, {77, 166, 242, 255}};
    Entity player2{500, 300, -180, 200, BOX_SIZE, {242, 140, 64, 255}};
    Entity hero{440, 230, 0, 0, BOX_SIZE, {90, 200, 120, 255}};
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
    bool applied_vsync = false;

    bool dragging = false;
    float drag_off_x = 0;
    float drag_off_y = 0;

    Uint64 last = SDL_GetTicks();
    while (!input.quit) {
        const Uint64 now = SDL_GetTicks();
        const float dt = static_cast<float>(now - last) / 1000.0f;
        last = now;

        frame_graph_push(graph, dt);
        process_events(input);

        if (input.mouse_clicked && point_in_entity(hero, input.mouse_x, input.mouse_y)) {
            dragging = true;
            drag_off_x = input.mouse_x - hero.x;
            drag_off_y = input.mouse_y - hero.y;
        }
        if (!input.mouse_down) dragging = false;

        hero.vx = 0;
        hero.vy = 0;
        if (!dragging) {
            if (input.left) hero.vx -= HERO_SPEED;
            if (input.right) hero.vx += HERO_SPEED;
            if (input.up) hero.vy -= HERO_SPEED;
            if (input.down) hero.vy += HERO_SPEED;
        }

        simulate(player, dt, input.win_w, input.win_h);
        simulate(player2, dt, input.win_w, input.win_h);
        if (dragging) {
            drag_hero(hero, input.mouse_x, input.mouse_y, drag_off_x, drag_off_y, input.win_w, input.win_h);
        } else {
            move_hero(hero, dt, input.win_w, input.win_h);
        }

        resolve_collision(player, player2);
        resolve_collision(player, hero);
        resolve_collision(player2, hero);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        draw_entity(app.renderer, player);
        draw_entity(app.renderer, player2);
        draw_entity(app.renderer, hero);

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

    app.deinit();
    return 0;
}
