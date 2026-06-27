Simp  :: #import "Simp";
Input :: #import "Input";
#import "Window_Creation";
#import "Basic";
#import "Math";

#if OS == .MACOS {
    #import "Objective_C";
    #import "Objective_C/AppKit";

    objc_send :: (recv: *void, sel: Selector) -> *void {
        f :: #type (*void, Selector) -> *void #c_call;
        return (cast(f) objc_msgSend)(recv, sel);
    }
    objc_send :: (recv: *void, sel: Selector, arg: *void) -> *void {
        f :: #type (*void, Selector, *void) -> *void #c_call;
        return (cast(f) objc_msgSend)(recv, sel, arg);
    }

    apply_system_appearance :: () {
        defaults := objc_send(objc_getClass("NSUserDefaults"), selector("standardUserDefaults"));
        style    := objc_send(defaults, selector("stringForKey:"), NSString.getTempString("AppleInterfaceStyle"));
        is_dark  := style != null;

        name       := NSString.getTempString(ifx is_dark then "NSAppearanceNameDarkAqua" else "NSAppearanceNameAqua");
        appearance := objc_send(objc_getClass("NSAppearance"), selector("appearanceNamed:"), name);
        objc_send(NSApp, selector("setAppearance:"), appearance);
    }
}

WIDTH    :: 960.0;
HEIGHT   :: 540.0;
BOX_SIZE :: 80.0;
DPI_SCALE :: 2.0;

my_window: Window_Type;
window_width  := WIDTH;
window_height := HEIGHT;

Entity :: struct {
    pos:   Vector2;
    vel:   Vector2;
    size:  float;
    color: Vector4;
}

player := Entity.{
    pos   = .{100, 100},
    vel   = .{220, 170},
    size  = BOX_SIZE,
    color = .{0.30, 0.65, 0.95, 1},
};

player2 := Entity.{
    pos   = .{500, 300},
    vel   = .{-180, 200},
    size  = BOX_SIZE,
    color = .{0.95, 0.55, 0.25, 1},
};

main :: () {
    #if OS == .WINDOWS {
        Windows :: #import "Windows";
        Windows.SetProcessDPIAware();
        Windows.timeBeginPeriod(1);
    }

    my_window = create_window(cast(s32)(WIDTH * DPI_SCALE), cast(s32)(HEIGHT * DPI_SCALE), "Learning Engine - Jai (milestone 1)", wanted_msaa = 4);

    #if OS == .MACOS {
        apply_system_appearance();
    }

    Simp.prepare_window(my_window, wanted_msaa = 4);
    Simp.set_render_target(my_window, .LEFT_HANDED);

    last_time := seconds_since_init();

    quit := false;
    while !quit {
        now := seconds_since_init();
        dt  := cast(float)(now - last_time);
        last_time = now;

        Input.update_window_events();

        for Input.get_window_resizes() {
            Simp.update_window(it.window);
            if it.window == my_window {
                window_width  = cast(float) it.width  / DPI_SCALE;
                window_height = cast(float) it.height / DPI_SCALE;
            }
        }

        for Input.events_this_frame {
            if it.type == .QUIT then quit = true;
            if it.type == .KEYBOARD && it.key_pressed && it.key_code == .ESCAPE then quit = true;
        }

        simulate(*player,  dt, window_width, window_height);
        simulate(*player2, dt, window_width, window_height);

        Simp.clear_render_target(.10, .10, .12, 1);
        Simp.set_shader_for_color();
        draw_entity(player);
        draw_entity(player2);
        Simp.swap_buffers(my_window);

        sleep_milliseconds(10);
        reset_temporary_storage();
    }
}

simulate :: (e: *Entity, dt: float, win_w: float, win_h: float) {
    e.pos += e.vel * dt;

    if e.pos.x < 0 { e.pos.x = 0; e.vel.x = abs(e.vel.x); }
    if e.pos.y < 0 { e.pos.y = 0; e.vel.y = abs(e.vel.y); }

    max_x := win_w - e.size;
    max_y := win_h - e.size;
    if e.pos.x > max_x { e.pos.x = max_x; e.vel.x = -abs(e.vel.x); }
    if e.pos.y > max_y { e.pos.y = max_y; e.vel.y = -abs(e.vel.y); }
}

draw_entity :: (e: Entity) {
    x0 := e.pos.x * DPI_SCALE;
    y0 := e.pos.y * DPI_SCALE;
    x1 := (e.pos.x + e.size) * DPI_SCALE;
    y1 := (e.pos.y + e.size) * DPI_SCALE;

    Simp.immediate_quad(x0, y0, x1, y1, e.color);
}

