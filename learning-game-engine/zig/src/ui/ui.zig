const c = @import("../platform/sdl.zig").c;
const Input = @import("../input/input.zig").Input;
const btn = @import("components/button.zig");
const Button = btn.Button;

const FPS_CAPS = [_]u32{ 15, 30, 45, 60, 0 };
const FPS_LABELS = [_][*c]const u8{ "15", "30", "45", "60", "OFF" };

const BTN_X: f32 = 8;
const BTN_Y: f32 = 34;
const BTN_W: f32 = 44;
const BTN_H: f32 = 24;
const BTN_GAP: f32 = 6;
const TOGGLE_W: f32 = 60;
const VSYNC_W: f32 = 76;
const CAP_Y: f32 = BTN_Y + BTN_H + BTN_GAP;

const CapBinding = struct {
    input: *Input,
    value: u32,
};

var cap_bindings: [FPS_CAPS.len]CapBinding = undefined;

fn fpsToggleRect() c.SDL_FRect {
    return .{ .x = BTN_X, .y = BTN_Y, .w = TOGGLE_W, .h = BTN_H };
}

fn vsyncToggleRect() c.SDL_FRect {
    return .{ .x = BTN_X + TOGGLE_W + BTN_GAP, .y = BTN_Y, .w = VSYNC_W, .h = BTN_H };
}

fn capButtonRect(i: usize) c.SDL_FRect {
    return .{ .x = BTN_X + @as(f32, @floatFromInt(i)) * (BTN_W + BTN_GAP), .y = CAP_Y, .w = BTN_W, .h = BTN_H };
}

fn toggleFps(ctx: *anyopaque) void {
    const input: *Input = @ptrCast(@alignCast(ctx));
    input.show_fps = !input.show_fps;
}

fn setCap(ctx: *anyopaque) void {
    const b: *CapBinding = @ptrCast(@alignCast(ctx));
    b.input.fps_cap = b.value;
}

fn toggleVsync(ctx: *anyopaque) void {
    const input: *Input = @ptrCast(@alignCast(ctx));
    input.vsync = !input.vsync;
}

pub fn drawDebug(input: *Input, renderer: *c.SDL_Renderer, font: ?*c.TTF_Font, scale: f32) void {
    btn.button(.{
        .label = "FPS",
        .rect = fpsToggleRect(),
        .active = input.show_fps,
        .on_click = toggleFps,
        .ctx = input,
    }, input, renderer, font, scale);

    btn.button(.{
        .label = "VSYNC",
        .rect = vsyncToggleRect(),
        .active = input.vsync,
        .on_click = toggleVsync,
        .ctx = input,
    }, input, renderer, font, scale);

    for (FPS_CAPS, 0..) |cap, i| {
        cap_bindings[i] = .{ .input = input, .value = cap };
        btn.button(.{
            .label = FPS_LABELS[i],
            .rect = capButtonRect(i),
            .active = cap == input.fps_cap,
            .on_click = setCap,
            .ctx = &cap_bindings[i],
        }, input, renderer, font, scale);
    }
}
