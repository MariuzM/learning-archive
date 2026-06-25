#import "Basic";

// Window + custom Metal layer (transactional present) with a background and a
// single text input field (type, backspace, caret, arrow keys).

sdl   :: #system_library "SDL3";
ttf   :: #system_library "SDL3_ttf";
objc  :: #system_library "objc";
metal :: #system_library "Metal";

// --- SDL ----------------------------------------------------------------------

SDL_INIT_VIDEO :: 0x00000020;

SDL_WINDOW_METAL              :: 0x0000000020000000;
SDL_WINDOW_HIGH_PIXEL_DENSITY :: 0x0000000000002000;

SDL_EVENT_QUIT       :: 0x100;
SDL_EVENT_KEY_DOWN   :: 0x300;
SDL_EVENT_TEXT_INPUT :: 0x303;

SDLK_RETURN    :: 0x0d;
SDLK_ESCAPE    :: 0x1b;
SDLK_BACKSPACE :: 0x08;
SDLK_DELETE    :: 0x7f;
SDLK_LEFT      :: 0x40000050;
SDLK_RIGHT     :: 0x4000004f;
SDLK_HOME      :: 0x4000004a;
SDLK_END       :: 0x4000004d;

SDL_Color :: struct { r: u8; g: u8; b: u8; a: u8; }
SDL_FRect :: struct { x: float; y: float; w: float; h: float; }
SDL_Event :: struct { type: u32; _pad: [252] u8; }
SDL_KeyboardEvent :: struct {
    type: u32; reserved: u32; timestamp: u64;
    windowID: u32; which: u32; scancode: u32; key: u32;
}
SDL_TextInputEvent :: struct {
    type: u32; reserved: u32; timestamp: u64;
    windowID: u32; _align: u32; text: *u8;
}
SDL_Surface :: struct {
    flags: u32; format: u32; w: s32; h: s32; pitch: s32; _pad: u32;
    pixels: *void; refcount: s32; _pad2: u32; reserved: *void;
}

SDL_Init                  :: (flags: u32) -> bool #foreign sdl;
SDL_Quit                  :: () #foreign sdl;
SDL_CreateWindow          :: (title: *u8, w: s32, h: s32, flags: u64) -> *void #foreign sdl;
SDL_DestroyWindow         :: (window: *void) #foreign sdl;
SDL_GetWindowPixelDensity :: (window: *void) -> float #foreign sdl;
SDL_GetWindowSizeInPixels :: (window: *void, w: *s32, h: *s32) -> bool #foreign sdl;
SDL_Metal_CreateView      :: (window: *void) -> *void #foreign sdl;
SDL_Metal_GetLayer        :: (view: *void) -> *void #foreign sdl;
SDL_DestroySurface        :: (surface: *void) #foreign sdl;
SDL_PollEvent             :: (event: *SDL_Event) -> bool #foreign sdl;
SDL_StartTextInput        :: (window: *void) -> bool #foreign sdl;
SDL_Delay                 :: (ms: u32) #foreign sdl;

TTF_Init               :: () -> bool #foreign ttf;
TTF_Quit               :: () #foreign ttf;
TTF_OpenFont           :: (file: *u8, ptsize: float) -> *void #foreign ttf;
TTF_RenderText_Blended :: (font: *void, text: *u8, length: u64, fg: SDL_Color) -> *void #foreign ttf;

// --- Objective-C runtime + Metal ----------------------------------------------

id  :: *void;
SEL :: *void;

objc_getClass            :: (name: *u8) -> id #foreign objc;
sel_registerName         :: (name: *u8) -> SEL #foreign objc;
objc_autoreleasePoolPush :: () -> *void #foreign objc;
objc_autoreleasePoolPop  :: (pool: *void) #foreign objc;

MTLCreateSystemDefaultDevice :: () -> id #foreign metal;

