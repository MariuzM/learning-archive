draw_debug :: (input: *Input, renderer: *SDL_Renderer, font: *TTF_Font, scale: float) {
    toggle := Button.{
        label    = "FPS",
        rect     = .{ BTN_X, BTN_Y, TOGGLE_W, BTN_H },
        active   = input.show_fps,
        on_click = toggle_fps,
        data     = cast(*void) input,
    };
    button(toggle, input, renderer, font, scale);

    vsync := Button.{
        label    = "VSYNC",
        rect     = .{ BTN_X + TOGGLE_W + BTN_GAP, BTN_Y, VSYNC_W, BTN_H },
        active   = input.vsync,
        on_click = toggle_vsync,
        data     = cast(*void) input,
    };
    button(vsync, input, renderer, font, scale);

    pause := Button.{
        label    = "PAUSE",
        rect     = .{ BTN_X + TOGGLE_W + VSYNC_W + BTN_GAP * 2, BTN_Y, PAUSE_W, BTN_H },
        active   = input.paused,
        on_click = toggle_pause,
        data     = cast(*void) input,
    };
    button(pause, input, renderer, font, scale);

    for i: 0..FPS_CAPS.count - 1 {
        cap_bindings[i] = .{ input, FPS_CAPS[i] };
        cap := Button.{
            label    = FPS_LABELS[i],
            rect     = .{ BTN_X + cast(float) i * (BTN_W + BTN_GAP), CAP_Y, BTN_W, BTN_H },
            active   = FPS_CAPS[i] == input.fps_cap,
            on_click = set_cap,
            data     = cast(*void) *cap_bindings[i],
        };
        button(cap, input, renderer, font, scale);
    }
}

#scope_file

FPS_CAPS   :: int.[15, 30, 45, 60, 0];
FPS_LABELS :: string.["15", "30", "45", "60", "OFF"];

BTN_X    :: 8.0;
BTN_Y    :: 34.0;
BTN_W    :: 44.0;
BTN_H    :: 24.0;
BTN_GAP  :: 6.0;
TOGGLE_W :: 60.0;
VSYNC_W  :: 76.0;
PAUSE_W  :: 76.0;
CAP_Y    :: BTN_Y + BTN_H + BTN_GAP;

Cap_Binding :: struct {
    input: *Input;
    value: int;
}

cap_bindings: [FPS_CAPS.count] Cap_Binding;

toggle_fps :: (data: *void) {
    input := cast(*Input) data;
    input.show_fps = !input.show_fps;
}

set_cap :: (data: *void) {
    b := cast(*Cap_Binding) data;
    b.input.fps_cap = b.value;
}

toggle_vsync :: (data: *void) {
    input := cast(*Input) data;
    input.vsync = !input.vsync;
}

toggle_pause :: (data: *void) {
    input := cast(*Input) data;
    input.paused = !input.paused;
}
