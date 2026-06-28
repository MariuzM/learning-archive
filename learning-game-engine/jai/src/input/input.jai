Input :: struct {
    quit:          bool;
    debug:         bool;
    show_fps: 	   bool = true;
    vsync:         bool;
    fps_cap:       int;
    win_w:         float;
    win_h:         float;
    mouse_x:       float;
    mouse_y:       float;
    mouse_clicked: bool;
    up:            bool;
    down:          bool;
    left:          bool;
    right:         bool;
}

process_events :: (using input: *Input) {
    mouse_clicked = false;

    event: SDL_Event;
    while SDL_PollEvent(*event) {
        if event.type == {
            case SDL_EVENT_QUIT;           quit = true;
            case SDL_EVENT_WINDOW_RESIZED; win_w = cast(float) event.window.data1; win_h = cast(float) event.window.data2;
            case SDL_EVENT_MOUSE_BUTTON_DOWN;
                mouse_clicked = true;
                mouse_x = event.button.x;
                mouse_y = event.button.y;
            case SDL_EVENT_KEY_DOWN;
                if event.key.scancode == {
                    case SDL_SCANCODE_ESCAPE; quit = true;
                    case SDL_SCANCODE_GRAVE;  debug = !debug;
                    case SDL_SCANCODE_1;      fps_cap = 15;
                    case SDL_SCANCODE_2;      fps_cap = 30;
                    case SDL_SCANCODE_3;      fps_cap = 45;
                    case SDL_SCANCODE_4;      fps_cap = 60;
                    case SDL_SCANCODE_5;      fps_cap = 0;
                    case SDL_SCANCODE_UP;     up = true;
                    case SDL_SCANCODE_DOWN;   down = true;
                    case SDL_SCANCODE_LEFT;   left = true;
                    case SDL_SCANCODE_RIGHT;  right = true;
                }
            case SDL_EVENT_KEY_UP;
                if event.key.scancode == {
                    case SDL_SCANCODE_UP;     up = false;
                    case SDL_SCANCODE_DOWN;   down = false;
                    case SDL_SCANCODE_LEFT;   left = false;
                    case SDL_SCANCODE_RIGHT;  right = false;
                }
        }
    }
}
