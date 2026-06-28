SDL3 :: #library "../lib/libSDL3";
TTF  :: #library "../lib/libSDL3_ttf";

SDL_INIT_VIDEO              :: 0x0000_0020;
SDL_WINDOW_RESIZABLE        :: 0x0000_0020;
SDL_WINDOW_HIGH_PIXEL_DENSITY :: 0x0000_2000;

SDL_EVENT_QUIT           :: 0x100;
SDL_EVENT_KEY_DOWN       :: 0x300;
SDL_EVENT_WINDOW_RESIZED :: 0x206;
SDL_SCANCODE_ESCAPE      :: 41;
SDL_SCANCODE_GRAVE       :: 53;

SDL_Window   :: struct {}
SDL_Renderer :: struct {}
SDL_Texture  :: struct {}
SDL_Surface  :: struct {}
TTF_Font     :: struct {}

SDL_FRect :: struct {
    x, y, w, h: float;
}

SDL_Color :: struct {
    r, g, b, a: u8;
}

SDL_KeyboardEvent :: struct {
    type:      u32;
    reserved:  u32;
    timestamp: u64;
    windowID:  u32;
    which:     u32;
    scancode:  u32;
    key:       u32;
    mod:       u16;
    raw:       u16;
    down:      bool;
    repeat:    bool;
}

SDL_WindowEvent :: struct {
    type:      u32;
    reserved:  u32;
    timestamp: u64;
    windowID:  u32;
    data1:     s32;
    data2:     s32;
}

SDL_Event :: union {
    type:    u32;
    key:     SDL_KeyboardEvent;
    window:  SDL_WindowEvent;
    padding: [128] u8;
}

SDL_Init               :: (flags: u32) -> bool #foreign SDL3;
SDL_Quit               :: () #foreign SDL3;
SDL_GetError           :: () -> *u8 #foreign SDL3;
SDL_CreateWindow       :: (title: *u8, w: s32, h: s32, flags: u64) -> *SDL_Window #foreign SDL3;
SDL_DestroyWindow      :: (window: *SDL_Window) #foreign SDL3;
SDL_CreateRenderer     :: (window: *SDL_Window, name: *u8) -> *SDL_Renderer #foreign SDL3;
SDL_DestroyRenderer    :: (renderer: *SDL_Renderer) #foreign SDL3;
SDL_GetWindowPixelDensity :: (window: *SDL_Window) -> float #foreign SDL3;
SDL_SetRenderScale     :: (renderer: *SDL_Renderer, scaleX: float, scaleY: float) -> bool #foreign SDL3;
SDL_GetTicks           :: () -> u64 #foreign SDL3;
SDL_Delay              :: (ms: u32) #foreign SDL3;
SDL_PollEvent          :: (event: *SDL_Event) -> bool #foreign SDL3;
SDL_SetRenderDrawColor :: (renderer: *SDL_Renderer, r: u8, g: u8, b: u8, a: u8) -> bool #foreign SDL3;
SDL_RenderClear        :: (renderer: *SDL_Renderer) -> bool #foreign SDL3;
SDL_RenderFillRect     :: (renderer: *SDL_Renderer, rect: *SDL_FRect) -> bool #foreign SDL3;
SDL_RenderPresent      :: (renderer: *SDL_Renderer) -> bool #foreign SDL3;
SDL_RenderTexture      :: (renderer: *SDL_Renderer, texture: *SDL_Texture, srcrect: *SDL_FRect, dstrect: *SDL_FRect) -> bool #foreign SDL3;
SDL_CreateTextureFromSurface :: (renderer: *SDL_Renderer, surface: *SDL_Surface) -> *SDL_Texture #foreign SDL3;
SDL_DestroyTexture     :: (texture: *SDL_Texture) #foreign SDL3;
SDL_DestroySurface     :: (surface: *SDL_Surface) #foreign SDL3;

TTF_Init               :: () -> bool #foreign TTF;
TTF_Quit               :: () #foreign TTF;
TTF_OpenFont           :: (file: *u8, ptsize: float) -> *TTF_Font #foreign TTF;
TTF_CloseFont          :: (font: *TTF_Font) #foreign TTF;
TTF_RenderText_Blended :: (font: *TTF_Font, text: *u8, length: u64, fg: SDL_Color) -> *SDL_Surface #foreign TTF;
TTF_GetStringSize      :: (font: *TTF_Font, text: *u8, length: u64, w: *s32, h: *s32) -> bool #foreign TTF;