ms0       :: (self: id, op: SEL) -> id #foreign objc "objc_msgSend";
ms_id     :: (self: id, op: SEL, a: id) -> id #foreign objc "objc_msgSend";
ms_u      :: (self: id, op: SEL, a: u64) -> id #foreign objc "objc_msgSend";
ms_cstr   :: (self: id, op: SEL, a: *u8) -> id #foreign objc "objc_msgSend";
ms_id_u   :: (self: id, op: SEL, a: id, b: u64) -> id #foreign objc "objc_msgSend";
ms_id_err :: (self: id, op: SEL, a: id, err: *id) -> id #foreign objc "objc_msgSend";
ms_src    :: (self: id, op: SEL, a: id, opts: id, err: *id) -> id #foreign objc "objc_msgSend";
ms_4u     :: (self: id, op: SEL, a: u64, b: u64, c: u64, d: u64) -> id #foreign objc "objc_msgSend";
ms_3u     :: (self: id, op: SEL, a: u64, b: u64, c: u64) -> id #foreign objc "objc_msgSend";
ms_vbytes :: (self: id, op: SEL, p: *void, len: u64, idx: u64) -> id #foreign objc "objc_msgSend";
ms_size   :: (self: id, op: SEL, sz: CGSize) -> id #foreign objc "objc_msgSend";
// Aggregates > 16 bytes are passed indirectly on arm64, so we hand objc_msgSend
// the address (which lands in the same register slot the callee reads).
ms_region :: (self: id, op: SEL, r: *MTLRegion, level: u64, bytes: *void, bpr: u64) -> id #foreign objc "objc_msgSend";
ms_clear  :: (self: id, op: SEL, c: *MTLClearColor) -> id #foreign objc "objc_msgSend";

CGSize        :: struct { width: float64; height: float64; }
MTLOrigin     :: struct { x: u64; y: u64; z: u64; }
MTLSize       :: struct { w: u64; h: u64; d: u64; }
MTLRegion     :: struct { origin: MTLOrigin; size: MTLSize; }
MTLClearColor :: struct { red: float64; green: float64; blue: float64; alpha: float64; }

MTLPixelFormatBGRA8Unorm :: 80;

Vertex :: struct { pos: [2] float; uv: [2] float; color: [4] float; }

DEBUG_SKIP_EVENTS :: true;

// Fixed-capacity scratch buffer. OpenJai's [..] arrays are opaque handles whose
// .count cannot be reset by assignment, so per-frame geometry uses plain storage.
VBuf :: struct { v: [256] Vertex; n: int; }

sel   :: (name: string) -> SEL { return sel_registerName(name.data); }
cls   :: (name: string) -> id  { return objc_getClass(name.data); }
nsstr :: (s: string) -> id { return ms_cstr(cls("NSString"), sel("stringWithUTF8String:"), s.data); }

SHADER :: #string METAL
#include <metal_stdlib>
using namespace metal;
struct V { float2 pos; float2 uv; float4 color; };
struct VOut { float4 pos [[position]]; float2 uv; float4 color; };
vertex VOut vmain(uint vid [[vertex_id]], constant V *verts [[buffer(0)]]) {
    VOut o; V v = verts[vid];
    o.pos = float4(v.pos, 0.0, 1.0);
    o.uv = v.uv; o.color = v.color; return o;
}
fragment float4 fmain(VOut in [[stage_in]], texture2d<float> tex [[texture(0)]]) {
    constexpr sampler s(mag_filter::linear, min_filter::linear);
    return in.color * tex.sample(s, in.uv);
}
METAL

WIDTH     :: 800;
HEIGHT    :: 400;
FONT_PATH :: "/System/Library/Fonts/Supplemental/Arial.ttf";

BG     :: SDL_Color.{24, 24, 30, 255};
PANEL  :: SDL_Color.{40, 40, 52, 255};
BORDER :: SDL_Color.{90, 90, 115, 255};
ACCENT :: SDL_Color.{60, 120, 210, 255};
WHITE  :: SDL_Color.{235, 235, 240, 255};
MUTED  :: SDL_Color.{130, 130, 150, 255};
PURE   :: SDL_Color.{255, 255, 255, 255};

INPUT_BOX :: SDL_FRect.{20, 80, 760, 44};

window:    *void;
font:      *void;
dpi_scale: float = 1.0;

mtl_device:   id;
mtl_queue:    id;
mtl_layer:    id;
mtl_pipeline: id;
mtl_white:    id;

pixel_w: s32;
pixel_h: s32;

// per-frame Metal handles
cur_encoder: id;
glyph_tex:   [32] id;
glyph_n:     int;

input:       [..] u8;
caret:       int;
frame:       int;

