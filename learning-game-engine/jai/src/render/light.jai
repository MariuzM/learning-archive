LIGHT_SEGMENTS :: 64;
SHADOW_DIST    :: 3000.0;

draw_light :: (renderer: *SDL_Renderer, cx: float, cy: float, radius: float, col: SDL_FColor) {
    center := col;
    edge   := SDL_FColor.{col.r, col.g, col.b, 0};

    verts:   [LIGHT_SEGMENTS + 1] SDL_Vertex;
    indices: [LIGHT_SEGMENTS * 3] s32;

    verts[0] = .{ .{cx, cy}, center, .{0, 0} };
    for i: 0..LIGHT_SEGMENTS - 1 {
        ang := (cast(float) i / LIGHT_SEGMENTS) * (2 * PI);
        px  := cx + cos(ang) * radius;
        py  := cy + sin(ang) * radius;
        verts[i + 1] = .{ .{px, py}, edge, .{0, 0} };

        indices[i * 3 + 0] = 0;
        indices[i * 3 + 1] = cast(s32)(i + 1);
        indices[i * 3 + 2] = cast(s32)(((i + 1) % LIGHT_SEGMENTS) + 1);
    }

    SDL_RenderGeometry(renderer, null, verts.data, LIGHT_SEGMENTS + 1, indices.data, LIGHT_SEGMENTS * 3);
}

cast_shadow :: (renderer: *SDL_Renderer, cx: float, cy: float, box: Entity, col: SDL_FColor) {
    corners: [4] SDL_FPoint;
    corners[0] = .{box.x,            box.y};
    corners[1] = .{box.x + box.size, box.y};
    corners[2] = .{box.x + box.size, box.y + box.size};
    corners[3] = .{box.x,            box.y + box.size};

    normals: [4] SDL_FPoint;
    normals[0] = .{ 0, -1};
    normals[1] = .{ 1,  0};
    normals[2] = .{ 0,  1};
    normals[3] = .{-1,  0};

    for i: 0..3 {
        a := corners[i];
        b := corners[(i + 1) % 4];

        mx := (a.x + b.x) * 0.5;
        my := (a.y + b.y) * 0.5;
        lx := cx - mx;
        ly := cy - my;

        if normals[i].x * lx + normals[i].y * ly < 0 {
            a_far := project_from(a, cx, cy);
            b_far := project_from(b, cx, cy);
            fill_quad(renderer, a, b, b_far, a_far, col);
        }
    }
}

project_from :: (p: SDL_FPoint, cx: float, cy: float) -> SDL_FPoint {
    dx  := p.x - cx;
    dy  := p.y - cy;
    len := sqrt(dx * dx + dy * dy);
    if len == 0  return p;
    return .{p.x + (dx / len) * SHADOW_DIST, p.y + (dy / len) * SHADOW_DIST};
}

fill_quad :: (renderer: *SDL_Renderer, p0: SDL_FPoint, p1: SDL_FPoint, p2: SDL_FPoint, p3: SDL_FPoint, col: SDL_FColor) {
    verts: [4] SDL_Vertex;
    verts[0] = .{p0, col, .{0, 0}};
    verts[1] = .{p1, col, .{0, 0}};
    verts[2] = .{p2, col, .{0, 0}};
    verts[3] = .{p3, col, .{0, 0}};

    indices := s32.[0, 1, 2, 0, 2, 3];
    SDL_RenderGeometry(renderer, null, verts.data, 4, indices.data, 6);
}
