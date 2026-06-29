use sdl3::pixels::Color;
use sdl3::render::{FRect, WindowCanvas};
use sdl3::ttf::Font;

use super::text::draw_text_centered;

fn inside(r: FRect, x: f32, y: f32) -> bool {
    x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
}

pub fn button(
    canvas: &mut WindowCanvas,
    font: &Font,
    scale: f32,
    label: &str,
    rect: FRect,
    active: bool,
    mouse_clicked: bool,
    mx: f32,
    my: f32,
) -> bool {
    if active {
        canvas.set_draw_color(Color::RGBA(77, 166, 242, 255));
    } else {
        canvas.set_draw_color(Color::RGBA(50, 50, 58, 255));
    }
    let _ = canvas.fill_rect(rect);

    let text_color = if active {
        Color::RGBA(0, 0, 0, 255)
    } else {
        Color::RGBA(230, 230, 230, 255)
    };
    draw_text_centered(canvas, font, label, rect, text_color, scale);

    mouse_clicked && inside(rect, mx, my)
}
