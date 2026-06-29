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

WIDTH      :: 960.0;
HEIGHT     :: 540.0;
BOX_SIZE   :: 80.0;
HERO_SPEED :: 320.0;

main :: () {
    app: App;
    if !init_app(*app, "Learning Engine - Jai (milestone 1)", WIDTH, HEIGHT) return;
    defer deinit_app(*app);

    player  := Entity.{100, 100,  220, 170, BOX_SIZE, .{ 77, 166, 242, 255}};
    player2 := Entity.{500, 300, -180, 200, BOX_SIZE, .{242, 140,  64, 255}};
    ghost   := Entity.{200, 400,  150, -90, BOX_SIZE, .{200,  80, 200, 255}};
    hero    := Entity.{440, 230,    0,   0, BOX_SIZE, .{ 90, 200, 120, 120}};

    fps: Fps_Counter;
    if !init_fps(*fps, "../assets/Karla-Regular.ttf", app.scale) {
        print("Font load failed: %\n", to_string(SDL_GetError()));
        return;
    }

    input: Input;
    input.win_w = WIDTH;
    input.win_h = HEIGHT;

    graph: Frame_Graph;
    applied_vsync := false;

    dragging  := false;
    drag_off_x: float;
    drag_off_y: float;

    last := SDL_GetTicks();
    while !input.quit {
        now := SDL_GetTicks();
        dt  := cast(float)(now - last) / 1000.0;
        last = now;

        frame_graph_push(*graph, dt);
        process_events(*input);

        if input.mouse_clicked && point_in_entity(hero, input.mouse_x, input.mouse_y) {
            dragging   = true;
            drag_off_x = input.mouse_x - hero.x;
            drag_off_y = input.mouse_y - hero.y;
        }
        if !input.mouse_down  dragging = false;

        hero.vx = 0;
        hero.vy = 0;
        if !dragging {
            if input.left   hero.vx -= HERO_SPEED;
            if input.right  hero.vx += HERO_SPEED;
            if input.up     hero.vy -= HERO_SPEED;
            if input.down   hero.vy += HERO_SPEED;
        }

        if !input.paused {
            simulate(*player,  dt, input.win_w, input.win_h);
            simulate(*player2, dt, input.win_w, input.win_h);
            simulate(*ghost,   dt, input.win_w, input.win_h);
        }
        if dragging {
            drag_hero(*hero, input.mouse_x, input.mouse_y, drag_off_x, drag_off_y, input.win_w, input.win_h);
        } else {
            move_hero(*hero, dt, input.win_w, input.win_h);
        }

        resolve_collision(*player,  *player2);
        resolve_collision(*player,  *hero);
        resolve_collision(*player2, *hero);

        clamp_bounds(*player,  input.win_w, input.win_h);
        clamp_bounds(*player2, input.win_w, input.win_h);
        clamp_bounds(*hero,    input.win_w, input.win_h);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        draw_entity(app.renderer, player);
        draw_entity(app.renderer, player2);
        draw_entity(app.renderer, ghost);
        draw_entity(app.renderer, hero);
        
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
