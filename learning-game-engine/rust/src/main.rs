mod game;
mod input;
mod platform;
mod ui;

use sdl3::pixels::Color as SdlColor;

use game::sprite::{draw_sprite, load_sprite};
use game::{clamp_bounds, drag_hero, draw_entity, move_hero, point_in_entity, resolve_collision, simulate, Color, Entity};
use input::{process_events, Input};
use platform::App;
use ui::components::graph::{draw_frame_graph, frame_graph_push, FrameGraph};
use ui::draw_debug;
use ui::fps::FpsCounter;

const WIDTH: u32 = 960;
const HEIGHT: u32 = 540;
const BOX_SIZE: f32 = 80.0;
const HERO_SPEED: f32 = 320.0;

fn main() {
    let sdl = sdl3::init().expect("SDL_Init failed");
    let ttf = sdl3::ttf::init().expect("TTF_Init failed");

    let mut app = match App::init(&sdl, "Learning Engine - Rust (milestone 1)", WIDTH, HEIGHT) {
        Ok(app) => app,
        Err(e) => {
            eprintln!("App init failed: {e}");
            std::process::exit(1);
        }
    };

    let mut event_pump = sdl.event_pump().expect("event_pump failed");

    let mut player = Entity {
        x: 100.0,
        y: 100.0,
        vx: 220.0,
        vy: 170.0,
        size: BOX_SIZE,
        color: Color {
            r: 77,
            g: 166,
            b: 242,
            a: 255,
        },
    };
    let mut player2 = Entity {
        x: 500.0,
        y: 300.0,
        vx: -180.0,
        vy: 200.0,
        size: BOX_SIZE,
        color: Color {
            r: 242,
            g: 140,
            b: 64,
            a: 255,
        },
    };
    let mut ghost = Entity {
        x: 200.0,
        y: 400.0,
        vx: 150.0,
        vy: -90.0,
        size: BOX_SIZE,
        color: Color {
            r: 200,
            g: 80,
            b: 200,
            a: 255,
        },
    };
    let mut hero = Entity {
        x: 440.0,
        y: 230.0,
        vx: 0.0,
        vy: 0.0,
        size: BOX_SIZE,
        color: Color {
            r: 90,
            g: 200,
            b: 120,
            a: 120,
        },
    };

    let mut fps = match FpsCounter::init(&ttf, "../assets/Karla-Regular.ttf", app.scale) {
        Ok(fps) => fps,
        Err(e) => {
            eprintln!("Font load failed: {e}");
            std::process::exit(1);
        }
    };

    let texture_creator = app.canvas.texture_creator();
    let hero_sprite = load_sprite(&texture_creator, "../assets/hero.bmp");

    let mut input = Input::default();
    input.win_w = WIDTH as f32;
    input.win_h = HEIGHT as f32;

    let mut graph = FrameGraph::default();
    let mut applied_vsync = false;

    let mut dragging = false;
    let mut drag_off_x = 0.0;
    let mut drag_off_y = 0.0;

    let mut last = sdl3::timer::ticks();
    while !input.quit {
        let now = sdl3::timer::ticks();
        let dt = (now - last) as f32 / 1000.0;
        last = now;

        frame_graph_push(&mut graph, dt);
        process_events(&mut input, &mut event_pump);

        if input.mouse_clicked && point_in_entity(&hero, input.mouse_x, input.mouse_y) {
            dragging = true;
            drag_off_x = input.mouse_x - hero.x;
            drag_off_y = input.mouse_y - hero.y;
        }
        if !input.mouse_down {
            dragging = false;
        }

        hero.vx = 0.0;
        hero.vy = 0.0;
        if !dragging {
            if input.left {
                hero.vx -= HERO_SPEED;
            }
            if input.right {
                hero.vx += HERO_SPEED;
            }
            if input.up {
                hero.vy -= HERO_SPEED;
            }
            if input.down {
                hero.vy += HERO_SPEED;
            }
        }

        if !input.paused {
            simulate(&mut player, dt, input.win_w, input.win_h);
            simulate(&mut player2, dt, input.win_w, input.win_h);
            simulate(&mut ghost, dt, input.win_w, input.win_h);
        }
        if dragging {
            drag_hero(&mut hero, input.mouse_x, input.mouse_y, drag_off_x, drag_off_y, input.win_w, input.win_h);
        } else {
            move_hero(&mut hero, dt, input.win_w, input.win_h);
        }

        resolve_collision(&mut player, &mut player2);
        resolve_collision(&mut player, &mut hero);
        resolve_collision(&mut player2, &mut hero);

        clamp_bounds(&mut player, input.win_w, input.win_h);
        clamp_bounds(&mut player2, input.win_w, input.win_h);
        clamp_bounds(&mut hero, input.win_w, input.win_h);

        app.canvas.set_draw_color(SdlColor::RGBA(26, 26, 31, 255));
        app.canvas.clear();
        draw_entity(&mut app.canvas, &player);
        draw_entity(&mut app.canvas, &player2);
        draw_entity(&mut app.canvas, &ghost);
        match &hero_sprite {
            Some(tex) => draw_sprite(&mut app.canvas, tex, &hero),
            None => draw_entity(&mut app.canvas, &hero),
        }

        if input.show_fps {
            fps.draw(&mut app.canvas, dt);
        }
        if input.debug {
            draw_debug(&mut input, &mut app.canvas, &fps.font, app.scale);
            draw_frame_graph(&graph, &mut app.canvas, &fps.font, app.scale);
        }
        if input.vsync != applied_vsync {
            app.set_vsync(input.vsync);
            applied_vsync = input.vsync;
        }

        app.canvas.present();

        if input.fps_cap > 0 {
            let target_ms = 1000 / input.fps_cap as u32;
            let elapsed = (sdl3::timer::ticks() - now) as u32;
            if elapsed < target_ms {
                sdl3::timer::delay(target_ms - elapsed);
            }
        }
    }
}
