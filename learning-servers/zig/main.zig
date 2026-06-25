const std = @import("std");

pub fn main() !void {
    const address = try std.net.Address.parseIp("127.0.0.1", 8080);
    var server = try address.listen(.{ .reuse_address = true });
    defer server.deinit();

    std.debug.print("Listening on http://127.0.0.1:8080\n", .{});

    const body = "Hello from Zig!";

    while (true) {
        const connection = server.accept() catch |e| {
            std.debug.print("connection failed: {}\n", .{e});
            continue;
        };
        defer connection.stream.close();

        var buffer: [1024]u8 = undefined;
        _ = connection.stream.read(&buffer) catch 0;

        var response_buf: [256]u8 = undefined;
        const response = try std.fmt.bufPrint(
            &response_buf,
            "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: {d}\r\nConnection: close\r\n\r\n{s}",
            .{ body.len, body },
        );

        _ = connection.stream.writeAll(response) catch {};
    }
}
