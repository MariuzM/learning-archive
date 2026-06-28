Fps_Counter :: struct {
    value:   float;
    accum:   float;
    frames:  int;
    font:    *TTF_Font;
    texture: *SDL_Texture;
    tw, th:  float;
    scale:   float;
    last_shown := -1;
}

init_fps :: (using f: *Fps_Counter, font_path: string, render_scale: float) -> bool {
    scale = render_scale;
    if !TTF_Init() return false;
    font = TTF_OpenFont(temp_c_string(font_path), 16.0 * scale);
    return font != null;
}

draw_fps :: (using f: *Fps_Counter, renderer: *SDL_Renderer, dt: float) {
    accum  += dt;
    frames += 1;
    if accum >= 0.5 {
        value  = cast(float) frames / accum;
        frames = 0;
        accum  = 0;
    }

    shown := cast(int)(value + 0.5);
    if texture == null || shown != last_shown {
        last_shown = shown;
        if texture  SDL_DestroyTexture(texture);

        text  := temp_c_string(tprint("FPS: %", shown));
        white := SDL_Color.{230, 230, 230, 255};
        surf  := TTF_RenderText_Blended(font, text, 0, white);
        texture = SDL_CreateTextureFromSurface(renderer, surf);

        w, h: s32;
        TTF_GetStringSize(font, text, 0, *w, *h);
        tw = cast(float) w;
        th = cast(float) h;
        SDL_DestroySurface(surf);
    }

    dst := SDL_FRect.{8, 8, tw / scale, th / scale};
    SDL_RenderTexture(renderer, texture, null, *dst);
}
