draw_entity :: (renderer: *SDL_Renderer, e: Entity) {
    SDL_SetRenderDrawColor(renderer, e.color.r, e.color.g, e.color.b, e.color.a);
    rect := SDL_FRect.{e.x, e.y, e.size, e.size};
    SDL_RenderFillRect(renderer, *rect);
}
