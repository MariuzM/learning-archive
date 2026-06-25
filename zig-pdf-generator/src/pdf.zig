const std = @import("std");
const Allocator = std.mem.Allocator;

fn appendFmt(list: *std.ArrayList(u8), allocator: Allocator, comptime fmt: []const u8, args: anytype) !void {
    const str = try std.fmt.allocPrint(allocator, fmt, args);
    defer allocator.free(str);
    try list.appendSlice(allocator, str);
}

fn appendBytes(list: *std.ArrayList(u8), allocator: Allocator, bytes: []const u8) !void {
    try list.appendSlice(allocator, bytes);
}

fn appendByte(list: *std.ArrayList(u8), allocator: Allocator, byte: u8) !void {
    try list.append(allocator, byte);
}

pub const PageSize = struct {
    width: f32,
    height: f32,

    pub const A4 = PageSize{ .width = 595.28, .height = 841.89 };
    pub const Letter = PageSize{ .width = 612, .height = 792 };
    pub const A3 = PageSize{ .width = 841.89, .height = 1190.55 };
    pub const A5 = PageSize{ .width = 419.53, .height = 595.28 };
};

pub const Color = struct {
    r: f32,
    g: f32,
    b: f32,

    pub const black = Color{ .r = 0, .g = 0, .b = 0 };
    pub const white = Color{ .r = 1, .g = 1, .b = 1 };
    pub const red = Color{ .r = 1, .g = 0, .b = 0 };
    pub const green = Color{ .r = 0, .g = 1, .b = 0 };
    pub const blue = Color{ .r = 0, .g = 0, .b = 1 };
    pub const gray = Color{ .r = 0.5, .g = 0.5, .b = 0.5 };

    pub fn rgb(r: f32, g: f32, b: f32) Color {
        return Color{ .r = r, .g = g, .b = b };
    }
};

pub const Font = enum {
    Helvetica,
    HelveticaBold,
    HelveticaOblique,
    TimesRoman,
    TimesBold,
    TimesItalic,
    Courier,
    CourierBold,

    pub fn name(self: Font) []const u8 {
        return switch (self) {
            .Helvetica => "Helvetica",
            .HelveticaBold => "Helvetica-Bold",
            .HelveticaOblique => "Helvetica-Oblique",
            .TimesRoman => "Times-Roman",
            .TimesBold => "Times-Bold",
            .TimesItalic => "Times-Italic",
            .Courier => "Courier",
            .CourierBold => "Courier-Bold",
        };
    }
};

const PdfObject = struct {
    data: []const u8,
    offset: usize = 0,
};

