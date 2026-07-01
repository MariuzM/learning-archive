pub mod light;
pub mod sprite;

use sdl3::render::{FRect, WindowCanvas};

use crate::entity::Entity;

pub fn draw_entity(canvas: &mut WindowCanvas, e: &Entity) {
    canvas.set_draw_color(e.color.sdl());
    let _ = canvas.fill_rect(FRect::new(e.x, e.y, e.size, e.size));
}
