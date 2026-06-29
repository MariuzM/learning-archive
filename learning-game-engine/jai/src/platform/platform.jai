App :: struct {
    window:   *SDL_Window;
    renderer: *SDL_Renderer;
    scale:    float;
}

init_app :: (app: *App, title: string, w: float, h: float) -> bool {
    if !SDL_Init(SDL_INIT_VIDEO) {
        print("SDL_Init failed: %\n", to_string(SDL_GetError()));
        return false;
    }

    app.window = SDL_CreateWindow(temp_c_string(title), xx w, xx h, SDL_WINDOW_RESIZABLE | SDL_WINDOW_HIGH_PIXEL_DENSITY);
    if !app.window {
        print("SDL_CreateWindow failed: %\n", to_string(SDL_GetError()));
        return false;
    }

    app.renderer = SDL_CreateRenderer(app.window, null);
    if !app.renderer {
        print("SDL_CreateRenderer failed: %\n", to_string(SDL_GetError()));
        return false;
    }

    app.scale = SDL_GetWindowPixelDensity(app.window);
    SDL_SetRenderScale(app.renderer, app.scale, app.scale);
    SDL_SetRenderDrawBlendMode(app.renderer, SDL_BLENDMODE_BLEND);
    return true;
}

deinit_app :: (app: *App) {
    if app.renderer SDL_DestroyRenderer(app.renderer);
    if app.window   SDL_DestroyWindow(app.window);
    SDL_Quit();
}
