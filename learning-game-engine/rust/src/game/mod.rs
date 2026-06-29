use sdl3::pixels::Color as SdlColor;
use sdl3::render::{FRect, WindowCanvas};

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
}

pub fn simulate(e: &mut Entity, dt: f32, win_w: f32, win_h: f32) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    if e.x < 0.0 {
        e.x = 0.0;
        e.vx = e.vx.abs();
    }
    if e.y < 0.0 {
        e.y = 0.0;
        e.vy = e.vy.abs();
    }

    let max_x = win_w - e.size;
    let max_y = win_h - e.size;
    if e.x > max_x {
        e.x = max_x;
        e.vx = -e.vx.abs();
    }
    if e.y > max_y {
        e.y = max_y;
        e.vy = -e.vy.abs();
    }
}

pub fn move_hero(e: &mut Entity, dt: f32, win_w: f32, win_h: f32) {
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    e.x = e.x.clamp(0.0, win_w - e.size);
    e.y = e.y.clamp(0.0, win_h - e.size);
}

pub fn resolve_collision(a: &mut Entity, b: &mut Entity) {
    let ox = (a.x + a.size).min(b.x + b.size) - a.x.max(b.x);
    let oy = (a.y + a.size).min(b.y + b.size) - a.y.max(b.y);
    if ox <= 0.0 || oy <= 0.0 {
        return;
    }

    if ox < oy {
        let push = ox / 2.0;
        if a.x < b.x {
            a.x -= push;
            b.x += push;
        } else {
            a.x += push;
            b.x -= push;
        }
        a.vx = -a.vx;
        b.vx = -b.vx;
    } else {
        let push = oy / 2.0;
        if a.y < b.y {
            a.y -= push;
            b.y += push;
        } else {
            a.y += push;
            b.y -= push;
        }
        a.vy = -a.vy;
        b.vy = -b.vy;
    }
}

pub fn draw_entity(canvas: &mut WindowCanvas, e: &Entity) {
    canvas.set_draw_color(e.color.sdl());
    let _ = canvas.fill_rect(FRect::new(e.x, e.y, e.size, e.size));
}
