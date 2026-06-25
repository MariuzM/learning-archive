#import "Basic";
#import "File";
#import "String";

libz :: #library,system "libz";
uncompress :: (dest: *u8, dest_len: *u64, source: *u8, source_len: u64) -> s32 #foreign libz;

Range :: struct { s: s64; e: s64; }
Obj   :: struct { num: u32; r: Range; }

sub :: (d: string, start: s64, end: s64) -> string {
    return slice(d, start, end - start);
}

find :: (d: string, len: s64, needle: string, from: s64) -> s64 {
    return find_index_from_left(slice(d, 0, len), needle, from);
}

starts_with :: (d: string, len: s64, at: s64, pat: string) -> bool {
    if at < 0  return false;
    return begins_with(slice(d, at, len - at), pat);
}

is_ws :: (b: u8) -> bool {
    return b == 0x00 || b == 0x09 || b == 0x0A || b == 0x0C || b == 0x0D || b == 0x20;
}

is_delim :: (b: u8) -> bool {
    return b == #char "(" || b == #char ")" || b == #char "<" || b == #char ">"
        || b == #char "[" || b == #char "]" || b == #char "{" || b == #char "}"
        || b == #char "/" || b == #char "%";
}

skip_ws :: (d: string, len: s64, i: s64) -> s64 {
    j := i;
    while j < len && is_ws(d[j])  j += 1;
    return j;
}

parse_uint :: (d: string, len: s64, i: s64) -> (val: u32, next: s64, ok: bool) {
    j := i;
    v: u32 = 0;
    while j < len && d[j] >= #char "0" && d[j] <= #char "9" {
        v = v * 10 + cast(u32)(d[j] - #char "0");
        j += 1;
    }
    if j == i  return 0, i, false;
    return v, j, true;
}

token_bounded :: (d: string, len: s64, end: s64) -> bool {
    return end >= len || is_ws(d[end]) || is_delim(d[end]);
}

read_name :: (d: string, len: s64, i: s64) -> (name: string, next: s64, ok: bool) {
    if i >= len || d[i] != #char "/"  return "", i, false;
    j := i + 1;
    while j < len && !is_ws(d[j]) && !is_delim(d[j])  j += 1;
    return sub(d, i + 1, j), j, true;
}

name_has_value :: (d: string, key: string, val: string) -> bool {
    len := d.count;
    from := 0;
    while true {
        p := find(d, len, key, from);
        if p < 0  break;
        j := skip_ws(d, len, p + key.count);
        if starts_with(d, len, j, val) && token_bounded(d, len, j + val.count)  return true;
        from = p + key.count;
    }
    return false;
}

parse_ref :: (d: string, len: s64, i: s64) -> (num: u32, next: s64, ok: bool) {
    n, a, ok1 := parse_uint(d, len, i);
    if !ok1  return 0, i, false;
    b := skip_ws(d, len, a);
    g, c, ok2 := parse_uint(d, len, b);
    if !ok2  return 0, i, false;
    e := skip_ws(d, len, c);
    if e < len && d[e] == #char "R"  return n, e + 1, true;
    return 0, i, false;
}

parse_objects :: (d: string) -> [..] Obj {
    objs: [..] Obj;
    len := d.count;
    i := 0;
    while i < len {
        boundary := i == 0 || is_ws(d[i - 1]) || is_delim(d[i - 1]);
        if boundary && d[i] >= #char "0" && d[i] <= #char "9" {
            num, a, ok := parse_uint(d, len, i);
            b := skip_ws(d, len, a);
            g, c, ok2 := parse_uint(d, len, b);
            if ok && b > a && ok2 {
                e := skip_ws(d, len, c);
                if e > c && starts_with(d, len, e, "obj") && token_bounded(d, len, e + 3) {
                    start := e + 3;
                    end := find(d, len, "endobj", start);
                    if end >= 0 {
                        array_add(*objs, .{ num, .{ start, end } });
                        i = end + 6;
                        continue;
                    }
                }
            }
        }
        i += 1;
    }
    return objs;
}

obj_get :: (l: [] Obj, num: u32, out: *Range) -> bool {
    for l  if it.num == num {
        <<out = it.r;
        return true;
    }
    return false;
}

