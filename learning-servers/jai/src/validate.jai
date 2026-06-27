// Heavy, real-world incoming-request validation for both Jai servers. Jai has no
// JSON or validation library, so this is a hand-rolled recursive JSON parser
// (value tree) plus the same field constraints the other languages check.
#import "Basic";

Json_Kind :: enum u8 { NULL; BOOL; NUMBER; STRING; ARRAY; OBJECT; }
Json_Member :: struct { key: string; value: Json_Value; }
Json_Value :: struct {
    kind:    Json_Kind;
    is_int:  bool;        // for NUMBER: true if no '.'/'e'
    number:  float64;
    str:     string;      // view into the source body (inputs have no escapes)
    array:   [..] Json_Value;
    members: [..] Json_Member;
}

Json_Parser :: struct { s: string; i: int; ok: bool = true; }

json_skip_ws :: (p: *Json_Parser) {
    while p.i < p.s.count {
        c := p.s[p.i];
        if c == #char " " || c == #char "\t" || c == #char "\n" || c == #char "\r"  p.i += 1;
        else return;
    }
}

json_parse_string :: (p: *Json_Parser) -> string {
    p.i += 1; // opening quote
    start := p.i;
    while p.i < p.s.count && p.s[p.i] != #char "\"" {
        if p.s[p.i] == #char "\\"  p.i += 1; // skip escaped char
        p.i += 1;
    }
    result: string;
    if p.i >= p.s.count { p.ok = false; return result; }
    result.data = p.s.data + start;
    result.count = p.i - start;
    p.i += 1; // closing quote
    return result;
}

json_parse_number :: (p: *Json_Parser) -> Json_Value {
    v: Json_Value;
    v.kind = .NUMBER;
    v.is_int = true;
    start := p.i;
    if p.i < p.s.count && p.s[p.i] == #char "-"  p.i += 1;
    while p.i < p.s.count {
        c := p.s[p.i];
        if c >= #char "0" && c <= #char "9" {
            p.i += 1;
        } else if c == #char "." || c == #char "e" || c == #char "E" || c == #char "+" || c == #char "-" {
            v.is_int = false;
            p.i += 1;
        } else break;
    }
    span: string = ---;
    span.data = p.s.data + start;
    span.count = p.i - start;
    val, success := string_to_float64(span);
    if !success  p.ok = false;
    v.number = val;
    return v;
}

json_parse_array :: (p: *Json_Parser) -> Json_Value {
    v: Json_Value;
    v.kind = .ARRAY;
    p.i += 1; // [
    json_skip_ws(p);
    if p.i < p.s.count && p.s[p.i] == #char "]" { p.i += 1; return v; }
    while true {
        elem := json_parse_value(p);
        if !p.ok  return v;
        array_add(*v.array, elem);
        json_skip_ws(p);
        if p.i >= p.s.count { p.ok = false; return v; }
        c := p.s[p.i];
        if c == #char "," { p.i += 1; continue; }
        if c == #char "]" { p.i += 1; break; }
        p.ok = false;
        return v;
    }
    return v;
}

json_parse_object :: (p: *Json_Parser) -> Json_Value {
    v: Json_Value;
    v.kind = .OBJECT;
    p.i += 1; // {
    json_skip_ws(p);
    if p.i < p.s.count && p.s[p.i] == #char "}" { p.i += 1; return v; }
    while true {
        json_skip_ws(p);
        if p.i >= p.s.count || p.s[p.i] != #char "\"" { p.ok = false; return v; }
        key := json_parse_string(p);
        json_skip_ws(p);
        if p.i >= p.s.count || p.s[p.i] != #char ":" { p.ok = false; return v; }
        p.i += 1; // :
        val := json_parse_value(p);
        if !p.ok  return v;
        m: Json_Member;
        m.key = key;
        m.value = val;
        array_add(*v.members, m);
        json_skip_ws(p);
        if p.i >= p.s.count { p.ok = false; return v; }
        c := p.s[p.i];
        if c == #char "," { p.i += 1; continue; }
        if c == #char "}" { p.i += 1; break; }
        p.ok = false;
        return v;
    }
    return v;
}

json_parse_value :: (p: *Json_Parser) -> Json_Value {
    v: Json_Value;
    json_skip_ws(p);
    if p.i >= p.s.count { p.ok = false; return v; }
    c := p.s[p.i];
    if c == #char "{"  return json_parse_object(p);
    if c == #char "["  return json_parse_array(p);
    if c == #char "\"" { v.kind = .STRING; v.str = json_parse_string(p); return v; }
    if c == #char "t" { v.kind = .BOOL; if p.i + 4 <= p.s.count then p.i += 4; else p.ok = false; return v; }
    if c == #char "f" { v.kind = .BOOL; if p.i + 5 <= p.s.count then p.i += 5; else p.ok = false; return v; }
    if c == #char "n" { v.kind = .NULL; if p.i + 4 <= p.s.count then p.i += 4; else p.ok = false; return v; }
    return json_parse_number(p);
}

