Fps_Counter :: struct {
    value:  float;
    accum:  float;
    frames: int;
}

draw_fps :: (using f: *Fps_Counter, dt: float) {
    accum  += dt;
    frames += 1;
    if accum >= 0.5 {
        value  = cast(float) frames / accum;
        frames = 0;
        accum  = 0;
    }

    text := tprint("FPS: %", cast(int)(value + 0.5));
    Simp.draw_text(font, cast(s64)(10 * DPI_SCALE), font.character_height + cast(s64)(10 * DPI_SCALE), text);
}
