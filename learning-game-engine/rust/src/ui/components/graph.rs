use sdl3::pixels::Color;
use sdl3::render::{FRect, WindowCanvas};
use sdl3::ttf::Font;

use super::text::draw_text;

const GRAPH_SAMPLES: usize = 240;
const GRAPH_X: f32 = 8.0;
const GRAPH_Y: f32 = 96.0;
const GRAPH_W: f32 = 240.0;
const GRAPH_H: f32 = 80.0;
const GRAPH_MAX_MS: f32 = 50.0;
const MS_60: f32 = 16.67;
const MS_30: f32 = 33.33;

pub struct FrameGraph {
    samples: [f32; GRAPH_SAMPLES],
    head: usize,
    count: usize,
}

impl Default for FrameGraph {
    fn default() -> Self {
        FrameGraph {
            samples: [0.0; GRAPH_SAMPLES],
            head: 0,
            count: 0,
        }
    }
}

pub fn frame_graph_push(g: &mut FrameGraph, dt: f32) {
    g.samples[g.head] = dt * 1000.0;
    g.head = (g.head + 1) % GRAPH_SAMPLES;
    if g.count < GRAPH_SAMPLES {
        g.count += 1;
    }
}

fn draw_threshold(canvas: &mut WindowCanvas, ms: f32) {
    let frac = ms / GRAPH_MAX_MS;
    if frac > 1.0 {
        return;
    }
    let y = GRAPH_Y + GRAPH_H - frac * GRAPH_H;
    canvas.set_draw_color(Color::RGBA(90, 90, 110, 255));
    let _ = canvas.fill_rect(FRect::new(GRAPH_X, y, GRAPH_W, 1.0));
}

pub fn draw_frame_graph(g: &FrameGraph, canvas: &mut WindowCanvas, font: &Font, scale: f32) {
    canvas.set_draw_color(Color::RGBA(20, 20, 24, 255));
    let _ = canvas.fill_rect(FRect::new(GRAPH_X, GRAPH_Y, GRAPH_W, GRAPH_H));

    draw_threshold(canvas, MS_60);
    draw_threshold(canvas, MS_30);

    if g.count == 0 {
        return;
    }

    let mut min_ms = g.samples[0];
    let mut max_ms = 0.0_f32;
    let mut sum = 0.0_f32;

    let start = (g.head + GRAPH_SAMPLES - g.count) % GRAPH_SAMPLES;
    for i in 0..g.count {
        let ms = g.samples[(start + i) % GRAPH_SAMPLES];
        if ms < min_ms {
            min_ms = ms;
        }
        if ms > max_ms {
            max_ms = ms;
        }
        sum += ms;

        let mut frac = ms / GRAPH_MAX_MS;
        if frac > 1.0 {
            frac = 1.0;
        }
        let h = frac * GRAPH_H;

        if ms <= MS_60 {
            canvas.set_draw_color(Color::RGBA(100, 200, 120, 255));
        } else if ms <= MS_30 {
            canvas.set_draw_color(Color::RGBA(230, 200, 80, 255));
        } else {
            canvas.set_draw_color(Color::RGBA(230, 90, 90, 255));
        }
        let _ = canvas.fill_rect(FRect::new(GRAPH_X + i as f32, GRAPH_Y + GRAPH_H - h, 1.0, h));
    }

    let avg = sum / g.count as f32;
    let cur = g.samples[(g.head + GRAPH_SAMPLES - 1) % GRAPH_SAMPLES];

    let text = format!("cur {cur:.1} ms   min {min_ms:.1}   avg {avg:.1}   max {max_ms:.1}");
    draw_text(canvas, font, &text, GRAPH_X, GRAPH_Y + GRAPH_H + 4.0, Color::RGBA(210, 210, 210, 255), scale);
}
