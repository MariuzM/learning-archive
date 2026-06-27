const std = @import("std");

const zap = @import("zap");

const Item = struct { sku: []const u8, qty: i64, price: f64 };
const Payload = struct {
    username: []const u8,
    email: []const u8,
    age: i64,
    password: []const u8,
    website: []const u8,
    country: []const u8,
    tags: [][]const u8,
    items: []Item,
};

fn validUsername(s: []const u8) bool {
    if (s.len < 3 or s.len > 30) return false;
    for (s) |ch| {
        const ok = (ch >= 'a' and ch <= 'z') or (ch >= '0' and ch <= '9') or ch == '_';
        if (!ok) return false;
    }
    return true;
}

fn validEmail(s: []const u8) bool {
    if (s.len == 0 or s.len > 100) return false;
    for (s) |ch| if (ch == ' ') return false;
    const at = std.mem.indexOfScalar(u8, s, '@') orelse return false;
    if (at == 0) return false;
    const domain = s[at + 1 ..];
    if (std.mem.indexOfScalar(u8, domain, '@') != null) return false;
    const dot = std.mem.indexOfScalar(u8, domain, '.') orelse return false;
    return dot != 0 and dot != domain.len - 1;
}

fn validPassword(s: []const u8) bool {
    if (s.len < 8 or s.len > 100) return false;
    var lo = false;
    var up = false;
    var di = false;
    for (s) |ch| {
        if (ch >= 'a' and ch <= 'z') {
            lo = true;
        } else if (ch >= 'A' and ch <= 'Z') {
            up = true;
        } else if (ch >= '0' and ch <= '9') {
            di = true;
        }
    }
    return lo and up and di;
}

fn validSku(s: []const u8) bool {
    if (s.len != 7 or s[3] != '-') return false;
    for (s[0..3]) |ch| if (ch < 'A' or ch > 'Z') return false;
    for (s[4..7]) |ch| if (ch < '0' or ch > '9') return false;
    return true;
}

fn validCountry(s: []const u8) bool {
    const set = [_][]const u8{ "US", "CA", "GB", "DE", "FR", "JP", "AU", "BR", "IN", "CN" };
    for (set) |x| if (std.mem.eql(u8, x, s)) return true;
    return false;
}

fn validatePayload(p: Payload) bool {
    if (!validUsername(p.username)) return false;
    if (!validEmail(p.email)) return false;
    if (p.age < 13 or p.age > 120) return false;
    if (!validPassword(p.password)) return false;
    if (p.website.len > 200) return false;
    if (!std.mem.startsWith(u8, p.website, "http://") and !std.mem.startsWith(u8, p.website, "https://")) return false;
    if (!validCountry(p.country)) return false;
    if (p.tags.len < 1 or p.tags.len > 10) return false;
    for (p.tags) |t| if (t.len < 1 or t.len > 20) return false;
    if (p.items.len < 1 or p.items.len > 50) return false;
    for (p.items) |it| {
        if (!validSku(it.sku)) return false;
        if (it.qty < 1 or it.qty > 999) return false;
        if (it.price < 0 or it.price > 100000) return false;
    }
    return true;
}

pub fn validate(r: zap.Request) !void {
    r.setHeader("content-type", "application/json") catch {};
    const req_body = r.body orelse {
        r.setStatus(.bad_request);
        try r.sendBody("{\"valid\":false}");
        return;
    };
    const parsed = std.json.parseFromSlice(Payload, std.heap.c_allocator, req_body, .{}) catch {
        r.setStatus(.bad_request);
        try r.sendBody("{\"valid\":false}");
        return;
    };
    defer parsed.deinit();
    if (validatePayload(parsed.value)) {
        try r.sendBody("{\"valid\":true}");
    } else {
        r.setStatus(.bad_request);
        try r.sendBody("{\"valid\":false}");
    }
}
