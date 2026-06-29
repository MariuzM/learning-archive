use sdl3::render::WindowCanvas;
use sdl3::Sdl;

pub struct App {
    pub canvas: WindowCanvas,
    pub scale: f32,
}

impl App {
    pub fn init(sdl: &Sdl, title: &str, w: u32, h: u32) -> Result<App, String> {
        let video = sdl.video().map_err(|e| e.to_string())?;

        let window = video
            .window(title, w, h)
            .resizable()
            .high_pixel_density()
            .build()
            .map_err(|e| e.to_string())?;

        let scale = window.pixel_density();

        let mut canvas = window.into_canvas();
        canvas.set_scale(scale, scale).map_err(|e| e.to_string())?;

        Ok(App { canvas, scale })
    }

    pub fn set_vsync(&mut self, on: bool) {
        unsafe {
            sdl3::sys::render::SDL_SetRenderVSync(self.canvas.raw(), if on { 1 } else { 0 });
        }
    }
}
