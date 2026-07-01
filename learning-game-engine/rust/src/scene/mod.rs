use sdl3::pixels::FColor;
use sdl3::render::{Texture, WindowCanvas};

use crate::entity::{Color, Entity};
use crate::input::Input;
use crate::physics::{clamp_bounds, drag_hero, move_hero, point_in_entity, resolve_collision, resolve_static, simulate};
use crate::render::light::{cast_shadow, draw_light};
use crate::render::sprite::draw_sprite;
use crate::render::draw_entity;

const BOX_SIZE: f32 = 80.0;
const HERO_SPEED: f32 = 320.0;
const LIGHT_RADIUS: f32 = 320.0;

pub struct World {
    pub movers: Vec<Entity>,
    pub walls: Vec<Entity>,
    pub hero: Entity,
    dragging: bool,
    drag_off_x: f32,
    drag_off_y: f32,
}

impl World {
    pub fn new() -> World {
        let movers = vec![
            Entity { x: 100.0, y: 100.0, vx: 220.0, vy: 170.0, size: BOX_SIZE, color: Color { r: 77, g: 166, b: 242, a: 255 }, solid: true },
            Entity { x: 500.0, y: 300.0, vx: -180.0, vy: 200.0, size: BOX_SIZE, color: Color { r: 242, g: 140, b: 64, a: 255 }, solid: true },
            Entity { x: 200.0, y: 400.0, vx: 150.0, vy: -90.0, size: BOX_SIZE, color: Color { r: 200, g: 80, b: 200, a: 255 }, solid: false },
        ];
        let walls = vec![
            Entity { x: 240.0, y: 130.0, vx: 0.0, vy: 0.0, size: BOX_SIZE, color: Color { r: 110, g: 110, b: 120, a: 255 }, solid: true },
            Entity { x: 620.0, y: 330.0, vx: 0.0, vy: 0.0, size: BOX_SIZE, color: Color { r: 110, g: 110, b: 120, a: 255 }, solid: true },
        ];
        let hero = Entity { x: 440.0, y: 230.0, vx: 0.0, vy: 0.0, size: BOX_SIZE, color: Color { r: 90, g: 200, b: 120, a: 120 }, solid: true };

        World {
            movers,
            walls,
            hero,
            dragging: false,
            drag_off_x: 0.0,
            drag_off_y: 0.0,
        }
    }

    pub fn update(&mut self, input: &Input, dt: f32) {
        if input.mouse_clicked && point_in_entity(&self.hero, input.mouse_x, input.mouse_y) {
            self.dragging = true;
            self.drag_off_x = input.mouse_x - self.hero.x;
            self.drag_off_y = input.mouse_y - self.hero.y;
        }
        if !input.mouse_down {
            self.dragging = false;
        }

        self.hero.vx = 0.0;
        self.hero.vy = 0.0;
        if !self.dragging {
            if input.left {
                self.hero.vx -= HERO_SPEED;
            }
            if input.right {
                self.hero.vx += HERO_SPEED;
            }
            if input.up {
                self.hero.vy -= HERO_SPEED;
            }
            if input.down {
                self.hero.vy += HERO_SPEED;
            }
        }

        if !input.paused {
            for m in &mut self.movers {
                simulate(m, dt, input.win_w, input.win_h);
            }
        }
        if self.dragging {
            drag_hero(&mut self.hero, input.mouse_x, input.mouse_y, self.drag_off_x, self.drag_off_y, input.win_w, input.win_h);
        } else {
            move_hero(&mut self.hero, dt, input.win_w, input.win_h);
        }

        let n = self.movers.len();
        for i in 0..n {
            for j in (i + 1)..n {
                if self.movers[i].solid && self.movers[j].solid {
                    let (left, right) = self.movers.split_at_mut(j);
                    resolve_collision(&mut left[i], &mut right[0]);
                }
            }
        }
        for m in &mut self.movers {
            if m.solid {
                resolve_collision(m, &mut self.hero);
            }
        }
        for w in &self.walls {
            resolve_static(&mut self.hero, w);
        }

        for m in &mut self.movers {
            clamp_bounds(m, input.win_w, input.win_h);
        }
        clamp_bounds(&mut self.hero, input.win_w, input.win_h);
    }

    pub fn render(&self, canvas: &mut WindowCanvas, hero_sprite: Option<&Texture>) {
        for m in &self.movers {
            draw_entity(canvas, m);
        }
        for w in &self.walls {
            draw_entity(canvas, w);
        }

        let hero_cx = self.hero.x + self.hero.size * 0.5;
        let hero_cy = self.hero.y + self.hero.size * 0.5;
        let shadow = FColor::RGBA(26.0 / 255.0, 26.0 / 255.0, 31.0 / 255.0, 1.0);
        draw_light(canvas, hero_cx, hero_cy, LIGHT_RADIUS, FColor::RGBA(1.0, 0.95, 0.8, 0.65));
        for w in &self.walls {
            cast_shadow(canvas, hero_cx, hero_cy, w, shadow);
        }
        for w in &self.walls {
            draw_entity(canvas, w);
        }

        match hero_sprite {
            Some(tex) => draw_sprite(canvas, tex, &self.hero),
            None => draw_entity(canvas, &self.hero),
        }
    }
}
