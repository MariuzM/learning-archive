mod entity;
mod input;
mod physics;
mod platform;
mod render;
mod scene;
mod ui;

use sdl3::pixels::Color as SdlColor;

use input::{process_events, Input};
use platform::App;
use render::sprite::load_sprite;
use scene::World;
use ui::components::graph::{draw_frame_graph, frame_graph_push, FrameGraph};
use ui::draw_debug;
use ui::fps::FpsCounter;

const WIDTH: u32 = 960;
const HEIGHT: u32 = 540;

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

    let mut world = World::new();

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

    let mut last = sdl3::timer::ticks();
    while !input.quit {
        let now = sdl3::timer::ticks();
        let dt = (now - last) as f32 / 1000.0;
        last = now;

        frame_graph_push(&mut graph, dt);
        process_events(&mut input, &mut event_pump);

        world.update(&input, dt);

        app.canvas.set_draw_color(SdlColor::RGBA(26, 26, 31, 255));
        app.canvas.clear();
        world.render(&mut app.canvas, hero_sprite.as_ref());

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
