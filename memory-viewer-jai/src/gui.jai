Simp  :: #import "Simp";
Input :: #import "Input";

#import "Window_Creation";
#import "Math";
#import "File";

FONT_BYTES :: #run -> [] u8 {
    data, ok := read_entire_file(tprint("%/assets/OpenSans-BoldItalic.ttf", #filepath));
    assert(ok, "Could not read font asset at compile time.");
    bytes: [] u8;
    bytes.data  = data.data;
    bytes.count = data.count;
    return bytes;
};

gui_window: Window_Type;
gui_font:   *Simp.Dynamic_Font;
gui_w: s32 = 1100;
gui_h: s32 = 720;

run_gui :: (view: *Memory_View) {
    #if OS == .WINDOWS {
        Win :: #import "Windows";
        Win.SetProcessDPIAware();
        Win.timeBeginPeriod(1);
    }

    gui_window = create_window(gui_w, gui_h, "Memory Viewer");
    gui_w, gui_h = Simp.get_render_dimensions(gui_window);
    Simp.set_render_target(gui_window);
    init_font();

    quit := false;
    while !quit {
        Input.update_window_events();

        for Input.get_window_resizes() {
            Simp.update_window(it.window);
            if it.window == gui_window {
                gui_w = it.width;
                gui_h = it.height;
                init_font();
            }
        }

        for Input.events_this_frame {
            if it.type == .QUIT  quit = true;
            if it.type == .KEYBOARD && it.key_pressed && it.key_code == .ESCAPE  quit = true;
        }

        draw_frame(view);
        sleep_milliseconds(10);
        reset_temporary_storage();
    }
}

init_font :: () {
    pixel_height := max(gui_h / 42, 13);
    gui_font = Simp.get_font_at_size(FONT_BYTES, pixel_height);
    assert(gui_font != null);
}

region_color :: (r: Region) -> Vector4 {
    if r == {
        case .STACK;   return .{0.32, 0.58, 0.96, 1};
        case .HEAP;    return .{0.96, 0.56, 0.22, 1};
        case .GLOBAL;  return .{0.38, 0.82, 0.48, 1};
        case;          return .{0.5, 0.5, 0.5, 1};
    }
}

draw_label :: (x: float, y: float, s: string, color: Vector4) {
    Simp.draw_text(gui_font, cast(s64) x, cast(s64) y, s, color);
}

draw_bar :: (x: float, y: float, w: float, h: float, color: Vector4) {
    Simp.set_shader_for_color();
    Simp.immediate_quad(x, y, x + w, y + h, color);
}

draw_frame :: (view: *Memory_View) {
    Simp.clear_render_target(0.10, 0.10, 0.12, 1);

    wf := cast(float) gui_w;
    hf := cast(float) gui_h;
    margin := 24.0;
    ch     := cast(float) gui_font.character_height;
    line_h := ch + 12.0;

    max_size: s64 = 1;
    total:    s64 = 0;
    for view.entries {
        max_size = max(max_size, it.size);
        total   += it.size;
    }

    y := hf - margin - ch;
    draw_label(margin, y, tprint("MEMORY VIEWER     % variables     % bytes live", view.entries.count, total), .{1, 1, 1, 1});
    y -= line_h;
    draw_label(margin, y, "bar width = size in bytes      blue = stack   orange = heap   green = global      ESC to close", .{0.65, 0.65, 0.68, 1});
    y -= line_h * 1.3;

    text_color := Vector4.{0.06, 0.06, 0.09, 1};
    regions := Region.[.STACK, .HEAP, .GLOBAL];

    for region: regions {
        region_total: s64 = 0;
        for view.entries  if it.region == region  region_total += it.size;

        draw_label(margin, y, tprint("% — % bytes", region_name(region), region_total), region_color(region));
        y -= line_h;

        for view.entries {
            if it.region != region  continue;

            bar_max := wf - margin * 2;
            bar_w   := max(6.0, (cast(float) it.size / cast(float) max_size) * bar_max);
            bar_h   := ch + 6.0;

            draw_bar(margin, y - 3.0, bar_w, bar_h, region_color(region));
            label := tprint("%   %   % B   %", it.name, type_name(it.info), it.size, hex(it.address));
            draw_label(margin + 10.0, y, label, text_color);

            y -= line_h;
        }

        y -= line_h * 0.5;
    }

    Simp.swap_buffers(gui_window);
}
