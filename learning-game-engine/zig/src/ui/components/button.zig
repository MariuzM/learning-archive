const c = @import("../../platform/sdl.zig").c;
const Input = @import("../../input/input.zig").Input;
const text = @import("text.zig");

pub const Button = struct {
    label: [*c]const u8,
    rect: c.SDL_FRect,
    active: bool,
    on_click: *const fn (ctx: *anyopaque) void,
    ctx: *anyopaque,
};

fn inside(r: c.SDL_FRect, x: f32, y: f32) bool {
    return x >= r.x and x <= r.x + r.w and y >= r.y and y <= r.y + r.h;
}

pub fn button(b: Button, input: *const Input, renderer: *c.SDL_Renderer, font: ?*c.TTF_Font, scale: f32) void {
    var r = b.rect;
    if (b.active) {
        _ = c.SDL_SetRenderDrawColor(renderer, 77, 166, 242, 255);
    } else {
        _ = c.SDL_SetRenderDrawColor(renderer, 50, 50, 58, 255);
    }
    _ = c.SDL_RenderFillRect(renderer, &r);

    const text_color = if (b.active) c.SDL_Color{ .r = 0, .g = 0, .b = 0, .a = 255 } else c.SDL_Color{ .r = 230, .g = 230, .b = 230, .a = 255 };
    text.drawTextCentered(renderer, font, b.label, b.rect, text_color, scale);

    if (input.mouse_clicked and inside(b.rect, input.mouse_x, input.mouse_y)) {
        b.on_click(b.ctx);
    }
}
