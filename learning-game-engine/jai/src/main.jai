#import "Basic";
#import "Math";

#load "sdl3.jai";
#load "utils/fps.jai";

WIDTH    :: 960.0;
HEIGHT   :: 540.0;
BOX_SIZE :: 80.0;

Color :: struct {
    r, g, b, a: u8;
}

Entity :: struct {
    x, y:   float;
    vx, vy: float;
    size:   float;
    color:  Color;
}

main :: () {
    if !SDL_Init(SDL_INIT_VIDEO) {
        print("SDL_Init failed: %\n", to_string(SDL_GetError()));
        return;
    }
    defer SDL_Quit();

    window := SDL_CreateWindow("Learning Engine - Jai (milestone 1)".data, xx WIDTH, xx HEIGHT, SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIGH_PIXEL_DENSITY);
    if !window {
        print("SDL_CreateWindow failed: %\n", to_string(SDL_GetError()));
        return;
    }
    defer SDL_DestroyWindow(window);

    renderer := SDL_CreateRenderer(window, null);
    if !renderer {
        print("SDL_CreateRenderer failed: %\n", to_string(SDL_GetError()));
        return;
    }
    defer SDL_DestroyRenderer(renderer);

    scale := SDL_GetWindowPixelDensity(window);
    SDL_SetRenderScale(renderer, scale, scale);

    player  := Entity.{100, 100,  220, 170, BOX_SIZE, .{ 77, 166, 242, 255}};
    player2 := Entity.{500, 300, -180, 200, BOX_SIZE, .{242, 140,  64, 255}};

    fps: Fps_Counter;
    if !init_fps(*fps, "../assets/Karla-Regular.ttf", scale) {
        print("Font load failed: %\n", to_string(SDL_GetError()));
        return;
    }

    win_w := WIDTH;
    win_h := HEIGHT;

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
                case SDL_EVENT_KEY_DOWN;       if event.key.scancode == SDL_SCANCODE_ESCAPE then quit = true;
                case SDL_EVENT_WINDOW_RESIZED; win_w = cast(float) event.window.data1; win_h = cast(float) event.window.data2;
            }
        }

        simulate(*player,  dt, win_w, win_h);
        simulate(*player2, dt, win_w, win_h);

        SDL_SetRenderDrawColor(renderer, 26, 26, 31, 255);
        SDL_RenderClear(renderer);
        draw_entity(renderer, player);
        draw_entity(renderer, player2);
        draw_fps(*fps, renderer, dt);
        SDL_RenderPresent(renderer);

        SDL_Delay(10);
        reset_temporary_storage();
    }
}

simulate :: (e: *Entity, dt: float, win_w: float, win_h: float) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    if e.x < 0 { e.x = 0; e.vx = abs(e.vx); }
    if e.y < 0 { e.y = 0; e.vy = abs(e.vy); }

    max_x := win_w - e.size;
    max_y := win_h - e.size;
    if e.x > max_x { e.x = max_x; e.vx = -abs(e.vx); }
    if e.y > max_y { e.y = max_y; e.vy = -abs(e.vy); }
}

draw_entity :: (renderer: *SDL_Renderer, e: Entity) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    rect := SDL_FRect.{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, *rect);
}

#run {
    #if OS == .WINDOWS {
        WR :: #import "Windows_Resources";
        WR.disable_runtime_console();
    }
}
