use sdl3::event::{Event, WindowEvent};
use sdl3::keyboard::Scancode;
use sdl3::EventPump;

pub struct Input {
    pub quit: bool,
    pub debug: bool,
    pub show_fps: bool,
    pub vsync: bool,
    pub fps_cap: i32,
    pub win_w: f32,
    pub win_h: f32,
    pub mouse_x: f32,
    pub mouse_y: f32,
    pub mouse_clicked: bool,
    pub up: bool,
    pub down: bool,
    pub left: bool,
    pub right: bool,
}

impl Default for Input {
    fn default() -> Self {
        Input {
            quit: false,
            debug: false,
            show_fps: true,
            vsync: false,
            fps_cap: 0,
            win_w: 0.0,
            win_h: 0.0,
            mouse_x: 0.0,
            mouse_y: 0.0,
            mouse_clicked: false,
            up: false,
            down: false,
            left: false,
            right: false,
        }
    }
}

pub fn process_events(input: &mut Input, pump: &mut EventPump) {
    input.mouse_clicked = false;

    for event in pump.poll_iter() {
        match event {
            Event::Quit { .. } => input.quit = true,
            Event::Window {
                win_event: WindowEvent::Resized(w, h),
                ..
            } => {
                input.win_w = w as f32;
                input.win_h = h as f32;
            }
            Event::MouseButtonDown { x, y, .. } => {
                input.mouse_clicked = true;
                input.mouse_x = x;
                input.mouse_y = y;
            }
            Event::KeyDown { scancode: Some(sc), .. } => match sc {
                Scancode::Escape => input.quit = true,
                Scancode::Grave => input.debug = !input.debug,
                Scancode::_1 => input.fps_cap = 15,
                Scancode::_2 => input.fps_cap = 30,
                Scancode::_3 => input.fps_cap = 45,
                Scancode::_4 => input.fps_cap = 60,
                Scancode::_5 => input.fps_cap = 0,
                Scancode::Up => input.up = true,
                Scancode::Down => input.down = true,
                Scancode::Left => input.left = true,
                Scancode::Right => input.right = true,
                _ => {}
            },
            Event::KeyUp { scancode: Some(sc), .. } => match sc {
                Scancode::Up => input.up = false,
                Scancode::Down => input.down = false,
                Scancode::Left => input.left = false,
                Scancode::Right => input.right = false,
                _ => {}
            },
            _ => {}
        }
    }
}
