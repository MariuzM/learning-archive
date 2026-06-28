const c = @import("../../platform/sdl.zig").c;

pub fn drawText(renderer: *c.SDL_Renderer, font: ?*c.TTF_Font, text: [*c]const u8, x: f32, y: f32, color: c.SDL_Color, scale: f32) void {
    const surf = c.TTF_RenderText_Blended(font, text, 0, color);
    const tw = @as(f32, @floatFromInt(surf.*.w)) / scale;
    const th = @as(f32, @floatFromInt(surf.*.h)) / scale;
    const tex = c.SDL_CreateTextureFromSurface(renderer, surf);
    var dst = c.SDL_FRect{ .x = x, .y = y, .w = tw, .h = th };
    _ = c.SDL_RenderTexture(renderer, tex, null, &dst);
    c.SDL_DestroySurface(surf);
    c.SDL_DestroyTexture(tex);
}

pub fn drawTextCentered(renderer: *c.SDL_Renderer, font: ?*c.TTF_Font, text: [*c]const u8, rect: c.SDL_FRect, color: c.SDL_Color, scale: f32) void {
    var w: c_int = 0;
    var h: c_int = 0;
    _ = c.TTF_GetStringSize(font, text, 0, &w, &h);
    const tw = @as(f32, @floatFromInt(w)) / scale;
    const th = @as(f32, @floatFromInt(h)) / scale;
    drawText(renderer, font, text, rect.x + (rect.w - tw) / 2, rect.y + (rect.h - th) / 2, color, scale);
}
