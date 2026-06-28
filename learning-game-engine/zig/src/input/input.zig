const c = @import("../platform/sdl.zig").c;

pub const Input = struct {
    quit: bool = false,
    debug: bool = false,
    show_fps: bool = true,
    fps_cap: u32 = 0,
    win_w: f32 = 0,
    win_h: f32 = 0,
    mouse_x: f32 = 0,
    mouse_y: f32 = 0,
    mouse_clicked: bool = false,

    pub fn processEvents(self: *Input) void {
        self.mouse_clicked = false;

        var event: c.SDL_Event = undefined;
        while (c.SDL_PollEvent(&event)) {
            switch (event.type) {
                c.SDL_EVENT_QUIT => self.quit = true,
                c.SDL_EVENT_WINDOW_RESIZED => {
                    self.win_w = @floatFromInt(event.window.data1);
                    self.win_h = @floatFromInt(event.window.data2);
                },
                c.SDL_EVENT_MOUSE_BUTTON_DOWN => {
                    self.mouse_clicked = true;
                    self.mouse_x = event.button.x;
                    self.mouse_y = event.button.y;
                },
                c.SDL_EVENT_KEY_DOWN => {
                    if (event.key.scancode == c.SDL_SCANCODE_ESCAPE) self.quit = true;
                    if (event.key.scancode == c.SDL_SCANCODE_GRAVE) self.debug = !self.debug;
                    if (event.key.scancode == c.SDL_SCANCODE_1) self.fps_cap = 15;
                    if (event.key.scancode == c.SDL_SCANCODE_2) self.fps_cap = 30;
                    if (event.key.scancode == c.SDL_SCANCODE_3) self.fps_cap = 45;
                    if (event.key.scancode == c.SDL_SCANCODE_4) self.fps_cap = 60;
                    if (event.key.scancode == c.SDL_SCANCODE_5) self.fps_cap = 0;
                },
                else => {},
            }
        }
    }
};
