use sdl3::pixels::Color;
use sdl3::render::WindowCanvas;
use sdl3::ttf::{Font, Sdl3TtfContext};

use super::components::text::draw_text;

pub struct FpsCounter {
    pub value: f32,
    accum: f32,
    frames: i32,
    pub font: Font<'static>,
    scale: f32,
}

impl FpsCounter {
    pub fn init(ttf: &Sdl3TtfContext, font_path: &str, scale: f32) -> Result<FpsCounter, String> {
        let font = ttf.load_font(font_path, 16.0 * scale).map_err(|e| e.to_string())?;
        Ok(FpsCounter {
            value: 0.0,
            accum: 0.0,
            frames: 0,
            font,
            scale,
        })
    }

    pub fn draw(&mut self, canvas: &mut WindowCanvas, dt: f32) {
        self.accum += dt;
        self.frames += 1;
        if self.accum >= 0.5 {
            self.value = self.frames as f32 / self.accum;
            self.frames = 0;
            self.accum = 0.0;
        }

        let shown = (self.value + 0.5) as i32;
        let text = format!("FPS: {shown}");
        draw_text(canvas, &self.font, &text, 8.0, 8.0, Color::RGBA(230, 230, 230, 255), self.scale);
    }
}
