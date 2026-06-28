GRAPH_SAMPLES :: 240;
GRAPH_X       :: 8.0;
GRAPH_Y       :: 96.0;
GRAPH_W       :: 240.0;
GRAPH_H       :: 80.0;
GRAPH_MAX_MS  :: 50.0;

MS_60 :: 16.67;
MS_30 :: 33.33;

Frame_Graph :: struct {
    samples: [GRAPH_SAMPLES] float;
    head:    int;
    count:   int;
}

frame_graph_push :: (using g: *Frame_Graph, dt: float) {
    samples[head] = dt * 1000.0;
    head = (head + 1) % GRAPH_SAMPLES;
    if count < GRAPH_SAMPLES  count += 1;
}

draw_frame_graph :: (using g: *Frame_Graph, renderer: *SDL_Renderer, font: *TTF_Font, scale: float) {
    bg := SDL_FRect.{GRAPH_X, GRAPH_Y, GRAPH_W, GRAPH_H};
    SDL_SetRenderDrawColor(renderer, 20, 20, 24, 255);
    SDL_RenderFillRect(renderer, *bg);

    draw_threshold(renderer, MS_60);
    draw_threshold(renderer, MS_30);

    if count == 0  return;

    min_ms := samples[0];
    max_ms := 0.0;
    sum    := 0.0;

    start := (head - count + GRAPH_SAMPLES) % GRAPH_SAMPLES;
    for i: 0..count - 1 {
        ms := samples[(start + i) % GRAPH_SAMPLES];

        if ms < min_ms  min_ms = ms;
        if ms > max_ms  max_ms = ms;
        sum += ms;

        frac := ms / GRAPH_MAX_MS;
        if frac > 1.0  frac = 1.0;
        h := frac * GRAPH_H;

        if ms <= MS_60       SDL_SetRenderDrawColor(renderer, 100, 200, 120, 255);
        else if ms <= MS_30  SDL_SetRenderDrawColor(renderer, 230, 200,  80, 255);
        else                 SDL_SetRenderDrawColor(renderer, 230,  90,  90, 255);

        bar := SDL_FRect.{GRAPH_X + cast(float) i, GRAPH_Y + GRAPH_H - h, 1, h};
        SDL_RenderFillRect(renderer, *bar);
    }

    avg := sum / cast(float) count;
    cur := samples[(head - 1 + GRAPH_SAMPLES) % GRAPH_SAMPLES];

    label := tprint("cur % ms   min %   avg %   max %",
        formatFloat(cur,    trailing_width = 1),
        formatFloat(min_ms, trailing_width = 1),
        formatFloat(avg,    trailing_width = 1),
        formatFloat(max_ms, trailing_width = 1));
    draw_text(renderer, font, label, GRAPH_X, GRAPH_Y + GRAPH_H + 4, .{210, 210, 210, 255}, scale);
}

draw_threshold :: (renderer: *SDL_Renderer, ms: float) {
    frac := ms / GRAPH_MAX_MS;
    if frac > 1.0  return;
    y := GRAPH_Y + GRAPH_H - frac * GRAPH_H;
    line := SDL_FRect.{GRAPH_X, y, GRAPH_W, 1};
    SDL_SetRenderDrawColor(renderer, 90, 90, 110, 255);
    SDL_RenderFillRect(renderer, *line);
}
