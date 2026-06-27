Simp  :: #import "Simp";
Input :: #import "Input";
#import "Window_Creation";
#import "Basic";
#import "Math";

window_width  : s32 = 960;
window_height : s32 = 540;
my_window: Window_Type;

box_pos := Vector2.{100, 100};
box_vel := Vector2.{220, 170};
BOX_SIZE :: 80.0;

main :: () {
    #if OS == .WINDOWS {
        Windows :: #import "Windows";
        Windows.SetProcessDPIAware();
        Windows.timeBeginPeriod(1);
    }

    my_window = create_window(window_width, window_height, "Learning Engine - Jai (milestone 1)", wanted_msaa = 4);
    Simp.prepare_window(my_window, wanted_msaa = 4);
    window_width, window_height = Simp.get_render_dimensions(my_window);
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
                window_width  = it.width;
                window_height = it.height;
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
    box_pos += box_vel * dt;

    if box_pos.x < 0 { box_pos.x = 0; box_vel.x = abs(box_vel.x); }
    if box_pos.y < 0 { box_pos.y = 0; box_vel.y = abs(box_vel.y); }

    max_x := cast(float) window_width  - BOX_SIZE;
    max_y := cast(float) window_height - BOX_SIZE;
    if box_pos.x > max_x { box_pos.x = max_x; box_vel.x = -abs(box_vel.x); }
    if box_pos.y > max_y { box_pos.y = max_y; box_vel.y = -abs(box_vel.y); }
}

draw_one_frame :: () {
    Simp.clear_render_target(.10, .10, .12, 1);
    Simp.set_shader_for_color();

    x0 := box_pos.x;
    y0 := box_pos.y;
    x1 := box_pos.x + BOX_SIZE;
    y1 := box_pos.y + BOX_SIZE;

    color := Vector4.{0.30, 0.65, 0.95, 1};
    Simp.immediate_quad(x0, y0, x1, y1, color);

    Simp.swap_buffers(my_window);
}

#run {
    #if OS == .WINDOWS {
        WR :: #import "Windows_Resources";
        WR.disable_runtime_console();
    }
}