pub const Page = struct {
    allocator: Allocator,
    size: PageSize,
    content: std.ArrayList(u8),
    current_font: Font = .Helvetica,
    current_font_size: f32 = 12,

    pub fn init(allocator: Allocator, size: PageSize) Page {
        return Page{
            .allocator = allocator,
            .size = size,
            .content = .{},
        };
    }

    pub fn deinit(self: *Page) void {
        self.content.deinit(self.allocator);
    }

    pub fn setFont(self: *Page, font: Font, size: f32) !void {
        self.current_font = font;
        self.current_font_size = size;
        const font_ref = switch (font) {
            .Helvetica => "/F1",
            .HelveticaBold => "/F2",
            .HelveticaOblique => "/F3",
            .TimesRoman => "/F4",
            .TimesBold => "/F5",
            .TimesItalic => "/F6",
            .Courier => "/F7",
            .CourierBold => "/F8",
        };
        try appendFmt(&self.content, self.allocator, "{s} {d} Tf\n", .{ font_ref, size });
    }

    pub fn setFillColor(self: *Page, color: Color) !void {
        try appendFmt(&self.content, self.allocator, "{d:.3} {d:.3} {d:.3} rg\n", .{ color.r, color.g, color.b });
    }

    pub fn setStrokeColor(self: *Page, color: Color) !void {
        try appendFmt(&self.content, self.allocator, "{d:.3} {d:.3} {d:.3} RG\n", .{ color.r, color.g, color.b });
    }

    pub fn setLineWidth(self: *Page, width: f32) !void {
        try appendFmt(&self.content, self.allocator, "{d:.2} w\n", .{width});
    }

    pub fn getCharWidth(self: *Page) f32 {
        return switch (self.current_font) {
            .Courier, .CourierBold => self.current_font_size * 0.6,
            else => self.current_font_size * 0.5,
        };
    }

    pub fn getTextWidth(self: *Page, text: []const u8) f32 {
        return @as(f32, @floatFromInt(text.len)) * self.getCharWidth();
    }

    pub fn getLineHeight(self: *Page) f32 {
        return self.current_font_size * 1.2;
    }

    pub fn drawTextLine(self: *Page, text: []const u8, x: f32, y: f32) !void {
        try appendFmt(&self.content, self.allocator, "BT\n", .{});
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} Td\n", .{ x, y });
        try appendBytes(&self.content, self.allocator, "(");
        for (text) |c| {
            switch (c) {
                '(', ')', '\\' => {
                    try appendByte(&self.content, self.allocator, '\\');
                    try appendByte(&self.content, self.allocator, c);
                },
                else => try appendByte(&self.content, self.allocator, c),
            }
        }
        try appendBytes(&self.content, self.allocator, ") Tj\n");
        try appendBytes(&self.content, self.allocator, "ET\n");
    }

    pub fn drawText(self: *Page, text: []const u8, x: f32, y: f32) !void {
        const margin: f32 = 50;
        const max_width = self.size.width - x - margin;
        const text_width = self.getTextWidth(text);

        if (text_width <= max_width) {
            try self.drawTextLine(text, x, y);
            return;
        }

        _ = try self.drawTextWrapped(text, x, y, max_width);
    }

    pub fn drawTextWrapped(self: *Page, text: []const u8, x: f32, y: f32, max_width: f32) !f32 {
        const char_width = self.getCharWidth();
        const line_height = self.getLineHeight();
        const max_chars: usize = @intFromFloat(max_width / char_width);

        var current_y = y;
        var remaining = text;

        while (remaining.len > 0) {
            var line_end: usize = @min(remaining.len, max_chars);

            if (line_end < remaining.len) {
                var break_at = line_end;
                while (break_at > 0 and remaining[break_at - 1] != ' ') {
                    break_at -= 1;
                }
                if (break_at > 0) {
                    line_end = break_at;
                }
            }

            const line = remaining[0..line_end];
            try self.drawTextLine(std.mem.trim(u8, line, " "), x, current_y);

            remaining = remaining[line_end..];
            if (remaining.len > 0 and remaining[0] == ' ') {
                remaining = remaining[1..];
            }

            current_y -= line_height;
        }

        return current_y;
    }

    pub fn drawLine(self: *Page, x1: f32, y1: f32, x2: f32, y2: f32) !void {
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} m\n", .{ x1, y1 });
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} l\n", .{ x2, y2 });
        try appendBytes(&self.content, self.allocator, "S\n");
    }

    pub fn drawRect(self: *Page, x: f32, y: f32, width: f32, height: f32, filled: bool) !void {
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} {d:.2} {d:.2} re\n", .{ x, y, width, height });
        if (filled) {
            try appendBytes(&self.content, self.allocator, "f\n");
        } else {
            try appendBytes(&self.content, self.allocator, "S\n");
        }
    }

    pub fn drawFilledRect(self: *Page, x: f32, y: f32, width: f32, height: f32) !void {
        try self.drawRect(x, y, width, height, true);
    }

    pub fn drawStrokedRect(self: *Page, x: f32, y: f32, width: f32, height: f32) !void {
        try self.drawRect(x, y, width, height, false);
    }

    pub fn drawCircle(self: *Page, cx: f32, cy: f32, radius: f32, filled: bool) !void {
        const k: f32 = 0.5522847498;
        const kr = k * radius;

        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} m\n", .{ cx + radius, cy });
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} {d:.2} {d:.2} {d:.2} {d:.2} c\n", .{
            cx + radius, cy + kr,
            cx + kr,     cy + radius,
            cx,          cy + radius,
        });
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} {d:.2} {d:.2} {d:.2} {d:.2} c\n", .{
            cx - kr,     cy + radius,
            cx - radius, cy + kr,
            cx - radius, cy,
        });
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} {d:.2} {d:.2} {d:.2} {d:.2} c\n", .{
            cx - radius, cy - kr,
            cx - kr,     cy - radius,
            cx,          cy - radius,
        });
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} {d:.2} {d:.2} {d:.2} {d:.2} c\n", .{
            cx + kr,     cy - radius,
            cx + radius, cy - kr,
            cx + radius, cy,
        });

        if (filled) {
            try appendBytes(&self.content, self.allocator, "f\n");
        } else {
            try appendBytes(&self.content, self.allocator, "S\n");
        }
    }

    pub fn moveTo(self: *Page, x: f32, y: f32) !void {
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} m\n", .{ x, y });
    }

    pub fn lineTo(self: *Page, x: f32, y: f32) !void {
        try appendFmt(&self.content, self.allocator, "{d:.2} {d:.2} l\n", .{ x, y });
    }

    pub fn stroke(self: *Page) !void {
        try appendBytes(&self.content, self.allocator, "S\n");
    }

    pub fn fill(self: *Page) !void {
        try appendBytes(&self.content, self.allocator, "f\n");
    }

    pub fn fillAndStroke(self: *Page) !void {
        try appendBytes(&self.content, self.allocator, "B\n");
    }

    pub fn saveState(self: *Page) !void {
        try appendBytes(&self.content, self.allocator, "q\n");
    }

    pub fn restoreState(self: *Page) !void {
        try appendBytes(&self.content, self.allocator, "Q\n");
    }
};

