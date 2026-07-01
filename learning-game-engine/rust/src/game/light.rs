use sdl3::pixels::FColor;
use sdl3::render::{FPoint, Vertex, WindowCanvas};

use super::Entity;

const LIGHT_SEGMENTS: usize = 64;
const SHADOW_DIST: f32 = 3000.0;

pub fn draw_light(canvas: &mut WindowCanvas, cx: f32, cy: f32, radius: f32, col: FColor) {
    let center = col;
    let edge = FColor::RGBA(col.r, col.g, col.b, 0.0);

    let mut verts = Vec::with_capacity(LIGHT_SEGMENTS + 1);
    let mut indices: Vec<i32> = Vec::with_capacity(LIGHT_SEGMENTS * 3);

    verts.push(Vertex {
        position: FPoint::new(cx, cy),
        color: center,
        tex_coord: FPoint::new(0.0, 0.0),
    });
    for i in 0..LIGHT_SEGMENTS {
        let ang = (i as f32 / LIGHT_SEGMENTS as f32) * (2.0 * std::f32::consts::PI);
        let px = cx + ang.cos() * radius;
        let py = cy + ang.sin() * radius;
        verts.push(Vertex {
            position: FPoint::new(px, py),
            color: edge,
            tex_coord: FPoint::new(0.0, 0.0),
        });

        indices.push(0);
        indices.push(i as i32 + 1);
        indices.push(((i + 1) % LIGHT_SEGMENTS) as i32 + 1);
    }

    let _ = canvas.render_geometry(&verts, None, indices.as_slice());
}

fn project_from(p: FPoint, cx: f32, cy: f32) -> FPoint {
    let dx = p.x - cx;
    let dy = p.y - cy;
    let len = (dx * dx + dy * dy).sqrt();
    if len == 0.0 {
        return p;
    }
    FPoint::new(p.x + (dx / len) * SHADOW_DIST, p.y + (dy / len) * SHADOW_DIST)
}

fn fill_quad(canvas: &mut WindowCanvas, p0: FPoint, p1: FPoint, p2: FPoint, p3: FPoint, col: FColor) {
    let verts = [
        Vertex {
            position: p0,
            color: col,
            tex_coord: FPoint::new(0.0, 0.0),
        },
        Vertex {
            position: p1,
            color: col,
            tex_coord: FPoint::new(0.0, 0.0),
        },
        Vertex {
            position: p2,
            color: col,
            tex_coord: FPoint::new(0.0, 0.0),
        },
        Vertex {
            position: p3,
            color: col,
            tex_coord: FPoint::new(0.0, 0.0),
        },
    ];
    let indices: [i32; 6] = [0, 1, 2, 0, 2, 3];
    let _ = canvas.render_geometry(&verts, None, indices.as_slice());
}

pub fn cast_shadow(canvas: &mut WindowCanvas, cx: f32, cy: f32, box_e: &Entity, col: FColor) {
    let corners = [
        FPoint::new(box_e.x, box_e.y),
        FPoint::new(box_e.x + box_e.size, box_e.y),
        FPoint::new(box_e.x + box_e.size, box_e.y + box_e.size),
        FPoint::new(box_e.x, box_e.y + box_e.size),
    ];
    let normals = [
        FPoint::new(0.0, -1.0),
        FPoint::new(1.0, 0.0),
        FPoint::new(0.0, 1.0),
        FPoint::new(-1.0, 0.0),
    ];

    for i in 0..4 {
        let a = corners[i];
        let b = corners[(i + 1) % 4];

        let mx = (a.x + b.x) * 0.5;
        let my = (a.y + b.y) * 0.5;
        let lx = cx - mx;
        let ly = cy - my;

        if normals[i].x * lx + normals[i].y * ly < 0.0 {
            let a_far = project_from(a, cx, cy);
            let b_far = project_from(b, cx, cy);
            fill_quad(canvas, a, b, b_far, a_far, col);
        }
    }
}