stream_bytes :: (d: string, r: Range) -> (out: string, ok: bool) {
    kw := find(d, r.e, "stream", r.s);
    if kw < 0  return "", false;
    p := kw + 6;
    if starts_with(d, r.e, p, "\r\n")  p += 2;
    else if p < r.e && (d[p] == #char "\n" || d[p] == #char "\r")  p += 1;
    end := find(d, r.e, "endstream", p);
    if end < 0  return "", false;
    return sub(d, p, end), true;
}

inflate_zlib :: (src: string) -> (out: string, ok: bool) {
    cap: u64 = max(cast(u64)(src.count * 4), 4096);
    while true {
        buf := cast(*u8) alloc(cast(s64) cap);
        dest_len := cap;
        ret := uncompress(buf, *dest_len, src.data, cast(u64) src.count);
        if ret == 0  return .{ cast(s64) dest_len, buf }, true;
        free(buf);
        if ret != -5  return "", false;  // Z_BUF_ERROR (-5): grow and retry
        cap *= 2;
    }
    return "", false;
}

count_name_do :: (content: string, name: string) -> int {
    pat := tprint("/%", name);
    len := content.count;
    count := 0;
    from := 0;
    while true {
        p := find(content, len, pat, from);
        if p < 0  break;
        after := p + pat.count;
        from = p + 1;
        if after < len && is_ws(content[after]) {
            j := skip_ws(content, len, after);
            if starts_with(content, len, j, "Do") && token_bounded(content, len, j + 2)  count += 1;
        }
    }
    return count;
}

image_names :: (d: string, res: Range, images: [] Obj) -> [..] string {
    names: [..] string;
    xo := find(d, res.e, "/XObject", res.s);
    if xo < 0  return names;
    op := find(d, res.e, "<<", xo);
    if op < 0  return names;
    open := op + 2;
    close := find(d, res.e, ">>", open);
    if close < 0  close = res.e;
    dict := sub(d, open, close);
    dlen := dict.count;
    i := 0;
    while i < dlen {
        if dict[i] == #char "/" {
            name, next, ok := read_name(dict, dlen, i);
            if ok {
                k := skip_ws(dict, dlen, next);
                num, k2, ok2 := parse_ref(dict, dlen, k);
                tmp: Range;
                if ok2 && obj_get(images, num, *tmp)  array_add(*names, name);
                i = next;
                continue;
            }
        }
        i += 1;
    }
    return names;
}

content_refs :: (d: string, body: Range) -> [..] u32 {
    refs: [..] u32;
    cp := find(d, body.e, "/Contents", body.s);
    if cp < 0  return refs;
    c := skip_ws(d, body.e, cp + 9);
    if c < body.e && d[c] == #char "[" {
        close := find(d, body.e, "]", c);
        if close < 0  close = body.e;
        i := c + 1;
        while i < close {
            if d[i] >= #char "0" && d[i] <= #char "9" && (is_ws(d[i - 1]) || d[i - 1] == #char "[") {
                num, next, ok := parse_ref(d, body.e, i);
                if ok {
                    array_add(*refs, num);
                    i = next;
                    continue;
                }
            }
            i += 1;
        }
    } else {
        num, next, ok := parse_uint(d, body.e, c);
        if ok  array_add(*refs, num);
    }
    return refs;
}

main :: () {
    args := get_command_line_arguments();
    path := ifx args.count > 1 then args[1] else "../assets/pdf.pdf";

    data, ok := read_entire_file(path);
    if !ok {
        print("failed to read %\n", path);
        exit(1);
    }

    objs := parse_objects(data);

    images: [..] Obj;
    for obj: objs {
        if name_has_value(sub(data, obj.r.s, obj.r.e), "/Subtype", "/Image")  array_add(*images, obj);
    }

    placements := 0;
    for obj: objs {
        body := obj.r;
        if !name_has_value(sub(data, body.s, body.e), "/Type", "/Page")  continue;

        res := body;
        p := find(data, body.e, "/Resources", body.s);
        if p >= 0 {
            q := skip_ws(data, body.e, p + 10);
            num, next, okr := parse_ref(data, body.e, q);
            r: Range;
            if !starts_with(data, body.e, q, "<<") && okr && obj_get(objs, num, *r)  res = r;
        }

        names := image_names(data, res, images);
        if names.count == 0  continue;

        content: [..] u8;
        for ref: content_refs(data, body) {
            cb: Range;
            if !obj_get(objs, ref, *cb)  continue;
            raw, sok := stream_bytes(data, cb);
            if !sok  continue;
            if find(data, cb.e, "/FlateDecode", cb.s) >= 0 {
                out, dok := inflate_zlib(raw);
                if !dok  continue;
                raw = out;
            }
            for b: raw  array_add(*content, b);
            array_add(*content, #char "\n");
        }

        content_str: string = .{ content.count, content.data };
        for n: names  placements += count_name_do(content_str, n);
    }

    print("%: % image placements (% unique images)\n", path, placements, images.count);
}
