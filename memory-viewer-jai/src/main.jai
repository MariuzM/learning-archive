#import "Basic";

#load "viewer.jai";
#load "gui.jai";

global_counter: s64 = 42;
global_message  := "Hello from the data segment";
global_table:   [8] u32;

Vec2 :: struct {
    x: float;
    y: float;
}

Player :: struct {
    hp:        s32;
    level:     u8;
    pos:       Vec2;
    name:      string;
    inventory: [4] s32;
}

main :: () {
    use_gui := false;
    for get_command_line_arguments()  if it == "--gui" || it == "-gui"  use_gui = true;

    view: Memory_View;
    capture_landmarks(*view);

    i:     s64     = 7;
    ratio: float64 = 3.14159;
    flag:  bool    = true;
    hero:  Player;
    hero.hp = 100;
    hero.level = 5;
    hero.name = "Aria";

    raw_buffer := alloc(256);
    numbers    := NewArray(10, s64);
    boss       := New(Player);
    boss.hp = 500;

    track(*view, "global_counter",  *global_counter);
    track(*view, "global_message",  *global_message);
    track(*view, "global_table",    *global_table);

    track(*view, "i",      *i);
    track(*view, "ratio",  *ratio);
    track(*view, "flag",   *flag);
    track(*view, "hero",   *hero);

    track_block(*view, "raw_buffer", raw_buffer, 256, type_info(u8));
    track_block(*view, "numbers",    numbers.data, numbers.count * size_of(s64), type_info(s64));
    track(*view, "boss",   boss);

    if use_gui {
        run_gui(*view);
    } else {
        render(*view);
        dump_struct_layout(type_info(Player));
        dump_struct_layout(type_info(Vec2));
    }

    free(raw_buffer);
    free(numbers.data);
    free(boss);

    array_free(view.entries);
}