main :: () {
    if !SDL_Init(SDL_INIT_VIDEO) { print("SDL_Init failed\n"); return; }
    if !TTF_Init()               { print("TTF_Init failed\n");  return; }

    window = SDL_CreateWindow("Jai + SDL3 + Metal".data, WIDTH, HEIGHT, SDL_WINDOW_METAL | SDL_WINDOW_HIGH_PIXEL_DENSITY);
    if !window { print("CreateWindow failed\n"); return; }

    dpi_scale = SDL_GetWindowPixelDensity(window);
    if dpi_scale <= 0  dpi_scale = 1.0;

    if !metal_init()  return;

    font = TTF_OpenFont(FONT_PATH.data, 22.0 * dpi_scale);
    if !font { print("Could not open font %\n", FONT_PATH); return; }

    SDL_StartTextInput(window);

    auto := has_arg("--auto");
    if auto {
        for 0..("Hello, World!".count - 1)  array_add(*input, "Hello, World!"[it]);
        caret = input.count;
        print("after assign: caret=% input.count=%\n", caret, input.count);
        n := input.count;
        caret = n;
        print("via temp:     caret=% n=%\n", caret, n);
    }

    quit := false;
    while !quit {
        frame += 1;
        print("loop top: caret=%\n", caret);
        if auto && frame >= 8  quit = true;

        event: SDL_Event;
        print("  &event=% &caret=%\n", *event, *caret);
        while SDL_PollEvent(*event) {
            print("  event type=% caret=%\n", event.type, caret);
            if DEBUG_SKIP_EVENTS  continue;
            if event.type == {
                case SDL_EVENT_QUIT;
                    if !auto  quit = true;

                case SDL_EVENT_KEY_DOWN;
                    ke := cast(*SDL_KeyboardEvent) *event;
                    if ke.key == SDLK_ESCAPE  quit = true;
                    if ke.key == SDLK_BACKSPACE && caret > 0 {
                        array_ordered_remove_by_index(*input, caret - 1);
                        caret -= 1;
                    }
                    if ke.key == SDLK_DELETE && caret < input.count  array_ordered_remove_by_index(*input, caret);
                    if ke.key == SDLK_LEFT  && caret > 0            caret -= 1;
                    if ke.key == SDLK_RIGHT && caret < input.count  caret += 1;
                    if ke.key == SDLK_HOME  caret = 0;
                    if ke.key == SDLK_END   caret = input.count;

                case SDL_EVENT_TEXT_INPUT;
                    te := cast(*SDL_TextInputEvent) *event;
                    c := te.text;
                    while c.* != 0 {
                        array_insert_at(*input, c.*, caret);
                        caret += 1;
                        c += 1;
                    }
            }
        }

        print("before render: caret=% &caret=% &frame=% font=% window=% layer=% device=% queue=%\n",
              caret, *caret, *frame, font, window, mtl_layer, mtl_device, mtl_queue);
        render();
        SDL_Delay(16);
    }

    SDL_DestroyWindow(window);
    TTF_Quit();
    SDL_Quit();
}

metal_init :: () -> bool {
    mtl_device = MTLCreateSystemDefaultDevice();
    if !mtl_device { print("No Metal device\n"); return false; }
    mtl_queue = ms0(mtl_device, sel("newCommandQueue"));

    view := SDL_Metal_CreateView(window);
    mtl_layer = SDL_Metal_GetLayer(view);
    ms_id(mtl_layer, sel("setDevice:"), mtl_device);
    ms_u (mtl_layer, sel("setPixelFormat:"), MTLPixelFormatBGRA8Unorm);
    ms_u (mtl_layer, sel("setFramebufferOnly:"), 1);
    ms_u (mtl_layer, sel("setPresentsWithTransaction:"), 1);

    err: id = null;
    lib := ms_src(mtl_device, sel("newLibraryWithSource:options:error:"), nsstr(SHADER), null, *err);
    if !lib { print("Shader compile failed\n"); return false; }
    vfn := ms_id(lib, sel("newFunctionWithName:"), nsstr("vmain"));
    ffn := ms_id(lib, sel("newFunctionWithName:"), nsstr("fmain"));

    pdesc := ms0(ms0(cls("MTLRenderPipelineDescriptor"), sel("alloc")), sel("init"));
    ms_id(pdesc, sel("setVertexFunction:"), vfn);
    ms_id(pdesc, sel("setFragmentFunction:"), ffn);

    att := ms_u(ms0(pdesc, sel("colorAttachments")), sel("objectAtIndexedSubscript:"), 0);
    ms_u(att, sel("setPixelFormat:"), MTLPixelFormatBGRA8Unorm);
    ms_u(att, sel("setBlendingEnabled:"), 1);
    ms_u(att, sel("setSourceRGBBlendFactor:"), 4);        // SourceAlpha
    ms_u(att, sel("setSourceAlphaBlendFactor:"), 4);
    ms_u(att, sel("setDestinationRGBBlendFactor:"), 5);   // OneMinusSourceAlpha
    ms_u(att, sel("setDestinationAlphaBlendFactor:"), 5);

    perr: id = null;
    mtl_pipeline = ms_id_err(mtl_device, sel("newRenderPipelineStateWithDescriptor:error:"), pdesc, *perr);
    if !mtl_pipeline { print("Pipeline creation failed\n"); return false; }

    white: u32 = 0xFFFFFFFF;
    mtl_white = make_texture(*white, 1, 1, 4);
    return true;
}

