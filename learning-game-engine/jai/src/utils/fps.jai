Fps_Counter :: struct {
    value:  float;
    accum:  float;
    frames: int;
}

draw_fps :: (using f: *Fps_Counter, renderer: *SDL_Renderer, dt: float) {
    accum  += dt;
    frames += 1;
    if accum >= 0.5 {
        value  = cast(float) frames / accum;
        frames = 0;
        accum  = 0;
    }

    SDL_SetRenderDrawColor(renderer, 230, 230, 230, 255);
    text := tprint("FPS: %", cast(int)(value + 0.5));
    SDL_RenderDebugText(renderer, 8, 8, temp_c_string(text));
}
