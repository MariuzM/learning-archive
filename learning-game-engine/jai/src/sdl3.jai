// Minimal hand-written SDL3 bindings — just the surface this engine uses.
// Links Homebrew's SDL3; its install name is an absolute path, so no rpath is needed.
SDL3 :: #library "../lib/libSDL3";

SDL_INIT_VIDEO       :: 0x0000_0020;
SDL_WINDOW_RESIZABLE :: 0x0000_0020;

SDL_EVENT_QUIT           :: 0x100;
SDL_EVENT_KEY_DOWN       :: 0x300;
SDL_EVENT_WINDOW_RESIZED :: 0x206;
SDL_SCANCODE_ESCAPE      :: 41;

SDL_Window   :: struct {}
SDL_Renderer :: struct {}

SDL_FRect :: struct {
    x, y, w, h: float;
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
SDL_GetTicks           :: () -> u64 #foreign SDL3;
SDL_Delay              :: (ms: u32) #foreign SDL3;
SDL_PollEvent          :: (event: *SDL_Event) -> bool #foreign SDL3;
SDL_SetRenderDrawColor :: (renderer: *SDL_Renderer, r: u8, g: u8, b: u8, a: u8) -> bool #foreign SDL3;
SDL_RenderClear        :: (renderer: *SDL_Renderer) -> bool #foreign SDL3;
SDL_RenderFillRect     :: (renderer: *SDL_Renderer, rect: *SDL_FRect) -> bool #foreign SDL3;
SDL_RenderPresent      :: (renderer: *SDL_Renderer) -> bool #foreign SDL3;
SDL_RenderDebugText    :: (renderer: *SDL_Renderer, x: float, y: float, str: *u8) -> bool #foreign SDL3;
