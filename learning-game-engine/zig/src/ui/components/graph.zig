const std = @import("std");
const c = @import("../../platform/sdl.zig").c;
const text = @import("text.zig");

const GRAPH_SAMPLES = 240;
const GRAPH_X: f32 = 8;
const GRAPH_Y: f32 = 96;
const GRAPH_W: f32 = 240;
const GRAPH_H: f32 = 80;
const GRAPH_MAX_MS: f32 = 50;
const MS_60: f32 = 16.67;
const MS_30: f32 = 33.33;

pub const FrameGraph = struct {
    samples: [GRAPH_SAMPLES]f32 = [_]f32{0} ** GRAPH_SAMPLES,
    head: usize = 0,
    count: usize = 0,

    pub fn push(self: *FrameGraph, dt: f32) void {
        self.samples[self.head] = dt * 1000.0;
        self.head = (self.head + 1) % GRAPH_SAMPLES;
        if (self.count < GRAPH_SAMPLES) self.count += 1;
    }
};

fn drawThreshold(renderer: *c.SDL_Renderer, ms: f32) void {
    const frac = ms / GRAPH_MAX_MS;
    if (frac > 1.0) return;
    const y = GRAPH_Y + GRAPH_H - frac * GRAPH_H;
    var line = c.SDL_FRect{ .x = GRAPH_X, .y = y, .w = GRAPH_W, .h = 1 };
    _ = c.SDL_SetRenderDrawColor(renderer, 90, 90, 110, 255);
    _ = c.SDL_RenderFillRect(renderer, &line);
}

pub fn drawFrameGraph(g: *FrameGraph, renderer: *c.SDL_Renderer, font: ?*c.TTF_Font, scale: f32) void {
    var bg = c.SDL_FRect{ .x = GRAPH_X, .y = GRAPH_Y, .w = GRAPH_W, .h = GRAPH_H };
    _ = c.SDL_SetRenderDrawColor(renderer, 20, 20, 24, 255);
    _ = c.SDL_RenderFillRect(renderer, &bg);

    drawThreshold(renderer, MS_60);
    drawThreshold(renderer, MS_30);

    if (g.count == 0) return;

    var min_ms: f32 = g.samples[0];
    var max_ms: f32 = 0;
    var sum: f32 = 0;

    const start = (g.head + GRAPH_SAMPLES - g.count) % GRAPH_SAMPLES;
    var i: usize = 0;
    while (i < g.count) : (i += 1) {
        const ms = g.samples[(start + i) % GRAPH_SAMPLES];
        if (ms < min_ms) min_ms = ms;
        if (ms > max_ms) max_ms = ms;
        sum += ms;

        var frac = ms / GRAPH_MAX_MS;
        if (frac > 1.0) frac = 1.0;
        const h = frac * GRAPH_H;

        if (ms <= MS_60) {
            _ = c.SDL_SetRenderDrawColor(renderer, 100, 200, 120, 255);
        } else if (ms <= MS_30) {
            _ = c.SDL_SetRenderDrawColor(renderer, 230, 200, 80, 255);
        } else {
            _ = c.SDL_SetRenderDrawColor(renderer, 230, 90, 90, 255);
        }
        var bar = c.SDL_FRect{ .x = GRAPH_X + @as(f32, @floatFromInt(i)), .y = GRAPH_Y + GRAPH_H - h, .w = 1, .h = h };
        _ = c.SDL_RenderFillRect(renderer, &bar);
    }

    const avg = sum / @as(f32, @floatFromInt(g.count));
    const cur = g.samples[(g.head + GRAPH_SAMPLES - 1) % GRAPH_SAMPLES];

    var buf: [96]u8 = undefined;
    const label = std.fmt.bufPrintZ(&buf, "cur {d:.1} ms   min {d:.1}   avg {d:.1}   max {d:.1}", .{ cur, min_ms, avg, max_ms }) catch return;
    text.drawText(renderer, font, label.ptr, GRAPH_X, GRAPH_Y + GRAPH_H + 4, c.SDL_Color{ .r = 210, .g = 210, .b = 210, .a = 255 }, scale);
}
