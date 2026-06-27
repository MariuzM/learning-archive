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

        simulate(dt);
        draw_one_frame();

        sleep_milliseconds(10);
        reset_temporary_storage();
    }
}

simulate :: (dt: float) {
    player.pos += player.vel * dt;

    if player.pos.x < 0 { player.pos.x = 0; player.vel.x = abs(player.vel.x); }
    if player.pos.y < 0 { player.pos.y = 0; player.vel.y = abs(player.vel.y); }

    max_x := window_width  - player.size;
    max_y := window_height - player.size;
    if player.pos.x > max_x { player.pos.x = max_x; player.vel.x = -abs(player.vel.x); }
    if player.pos.y > max_y { player.pos.y = max_y; player.vel.y = -abs(player.vel.y); }
}

draw_one_frame :: () {
    Simp.clear_render_target(.10, .10, .12, 1);
    Simp.set_shader_for_color();

    x0 := player.pos.x * DPI_SCALE;
    y0 := player.pos.y * DPI_SCALE;
    x1 := (player.pos.x + player.size) * DPI_SCALE;
    y1 := (player.pos.y + player.size) * DPI_SCALE;

    Simp.immediate_quad(x0, y0, x1, y1, player.color);

    Simp.swap_buffers(my_window);
}

#run {
    #if OS == .WINDOWS {
        WR :: #import "Windows_Resources";
        WR.disable_runtime_console();
    }
}
