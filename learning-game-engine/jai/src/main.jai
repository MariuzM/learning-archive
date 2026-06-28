#import "Basic";
#import "Math";

#load "sdl3.jai";
#load "platform.jai";
#load "entity.jai";
#load "utils/fps.jai";

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

    win_w := WIDTH;
    win_h := HEIGHT;
    show_fps := true;

    last := SDL_GetTicks();
    quit := false;
    while !quit {
        now := SDL_GetTicks();
        dt  := cast(float)(now - last) / 1000.0;
        last = now;

        event: SDL_Event;
        while SDL_PollEvent(*event) {
            if event.type == {
                case SDL_EVENT_QUIT;           quit = true;
                case SDL_EVENT_KEY_DOWN;
                    if event.key.scancode == SDL_SCANCODE_ESCAPE then quit = true;
                    if event.key.scancode == SDL_SCANCODE_GRAVE  then show_fps = !show_fps;
                case SDL_EVENT_WINDOW_RESIZED; win_w = cast(float) event.window.data1; win_h = cast(float) event.window.data2;
            }
        }

        simulate(*player,  dt, win_w, win_h);
        simulate(*player2, dt, win_w, win_h);

        SDL_SetRenderDrawColor(app.renderer, 26, 26, 31, 255);
        SDL_RenderClear(app.renderer);
        draw_entity(app.renderer, player);
        draw_entity(app.renderer, player2);
        if show_fps draw_fps(*fps, app.renderer, dt);
        SDL_RenderPresent(app.renderer);

        SDL_Delay(10);
        reset_temporary_storage();
    }
}

#run {
    #if OS == .WINDOWS {
        WR :: #import "Windows_Resources";
        WR.disable_runtime_console();
    }
}
