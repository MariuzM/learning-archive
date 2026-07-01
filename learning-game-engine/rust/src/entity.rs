use sdl3::pixels::Color as SdlColor;

#[derive(Clone, Copy)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl Color {
    pub fn sdl(self) -> SdlColor {
        SdlColor::RGBA(self.r, self.g, self.b, self.a)
    }
}

pub struct Entity {
    pub x: f32,
    pub y: f32,
    pub vx: f32,
    pub vy: f32,
    pub size: f32,
    pub color: Color,
    pub solid: bool,
}
