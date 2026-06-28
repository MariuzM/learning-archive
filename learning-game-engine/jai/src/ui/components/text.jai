draw_text :: (renderer: *SDL_Renderer, font: *TTF_Font, text: string, x: float, y: float, color: SDL_Color, scale: float) {
    c    := temp_c_string(text);
    surf := TTF_RenderText_Blended(font, c, 0, color);
    tex  := SDL_CreateTextureFromSurface(renderer, surf);

    w, h: s32;
    TTF_GetStringSize(font, c, 0, *w, *h);

    dst := SDL_FRect.{ x, y, cast(float) w / scale, cast(float) h / scale };
    SDL_RenderTexture(renderer, tex, null, *dst);

    SDL_DestroySurface(surf);
    SDL_DestroyTexture(tex);
}

draw_text_centered :: (renderer: *SDL_Renderer, font: *TTF_Font, text: string, rect: SDL_FRect, color: SDL_Color, scale: float) {
    c := temp_c_string(text);

    w, h: s32;
    TTF_GetStringSize(font, c, 0, *w, *h);
    tw := cast(float) w / scale;
    th := cast(float) h / scale;

    draw_text(renderer, font, text, rect.x + (rect.w - tw) / 2, rect.y + (rect.h - th) / 2, color, scale);
}
