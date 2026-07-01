#import "Basic";
#import "Math";

#load "platform/sdl3.jai";
#load "platform/platform.jai";
#load "input/input.jai";
#load "entity.jai";
#load "physics.jai";
#load "render/render.jai";
#load "render/sprite.jai";
#load "render/light.jai";
#load "scene/world.jai";
#load "ui/components/text.jai";
#load "ui/components/button.jai";
#load "ui/components/graph.jai";
#load "ui/ui.jai";
#load "ui/fps.jai";

WIDTH  :: 960.0;
HEIGHT :: 540.0;

main :: () {
    app: App;
    if !init_app(*app, "Learning Engine - Jai (milestone 1)", WIDTH, HEIGHT) return;
    defer deinit_app(*app);

    world := make_world();

    fps: Fps_Counter;
    if !init_fps(*fps, "../assets/Karla-Regular.ttf", app.scale) {
        print("Font load failed: %\n", to_string(SDL_GetError()));
        return;
    }

    hero_sprite := load_sprite(app.renderer, "../assets/hero.bmp");
    defer if hero_sprite  SDL_DestroyTexture(hero_sprite);

    input: Input;
    input.win_w = WIDTH;
    input.win_h = HEIGHT;

    graph: Frame_Graph;
    applied_vsync := false;

    last := SDL_GetTicks();
    while !input.quit {
        now := SDL_GetTicks();
        dt  := cast(float)(now - last) / 1000.0;
        last = now;

        frame_graph_push(*graph, dt);
        process_events(*input);

        update_world(*world, *input, dt);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        render_world(*world, app.renderer, hero_sprite);

		if input.show_fps {
			draw_fps(*fps, app.renderer, dt);
		}
        if input.debug {
            draw_debug(*input, app.renderer, fps.font, app.scale);
            draw_frame_graph(*graph, app.renderer, fps.font, app.scale);
        }
        if input.vsync != applied_vsync {
            SDL_SetRenderVSync(app.renderer, cast(s32)(ifx input.vsync then 1 else 0));
            applied_vsync = input.vsync;
        }

        SDL_RenderPresent(app.renderer);

        if input.fps_cap > 0 {
            target_ms := cast(u32)(1000 / input.fps_cap);
            elapsed   := cast(u32)(SDL_GetTicks() - now);
            if elapsed < target_ms  SDL_Delay(target_ms - elapsed);
        }
        reset_temporary_storage();
    }
}

#run {
    #if OS == .WINDOWS {
        WR :: #import "Windows_Resources";
        WR.disable_runtime_console();
    }
}
