const std = @import("std");
const builtin = @import("builtin");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    var num: usize = 0;
    if (builtin.target.os.tag == .macos) {
        num = 10;
    } else {
        num = 12;
    }
    const buffer = try allocator.alloc(u64, num);
    std.debug.print("{d}\n", .{buffer});
    const slices = buffer[0..];
    for (slices) |slice| {
        std.debug.print("{d}\n", .{slice});
    }

    // ==================================================================

    // const t2 = [10]u64{ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
    // const slice = t2[1..4];
    // std.debug.print("{d}\n", .{slice.len});

    // ==================================================================

    // const t1 = "Hello, World!";
    // std.debug.print("{s}\n", .{t1});

    // ==================================================================
}
