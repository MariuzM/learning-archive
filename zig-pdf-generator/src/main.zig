const std = @import("std");

const layout = @import("layout.zig");
const pdf = @import("pdf.zig");

const PageItem = struct {
    title: []const u8,
    content: []const u8,
};

const default_json =
    \\[
    \\  {
    \\    "title": "Marius",
    \\    "content": "Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a French masculine given name derived from the Roman family name Marius is a "
    \\  },
    \\  {
    \\    "title": "Tom",
    \\    "content": "Tom is a common masculine given name.222"
    \\  }
    \\]
;

pub fn main(init: std.process.Init) !void {
    const allocator = init.gpa;
    const io = init.io;

    var args_iter = std.process.Args.Iterator.init(init.minimal.args);
    _ = args_iter.next();
    const json_input = args_iter.next() orelse default_json;

    const parsed = std.json.parseFromSlice([]PageItem, allocator, json_input, .{}) catch |e| {
        std.debug.print("Failed to parse JSON: {}\n", .{e});
        return;
    };
    defer parsed.deinit();

    const items = parsed.value;

    var doc = pdf.Document.init(allocator);
    defer doc.deinit();

    doc.setTitle("PDF Document");
    doc.setAuthor("Zig PDF");

    for (items) |item| {
        const page = try doc.addPage(pdf.PageSize.A4);
        var l = layout.Layout.init(&doc, page, 50);
        try l.text(item.title, .{
            .font = .Courier,
            .font_size = 24,
            .text_align = .center,
            .margin_bottom = 20,
        });
        try l.text(item.content, .{
            .font = .Courier,
            .font_size = 12,
        });
    }

    const output_path = "output.pdf";
    try doc.save(io, output_path);
    std.debug.print("PDF saved to: {s}\n", .{output_path});

    var child = std.process.spawn(io, .{
        .argv = &.{ "open", output_path },
        .stdin = .ignore,
        .stdout = .ignore,
        .stderr = .ignore,
    }) catch |e| {
        std.debug.print("Could not open PDF viewer: {}\n", .{e});
        return;
    };
    _ = child.wait(io) catch |e| {
        std.debug.print("PDF viewer returned error: {}\n", .{e});
        return;
    };
    std.debug.print("Opening PDF...\n", .{});
}