json_free :: (v: *Json_Value) {
    for * v.array     json_free(it);
    for * v.members   json_free(*it.value);
    array_free(v.array);
    array_free(v.members);
}

json_get :: (v: Json_Value, key: string) -> *Json_Value {
    for * v.members  if it.key == key  return *it.value;
    return null;
}

// --- field checks ---

vhas_prefix :: (s: string, prefix: string) -> bool {
    if s.count < prefix.count  return false;
    for 0..prefix.count-1  if s[it] != prefix[it]  return false;
    return true;
}

v_username :: (s: string) -> bool {
    if s.count < 3 || s.count > 30  return false;
    for 0..s.count-1 {
        c := s[it];
        if !((c >= #char "a" && c <= #char "z") || (c >= #char "0" && c <= #char "9") || c == #char "_")  return false;
    }
    return true;
}

v_email :: (s: string) -> bool {
    if s.count == 0 || s.count > 100  return false;
    at := -1;
    for 0..s.count-1 {
        if s[it] == #char " "  return false;
        if s[it] == #char "@" && at == -1  at = it;
    }
    if at <= 0  return false;
    dot := -1;
    j := at + 1;
    while j < s.count {
        if s[j] == #char "@"  return false;
        if s[j] == #char "." && dot == -1  dot = j - (at + 1);
        j += 1;
    }
    domain_len := s.count - (at + 1);
    return dot > 0 && dot != domain_len - 1;
}

v_password :: (s: string) -> bool {
    if s.count < 8 || s.count > 100  return false;
    lo, up, di := false, false, false;
    for 0..s.count-1 {
        c := s[it];
        if c >= #char "a" && c <= #char "z"        lo = true;
        else if c >= #char "A" && c <= #char "Z"   up = true;
        else if c >= #char "0" && c <= #char "9"   di = true;
    }
    return lo && up && di;
}

v_sku :: (s: string) -> bool {
    if s.count != 7 || s[3] != #char "-"  return false;
    for 0..2  if s[it] < #char "A" || s[it] > #char "Z"  return false;
    for 4..6  if s[it] < #char "0" || s[it] > #char "9"  return false;
    return true;
}

v_country :: (s: string) -> bool {
    countries :: string.["US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN"];
    for countries  if it == s  return true;
    return false;
}

// Parse the body and check every field. Returns true only if all pass.
validate_payload :: (body: string) -> bool {
    p: Json_Parser;
    p.s = body;
    root := json_parse_value(*p);
    defer json_free(*root);
    if !p.ok || root.kind != .OBJECT || root.members.count != 8  return false;

    keys :: string.["username", "email", "age", "password", "website", "country", "tags", "items"];
    for keys  if json_get(root, it) == null  return false;

    un := json_get(root, "username");
    if un.kind != .STRING || !v_username(un.str)  return false;
    em := json_get(root, "email");
    if em.kind != .STRING || !v_email(em.str)  return false;
    ag := json_get(root, "age");
    if ag.kind != .NUMBER || !ag.is_int || ag.number < 13 || ag.number > 120  return false;
    pw := json_get(root, "password");
    if pw.kind != .STRING || !v_password(pw.str)  return false;
    wb := json_get(root, "website");
    if wb.kind != .STRING || wb.str.count > 200  return false;
    if !(vhas_prefix(wb.str, "http://") || vhas_prefix(wb.str, "https://"))  return false;
    co := json_get(root, "country");
    if co.kind != .STRING || !v_country(co.str)  return false;

    tg := json_get(root, "tags");
    if tg.kind != .ARRAY || tg.array.count < 1 || tg.array.count > 10  return false;
    for tg.array  if it.kind != .STRING || it.str.count < 1 || it.str.count > 20  return false;

    im := json_get(root, "items");
    if im.kind != .ARRAY || im.array.count < 1 || im.array.count > 50  return false;
    for * im.array {
        if it.kind != .OBJECT || it.members.count != 3  return false;
        sku := json_get(it.*, "sku");
        qty := json_get(it.*, "qty");
        pr  := json_get(it.*, "price");
        if sku == null || qty == null || pr == null  return false;
        if sku.kind != .STRING || !v_sku(sku.str)  return false;
        if qty.kind != .NUMBER || !qty.is_int || qty.number < 1 || qty.number > 999  return false;
        if pr.kind != .NUMBER || pr.number < 0 || pr.number > 100000  return false;
    }
    return true;
}
