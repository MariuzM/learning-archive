use sdl3::pixels::Color;
use sdl3::render::{BlendMode, FRect, Texture, TextureCreator, WindowCanvas};
use sdl3::surface::Surface;

use crate::entity::Entity;

pub fn load_sprite<'a, T>(creator: &'a TextureCreator<T>, path: &str) -> Option<Texture<'a>> {
    let surface = Surface::load_bmp(path).ok()?;
    let mut texture = creator.create_texture_from_surface(&surface).ok()?;
    texture.set_blend_mode(BlendMode::Blend);
    Some(texture)
}

pub fn draw_sprite(canvas: &mut WindowCanvas, texture: &Texture, e: &Entity) {
    let _ = canvas.copy(texture, None, FRect::new(e.x, e.y, e.size, e.size));
    canvas.set_draw_color(Color::RGBA(255, 255, 255, 255));
    let _ = canvas.draw_rect(FRect::new(e.x, e.y, e.size, e.size));
}
