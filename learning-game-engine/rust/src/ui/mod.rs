pub mod components;
pub mod fps;

use sdl3::render::{FRect, WindowCanvas};
use sdl3::ttf::Font;

use crate::input::Input;
use components::button::button;

const FPS_CAPS: [i32; 5] = [15, 30, 45, 60, 0];
const FPS_LABELS: [&str; 5] = ["15", "30", "45", "60", "OFF"];

const BTN_X: f32 = 8.0;
const BTN_Y: f32 = 34.0;
const BTN_W: f32 = 44.0;
const BTN_H: f32 = 24.0;
const BTN_GAP: f32 = 6.0;
const TOGGLE_W: f32 = 60.0;
const VSYNC_W: f32 = 76.0;
const CAP_Y: f32 = BTN_Y + BTN_H + BTN_GAP;

fn fps_toggle_rect() -> FRect {
    FRect::new(BTN_X, BTN_Y, TOGGLE_W, BTN_H)
}

fn vsync_toggle_rect() -> FRect {
    FRect::new(BTN_X + TOGGLE_W + BTN_GAP, BTN_Y, VSYNC_W, BTN_H)
}

fn cap_button_rect(i: usize) -> FRect {
    FRect::new(BTN_X + i as f32 * (BTN_W + BTN_GAP), CAP_Y, BTN_W, BTN_H)
}

pub fn draw_debug(input: &mut Input, canvas: &mut WindowCanvas, font: &Font, scale: f32) {
    let (mc, mx, my) = (input.mouse_clicked, input.mouse_x, input.mouse_y);

    if button(canvas, font, scale, "FPS", fps_toggle_rect(), input.show_fps, mc, mx, my) {
        input.show_fps = !input.show_fps;
    }

    if button(canvas, font, scale, "VSYNC", vsync_toggle_rect(), input.vsync, mc, mx, my) {
        input.vsync = !input.vsync;
    }

    for i in 0..FPS_CAPS.len() {
        let cap = FPS_CAPS[i];
        if button(canvas, font, scale, FPS_LABELS[i], cap_button_rect(i), cap == input.fps_cap, mc, mx, my) {
            input.fps_cap = cap;
        }
    }
}