render :: () {
    pool := objc_autoreleasePoolPush();
    defer objc_autoreleasePoolPop(pool);

    SDL_GetWindowSizeInPixels(window, *pixel_w, *pixel_h);
    ms_size(mtl_layer, sel("setDrawableSize:"), CGSize.{cast(float64) pixel_w, cast(float64) pixel_h});

    drawable := ms0(mtl_layer, sel("nextDrawable"));
    if !drawable  return;

    target := ms0(drawable, sel("texture"));
    rpd := ms0(cls("MTLRenderPassDescriptor"), sel("renderPassDescriptor"));
    att := ms_u(ms0(rpd, sel("colorAttachments")), sel("objectAtIndexedSubscript:"), 0);
    ms_id(att, sel("setTexture:"), target);
    ms_u (att, sel("setLoadAction:"), 2);   // Clear
    ms_u (att, sel("setStoreAction:"), 1);  // Store
    bg := clear_color(BG);
    ms_clear(att, sel("setClearColor:"), *bg);

    cmdbuf := ms0(mtl_queue, sel("commandBuffer"));
    cur_encoder = ms_id(cmdbuf, sel("renderCommandEncoderWithDescriptor:"), rpd);
    ms_id(cur_encoder, sel("setRenderPipelineState:"), mtl_pipeline);

    draw_ui();

    ms0(cur_encoder, sel("endEncoding"));
    ms0(cmdbuf, sel("commit"));
    ms0(cmdbuf, sel("waitUntilScheduled"));
    ms0(drawable, sel("present"));

    for 0..glyph_n - 1  ms0(glyph_tex[it], sel("release"));
    glyph_n = 0;
}

draw_ui :: () {
    print("ui caret=% input.count=% frame=%\n", caret, input.count, frame);
    rects: VBuf;
    rects.n = 0;
    add_box(*rects, INPUT_BOX, PANEL, ACCENT);
    draw_rects(*rects);

    draw_text("Input:", 20, 52, MUTED);

    if input.count > 0  draw_text_bytes(input.data, cast(u64) input.count, 32, 90, WHITE);
    else                draw_text("type here...", 32, 90, MUTED);

    if blink_on(frame) {
        caret_x := 32.0 + measure_width(input.data, cast(u64) caret);
        cb: VBuf;
        cb.n = 0;
        push_rect(*cb, caret_x + 1, 88, 2, 28, WHITE);
        draw_rects(*cb);
    }
}

// --- drawing helpers ----------------------------------------------------------

draw_rects :: (vb: *VBuf) {
    if vb.n == 0  return;
    ms_id_u(cur_encoder, sel("setFragmentTexture:atIndex:"), mtl_white, 0);
    ms_vbytes(cur_encoder, sel("setVertexBytes:length:atIndex:"), *vb.v[0], cast(u64)(vb.n * size_of(Vertex)), 0);
    ms_3u(cur_encoder, sel("drawPrimitives:vertexStart:vertexCount:"), 3, 0, cast(u64) vb.n);
}

draw_text :: (text: string, x: float, y: float, color: SDL_Color) -> float {
    return draw_text_bytes(text.data, cast(u64) text.count, x, y, color);
}

