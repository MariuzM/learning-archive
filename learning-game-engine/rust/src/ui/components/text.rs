use sdl3::pixels::Color;
use sdl3::render::{FRect, WindowCanvas};
use sdl3::ttf::Font;

pub fn draw_text(canvas: &mut WindowCanvas, font: &Font, text: &str, x: f32, y: f32, color: Color, scale: f32) {
    let surface = font.render(text).blended(color).unwrap();
    let creator = canvas.texture_creator();
    let texture = creator.create_texture_from_surface(&surface).unwrap();
    let (w, h) = surface.size();
    let dst = FRect::new(x, y, w as f32 / scale, h as f32 / scale);
    let _ = canvas.copy(&texture, None, dst);
}

pub fn draw_text_centered(canvas: &mut WindowCanvas, font: &Font, text: &str, rect: FRect, color: Color, scale: f32) {
    let (w, h) = font.size_of(text).unwrap();
    let tw = w as f32 / scale;
    let th = h as f32 / scale;
    draw_text(canvas, font, text, rect.x + (rect.w - tw) / 2.0, rect.y + (rect.h - th) / 2.0, color, scale);
}
