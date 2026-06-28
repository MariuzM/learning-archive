Button :: struct {
    label:    string;
    rect:     SDL_FRect;
    active:   bool;
    on_click: (data: *void);
    data:     *void;
}

button :: (b: Button, input: *Input, renderer: *SDL_Renderer, font: *TTF_Font, scale: float) {
    r := b.rect;
    if b.active  SDL_SetRenderDrawColor(renderer,  77, 166, 242, 255);
    else         SDL_SetRenderDrawColor(renderer,  50,  50,  58, 255);
    SDL_RenderFillRect(renderer, *r);

    text_color := ifx b.active then SDL_Color.{0, 0, 0, 255} else SDL_Color.{230, 230, 230, 255};
    draw_text_centered(renderer, font, b.label, b.rect, text_color, scale);

    if input.mouse_clicked && inside(b.rect, input.mouse_x, input.mouse_y) {
        if b.on_click  b.on_click(b.data);
    }
}

#scope_file

inside :: (r: SDL_FRect, x: float, y: float) -> bool {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
