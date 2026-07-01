#pragma once

#include <SDL3/SDL.h>

#include <vector>

#include "../entity.h"
#include "../input/input.h"
#include "../physics.h"
#include "../render/light.h"
#include "../render/render.h"
#include "../render/sprite.h"

inline constexpr float BOX_SIZE = 80;
inline constexpr float HERO_SPEED = 320;
inline constexpr float LIGHT_RADIUS = 320;

struct World {
    std::vector<Entity> movers{
        {100, 100, 220, 170, BOX_SIZE, {77, 166, 242, 255}, true},
        {500, 300, -180, 200, BOX_SIZE, {242, 140, 64, 255}, true},
        {200, 400, 150, -90, BOX_SIZE, {200, 80, 200, 255}, false},
    };
    std::vector<Entity> walls{
        {240, 130, 0, 0, BOX_SIZE, {110, 110, 120, 255}, true},
        {620, 330, 0, 0, BOX_SIZE, {110, 110, 120, 255}, true},
    };
    Entity hero{440, 230, 0, 0, BOX_SIZE, {90, 200, 120, 120}, true};

    bool dragging = false;
    float drag_off_x = 0;
    float drag_off_y = 0;

    void update(const Input& input, float dt) {
        if (input.mouse_clicked && point_in_entity(hero, input.mouse_x, input.mouse_y)) {
            dragging = true;
            drag_off_x = input.mouse_x - hero.x;
            drag_off_y = input.mouse_y - hero.y;
        }
        if (!input.mouse_down) dragging = false;

        hero.vx = 0;
        hero.vy = 0;
        if (!dragging) {
            if (input.left) hero.vx -= HERO_SPEED;
            if (input.right) hero.vx += HERO_SPEED;
            if (input.up) hero.vy -= HERO_SPEED;
            if (input.down) hero.vy += HERO_SPEED;
        }

        if (!input.paused) {
            for (Entity& m : movers) simulate(m, dt, input.win_w, input.win_h);
        }
        if (dragging) {
            drag_hero(hero, input.mouse_x, input.mouse_y, drag_off_x, drag_off_y, input.win_w, input.win_h);
        } else {
            move_hero(hero, dt, input.win_w, input.win_h);
        }

        for (size_t i = 0; i < movers.size(); ++i) {
            for (size_t j = i + 1; j < movers.size(); ++j) {
                if (movers[i].solid && movers[j].solid) resolve_collision(movers[i], movers[j]);
            }
        }
        for (Entity& m : movers) {
            if (m.solid) resolve_collision(m, hero);
        }
        for (const Entity& w : walls) resolve_static(hero, w);

        for (Entity& m : movers) clamp_bounds(m, input.win_w, input.win_h);
        clamp_bounds(hero, input.win_w, input.win_h);
    }

    void render(SDL_Renderer* renderer, SDL_Texture* hero_sprite) const {
        for (const Entity& m : movers) draw_entity(renderer, m);
        for (const Entity& w : walls) draw_entity(renderer, w);

        const float hero_cx = hero.x + hero.size * 0.5f;
        const float hero_cy = hero.y + hero.size * 0.5f;
        const SDL_FColor shadow{26.0f / 255, 26.0f / 255, 31.0f / 255, 1};
        draw_light(renderer, hero_cx, hero_cy, LIGHT_RADIUS, {1.0f, 0.95f, 0.8f, 0.65f});
        for (const Entity& w : walls) cast_shadow(renderer, hero_cx, hero_cy, w, shadow);
        for (const Entity& w : walls) draw_entity(renderer, w);

        if (hero_sprite) {
            draw_sprite(renderer, hero_sprite, hero);
        } else {
            draw_entity(renderer, hero);
        }
    }
};