pub const Document = struct {
    allocator: Allocator,
    pages: std.ArrayList(Page),
    title: ?[]const u8 = null,
    author: ?[]const u8 = null,

    pub fn init(allocator: Allocator) Document {
        return Document{
            .allocator = allocator,
            .pages = .{},
        };
    }

    pub fn deinit(self: *Document) void {
        for (self.pages.items) |*page| {
            page.deinit();
        }
        self.pages.deinit(self.allocator);
    }

    pub fn setTitle(self: *Document, title: []const u8) void {
        self.title = title;
    }

    pub fn setAuthor(self: *Document, author: []const u8) void {
        self.author = author;
    }

    pub fn addPage(self: *Document, size: PageSize) !*Page {
        const page = Page.init(self.allocator, size);
        try self.pages.append(self.allocator, page);
        return &self.pages.items[self.pages.items.len - 1];
    }

    pub fn render(self: *Document, allocator: Allocator) ![]u8 {
        var output: std.ArrayList(u8) = .{};
        defer output.deinit(allocator);

        var offsets: std.ArrayList(usize) = .{};
        defer offsets.deinit(allocator);

        try appendBytes(&output, allocator, "%PDF-1.4\n");
        try appendBytes(&output, allocator, "%\xE2\xE3\xCF\xD3\n");

        var obj_num: usize = 1;

        try offsets.append(allocator, output.items.len);
        try appendFmt(&output, allocator, "{d} 0 obj\n", .{obj_num});
        try appendBytes(&output, allocator, "<< /Type /Catalog /Pages 2 0 R >>\n");
        try appendBytes(&output, allocator, "endobj\n");
        obj_num += 1;

        const pages_obj = obj_num;
        try offsets.append(allocator, output.items.len);
        try appendFmt(&output, allocator, "{d} 0 obj\n", .{obj_num});
        try appendBytes(&output, allocator, "<< /Type /Pages /Kids [");
        const first_page_obj = obj_num + 2;
        for (0..self.pages.items.len) |i| {
            if (i > 0) try appendBytes(&output, allocator, " ");
            try appendFmt(&output, allocator, "{d} 0 R", .{first_page_obj + i * 2});
        }
        try appendFmt(&output, allocator, "] /Count {d} >>\n", .{self.pages.items.len});
        try appendBytes(&output, allocator, "endobj\n");
        obj_num += 1;

        try offsets.append(allocator, output.items.len);
        try appendFmt(&output, allocator, "{d} 0 obj\n", .{obj_num});
        try appendBytes(&output, allocator, "<< /Font <<\n");
        try appendBytes(&output, allocator, "  /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n");
        try appendBytes(&output, allocator, "  /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\n");
        try appendBytes(&output, allocator, "  /F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\n");
        try appendBytes(&output, allocator, "  /F4 << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>\n");
        try appendBytes(&output, allocator, "  /F5 << /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>\n");
        try appendBytes(&output, allocator, "  /F6 << /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>\n");
        try appendBytes(&output, allocator, "  /F7 << /Type /Font /Subtype /Type1 /BaseFont /Courier >>\n");
        try appendBytes(&output, allocator, "  /F8 << /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\n");
        try appendBytes(&output, allocator, ">> >>\n");
        try appendBytes(&output, allocator, "endobj\n");
        const resources_obj = obj_num;
        obj_num += 1;

        for (self.pages.items) |page| {
            try offsets.append(allocator, output.items.len);
            try appendFmt(&output, allocator, "{d} 0 obj\n", .{obj_num});
            try appendFmt(&output, allocator, "<< /Type /Page /Parent {d} 0 R ", .{pages_obj});
            try appendFmt(&output, allocator, "/MediaBox [0 0 {d:.2} {d:.2}] ", .{ page.size.width, page.size.height });
            try appendFmt(&output, allocator, "/Resources {d} 0 R ", .{resources_obj});
            try appendFmt(&output, allocator, "/Contents {d} 0 R >>\n", .{obj_num + 1});
            try appendBytes(&output, allocator, "endobj\n");
            obj_num += 1;

            try offsets.append(allocator, output.items.len);
            try appendFmt(&output, allocator, "{d} 0 obj\n", .{obj_num});
            try appendFmt(&output, allocator, "<< /Length {d} >>\n", .{page.content.items.len});
            try appendBytes(&output, allocator, "stream\n");
            try appendBytes(&output, allocator, page.content.items);
            try appendBytes(&output, allocator, "endstream\n");
            try appendBytes(&output, allocator, "endobj\n");
            obj_num += 1;
        }

        const xref_offset = output.items.len;
        try appendBytes(&output, allocator, "xref\n");
        try appendFmt(&output, allocator, "0 {d}\n", .{obj_num});
        try appendBytes(&output, allocator, "0000000000 65535 f \n");
        for (offsets.items) |offset| {
            try appendFmt(&output, allocator, "{d:0>10} 00000 n \n", .{offset});
        }

        try appendBytes(&output, allocator, "trailer\n");
        try appendFmt(&output, allocator, "<< /Size {d} /Root 1 0 R ", .{obj_num});
        if (self.title != null or self.author != null) {
            try appendBytes(&output, allocator, "/Info << ");
            if (self.title) |t| {
                try appendFmt(&output, allocator, "/Title ({s}) ", .{t});
            }
            if (self.author) |a| {
                try appendFmt(&output, allocator, "/Author ({s}) ", .{a});
            }
            try appendBytes(&output, allocator, ">> ");
        }
        try appendBytes(&output, allocator, ">>\n");
        try appendBytes(&output, allocator, "startxref\n");
        try appendFmt(&output, allocator, "{d}\n", .{xref_offset});
        try appendBytes(&output, allocator, "%%EOF\n");

        return output.toOwnedSlice(allocator);
    }

    pub fn save(self: *Document, io: std.Io, path: []const u8) !void {
        const data = try self.render(self.allocator);
        defer self.allocator.free(data);

        var file = try std.Io.Dir.cwd().createFile(io, path, .{});
        defer file.close(io);
        try file.writeStreamingAll(io, data);
    }
};
