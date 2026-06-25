Region :: enum {
    GLOBAL;
    HEAP;
    STACK;
    UNKNOWN;
}

Tracked :: struct {
    name:    string;
    address: u64;
    size:    s64;
    region:  Region;
    info:    *Type_Info;
}

Landmarks :: struct {
    stack:  u64;
    heap:   u64;
    global: u64;
}

Memory_View :: struct {
    entries: [..] Tracked;
    lm:      Landmarks;
}

landmark_global: s64 = 0;

capture_landmarks :: (view: *Memory_View) {
    local: s64 = 0;
    view.lm.stack  = cast(u64) *local;
    view.lm.global = cast(u64) *landmark_global;
    probe := alloc(8);
    view.lm.heap = cast(u64) probe;
    free(probe);
}

track :: (view: *Memory_View, name: string, ref: *$T) {
    e: Tracked;
    e.name    = name;
    e.address = cast(u64) ref;
    e.size    = size_of(T);
    e.info    = type_info(T);
    e.region  = classify(e.address, view.lm);
    array_add(*view.entries, e);
}

track_block :: (view: *Memory_View, name: string, address: *void, size: s64, info: *Type_Info = null) {
    e: Tracked;
    e.name    = name;
    e.address = cast(u64) address;
    e.size    = size;
    e.info    = info;
    e.region  = classify(e.address, view.lm);
    array_add(*view.entries, e);
}

classify :: (address: u64, lm: Landmarks) -> Region {
    ds := abs_diff(address, lm.stack);
    dh := abs_diff(address, lm.heap);
    dg := abs_diff(address, lm.global);
    if ds <= dh && ds <= dg return .STACK;
    if dh <= ds && dh <= dg return .HEAP;
    return .GLOBAL;
}

abs_diff :: (a: u64, b: u64) -> u64 {
    return ifx a > b then a - b else b - a;
}

fill :: (n: s64, ch: u8) -> string {
    count := max(n, 0);
    s: string;
    s.count = count;
    s.data  = cast(*u8) talloc(max(count, 1));
    memset(s.data, ch, count);
    return s;
}

pad_right :: (s: string, width: s64) -> string {
    if s.count >= width return s;
    return tprint("%0%0", s, fill(width - s.count, #char " "));
}

region_name :: (r: Region) -> string {
    if r == {
        case .GLOBAL;  return "GLOBAL";
        case .HEAP;    return "HEAP";
        case .STACK;   return "STACK";
        case;          return "?";
    }
}

region_fill :: (r: Region) -> u8 {
    if r == {
        case .GLOBAL;  return #char "=";
        case .HEAP;    return #char "#";
        case .STACK;   return #char "|";
        case;          return #char ".";
    }
}

hex :: (a: u64) -> string {
    return tprint("0x%", formatInt(a, base = 16, minimum_digits = 12));
}

type_name :: (info: *Type_Info) -> string {
    if info == null return "(raw bytes)";
    if info.type == {
        case .INTEGER;
            ti := cast(*Type_Info_Integer) info;
            return tprint("%0%0", ifx ti.signed then "s" else "u", info.runtime_size * 8);
        case .FLOAT;
            return ifx info.runtime_size == 8 then "float64" else "float32";
        case .BOOL;    return "bool";
        case .STRING;  return "string";
        case .VOID;    return "void";
        case .POINTER;
            ti := cast(*Type_Info_Pointer) info;
            return tprint("*%", type_name(ti.pointer_to));
        case .STRUCT;
            ti := cast(*Type_Info_Struct) info;
            return ifx ti.name then ti.name else "(anonymous struct)";
        case .ARRAY;
            ti := cast(*Type_Info_Array) info;
            if ti.array_type == {
                case .FIXED;      return tprint("[%]%", ti.array_count, type_name(ti.element_type));
                case .VIEW;       return tprint("[]%", type_name(ti.element_type));
                case .RESIZABLE;  return tprint("[..]%", type_name(ti.element_type));
            }
            return "array";
        case .ENUM;
            ti := cast(*Type_Info_Enum) info;
            return ifx ti.name then ti.name else "(anonymous enum)";
        case;
            return "?";
    }
}

render :: (view: *Memory_View) {
    print("\n");
    print("================================================================\n");
    print("                      MEMORY VIEWER\n");
    print("================================================================\n");

    print("\nADDRESS SPACE LANDMARKS (this run)\n");
    print("  high addresses\n");
    print("    STACK   %   <- local variables, function frames (grows down)\n", hex(view.lm.stack));
    print("    HEAP    %   <- alloc / New / NewArray (manual lifetime)\n",      hex(view.lm.heap));
    print("    GLOBAL  %   <- file-scope vars, string literals (data segment)\n", hex(view.lm.global));
    print("  low addresses\n");

    print("\nLEGEND   | = stack    # = heap    = = global\n");

    print("\nTRACKED VARIABLES\n");
    print("%  %  %  %  %\n",
        pad_right("ADDRESS", 16),
        pad_right("REGION", 7),
        pad_right("SIZE", 9),
        pad_right("TYPE", 22),
        "NAME");
    print("%\n", fill(78, #char "-"));

    max_size: s64 = 1;
    for view.entries  max_size = max(max_size, it.size);

    total_by_region: [4] s64;

    for view.entries {
        total_by_region[cast(s64) it.region] += it.size;

        bar_cells := max(1, (it.size * 32) / max_size);
        print("%  %  %  %  %\n",
            pad_right(hex(it.address), 16),
            pad_right(region_name(it.region), 7),
            pad_right(tprint("% B", it.size), 9),
            pad_right(type_name(it.info), 22),
            it.name);
        print("    %\n", fill(bar_cells, region_fill(it.region)));
    }

    print("\nBYTES PER REGION\n");
    print("  STACK   % B\n", total_by_region[cast(s64) Region.STACK]);
    print("  HEAP    % B\n", total_by_region[cast(s64) Region.HEAP]);
    print("  GLOBAL  % B\n", total_by_region[cast(s64) Region.GLOBAL]);
}

dump_struct_layout :: (info: *Type_Info_Struct) {
    print("\nSTRUCT LAYOUT: %   (% bytes total)\n", info.name, info.runtime_size);
    print("  %  %  %  %\n",
        pad_right("OFFSET", 8),
        pad_right("SIZE", 7),
        pad_right("TYPE", 22),
        "FIELD");
    print("  %\n", fill(60, #char "-"));

    expected: s64 = 0;
    for member: info.members {
        if member.flags & .CONSTANT continue;
        if member.offset_in_bytes < 0 continue;

        gap := member.offset_in_bytes - expected;
        if gap > 0 {
            print("  %  %  %  %\n",
                pad_right(tprint("+%", expected), 8),
                pad_right(tprint("% B", gap), 7),
                pad_right("(padding)", 22),
                "----");
        }

        msize := member.type.runtime_size;
        print("  %  %  %  %\n",
            pad_right(tprint("+%", member.offset_in_bytes), 8),
            pad_right(tprint("% B", msize), 7),
            pad_right(type_name(member.type), 22),
            member.name);
        expected = member.offset_in_bytes + msize;
    }

    tail := info.runtime_size - expected;
    if tail > 0 {
        print("  %  %  %  %\n",
            pad_right(tprint("+%", expected), 8),
            pad_right(tprint("% B", tail), 7),
            pad_right("(tail padding)", 22),
            "----");
    }
}
