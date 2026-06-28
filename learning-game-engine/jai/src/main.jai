#import "Basic";
#import "Math";

#load "platform/sdl3.jai";
#load "platform/platform.jai";
#load "input/input.jai";
#load "ui/components/text.jai";
#load "ui/components/button.jai";
#load "ui/components/graph.jai";
#load "ui/ui.jai";
#load "game/entity.jai";
#load "ui/fps.jai";

WIDTH    :: 960.0;
HEIGHT   :: 540.0;
BOX_SIZE :: 80.0;

main :: () {
    app: App;
    if !init_app(*app, "Learning Engine - Jai (milestone 1)", WIDTH, HEIGHT) return;
    defer deinit_app(*app);

    player  := Entity.{100, 100,  220, 170, BOX_SIZE, .{ 77, 166, 242, 255}};
    player2 := Entity.{500, 300, -180, 200, BOX_SIZE, .{242, 140,  64, 255}};

    fps: Fps_Counter;
    if !init_fps(*fps, "../assets/Karla-Regular.ttf", app.scale) {
        print("Font load failed: %\n", to_string(SDL_GetError()));
        return;
    }

    input: Input;
    input.win_w = WIDTH;
    input.win_h = HEIGHT;

    graph: Frame_Graph;

    last := SDL_GetTicks();
    while !input.quit {
        now := SDL_GetTicks();
        dt  := cast(float)(now - last) / 1000.0;
        last = now;

        frame_graph_push(*graph, dt);
        process_events(*input);

        simulate(*player,  dt, input.win_w, input.win_h);
        simulate(*player2, dt, input.win_w, input.win_h);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        draw_entity(app.renderer, player);
        draw_entity(app.renderer, player2);
        if input.show_fps {
			draw_fps(*fps, app.renderer, dt);
		}
        if input.debug {
            draw_debug(*input, app.renderer, fps.font, app.scale);
            draw_frame_graph(*graph, app.renderer, fps.font, app.scale);
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
