load_sprite :: (renderer: *SDL_Renderer, path: string) -> *SDL_Texture {
    surf := SDL_LoadBMP(temp_c_string(path));
    if !surf  return null;
    texture := SDL_CreateTextureFromSurface(renderer, surf);
    SDL_DestroySurface(surf);
    if texture  SDL_SetTextureBlendMode(texture, SDL_BLENDMODE_BLEND);
    return texture;
}

draw_sprite :: (renderer: *SDL_Renderer, texture: *SDL_Texture, e: Entity) {
    dst := SDL_FRect.{e.x, e.y, e.size, e.size};
    SDL_RenderTexture(renderer, texture, null, *dst);
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
    SDL_RenderRect(renderer, *dst);
}