draw_text_bytes :: (text: *u8, length: u64, x: float, y: float, color: SDL_Color) -> float {
    print("draw_text_bytes len=% ptr=%\n", length, text);
    surface := TTF_RenderText_Blended(font, text, length, color);
    if !surface  return 0;
    s := cast(*SDL_Surface) surface;
    tw := s.w; th := s.h;
    tex := make_texture(s.pixels, s.w, s.h, s.pitch);
    SDL_DestroySurface(surface);
    if !tex  return 0;

    px0 := x * dpi_scale;
    py0 := y * dpi_scale;

    quad: VBuf;
    quad.n = 0;
    push_quad_px(*quad, px0, py0, px0 + cast(float) tw, py0 + cast(float) th, PURE);

    ms_id_u(cur_encoder, sel("setFragmentTexture:atIndex:"), tex, 0);
    ms_vbytes(cur_encoder, sel("setVertexBytes:length:atIndex:"), *quad.v[0], cast(u64)(quad.n * size_of(Vertex)), 0);
    ms_3u(cur_encoder, sel("drawPrimitives:vertexStart:vertexCount:"), 3, 0, cast(u64) quad.n);

    if glyph_n < glyph_tex.count { glyph_tex[glyph_n] = tex; glyph_n += 1; }
    return cast(float) tw / dpi_scale;
}

add_box :: (vb: *VBuf, box: SDL_FRect, fill: SDL_Color, border: SDL_Color) {
    push_rect(vb, box.x, box.y, box.w, box.h, border);
    push_rect(vb, box.x + 1, box.y + 1, box.w - 2, box.h - 2, fill);
}

push_rect :: (vb: *VBuf, x: float, y: float, w: float, h: float, c: SDL_Color) {
    push_quad_px(vb, x * dpi_scale, y * dpi_scale, (x + w) * dpi_scale, (y + h) * dpi_scale, c);
}

push_quad_px :: (vb: *VBuf, px0: float, py0: float, px1: float, py1: float, c: SDL_Color) {
    r := c.r / 255.0; g := c.g / 255.0; b := c.b / 255.0; a := c.a / 255.0;

    fw := cast(float) pixel_w; fh := cast(float) pixel_h;
    cx0 := px0 / fw * 2 - 1; cx1 := px1 / fw * 2 - 1;
    cy0 := 1 - py0 / fh * 2; cy1 := 1 - py1 / fh * 2;

    add_vert(vb, cx0, cy0, 0, 0, r, g, b, a);
    add_vert(vb, cx1, cy0, 1, 0, r, g, b, a);
    add_vert(vb, cx0, cy1, 0, 1, r, g, b, a);
    add_vert(vb, cx1, cy0, 1, 0, r, g, b, a);
    add_vert(vb, cx1, cy1, 1, 1, r, g, b, a);
    add_vert(vb, cx0, cy1, 0, 1, r, g, b, a);
}

add_vert :: (vb: *VBuf, x: float, y: float, u: float, t: float, r: float, g: float, b: float, a: float) {
    if vb.n >= vb.v.count  return;
    v := *vb.v[vb.n];
    v.pos[0] = x;   v.pos[1] = y;
    v.uv[0]  = u;   v.uv[1]  = t;
    v.color[0] = r; v.color[1] = g; v.color[2] = b; v.color[3] = a;
    vb.n += 1;
}

make_texture :: (pixels: *void, w: s32, h: s32, pitch: s32) -> id {
    desc := ms_4u(cls("MTLTextureDescriptor"), sel("texture2DDescriptorWithPixelFormat:width:height:mipmapped:"), MTLPixelFormatBGRA8Unorm, cast(u64) w, cast(u64) h, 0);
    tex  := ms_id(mtl_device, sel("newTextureWithDescriptor:"), desc);
    if !tex  return null;
    region := MTLRegion.{ .{0, 0, 0}, .{cast(u64) w, cast(u64) h, 1} };
    ms_region(tex, sel("replaceRegion:mipmapLevel:withBytes:bytesPerRow:"), *region, 0, pixels, cast(u64) pitch);
    return tex;
}

clear_color :: (c: SDL_Color) -> MTLClearColor {
    return .{c.r / 255.0, c.g / 255.0, c.b / 255.0, c.a / 255.0};
}

measure_width :: (text: *u8, length: u64) -> float {
    if length == 0  return 0;
    print("measure_width len=% ptr=%\n", length, text);
    surface := TTF_RenderText_Blended(font, text, length, WHITE);
    if !surface  return 0;
    s := cast(*SDL_Surface) surface;
    w := s.w;
    SDL_DestroySurface(surface);
    return cast(float) w / dpi_scale;
}

blink_on :: (f: int) -> bool {
    return (f / 30) % 2 == 0;
}

has_arg :: (name: string) -> bool {
    for get_command_line_arguments()  if it == name  return true;
    return false;
}
