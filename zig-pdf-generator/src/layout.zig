const std = @import("std");

const pdf = @import("pdf.zig");

pub const Align = enum {
    left,
    center,
    right,
};

pub const Style = struct {
    font: pdf.Font = .Helvetica,
    font_size: f32 = 12,
    color: pdf.Color = pdf.Color.black,
    background: ?pdf.Color = null,
    border_color: ?pdf.Color = null,
    border_width: f32 = 1,
    padding: f32 = 0,
    margin_bottom: f32 = 0,
    text_align: Align = .left,
};

pub const Layout = struct {
    doc: *pdf.Document,
    page: *pdf.Page,
    page_size: pdf.PageSize,
    x: f32,
    y: f32,
    width: f32,
    margin: f32,
    margin_left: f32,
    margin_right: f32,
    margin_bottom: f32,

    pub fn init(doc: *pdf.Document, page: *pdf.Page, margin: f32) Layout {
        return Layout{
            .doc = doc,
            .page = page,
            .page_size = page.size,
            .x = margin,
            .y = page.size.height - margin,
            .width = page.size.width - margin * 2,
            .margin = margin,
            .margin_left = margin,
            .margin_right = margin,
            .margin_bottom = margin,
        };
    }

    fn newPage(self: *Layout) !void {
        self.page = try self.doc.addPage(self.page_size);
        self.y = self.page_size.height - self.margin;
    }

    // pub fn initWithMargins(page: *pdf.Page, top: f32, right: f32, bottom: f32, left: f32) Layout {
    //     _ = bottom;
    //     return Layout{
    //         .page = page,
    //         .x = left,
    //         .y = page.size.height - top,
    //         .width = page.size.width - left - right,
    //         .margin_left = left,
    //         .margin_right = right,
    //     };
    // }

    pub fn text(self: *Layout, content: []const u8, style: Style) !void {
        const total_padding = style.padding * 2;
        const content_width = self.width - total_padding;

        try self.page.setFont(style.font, style.font_size);
        const line_height = self.page.getLineHeight();
        const char_width = self.page.getCharWidth();
        const max_chars: usize = @intFromFloat(content_width / char_width);

        var remaining = content;

        while (remaining.len > 0) {
            const available_height = self.y - self.margin_bottom;

            if (available_height < line_height + total_padding) {
                try self.newPage();
                try self.page.setFont(style.font, style.font_size);
                continue;
            }

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

            const line = std.mem.trim(u8, remaining[0..line_end], " ");
            const block_height = line_height;

            try self.page.setFont(style.font, style.font_size);
            try self.page.setFillColor(style.color);

            var text_x = self.x + style.padding;
            if (style.text_align == .center) {
                const text_w = self.page.getTextWidth(line);
                if (text_w < content_width) {
                    text_x = self.x + (self.width - text_w) / 2;
                }
            } else if (style.text_align == .right) {
                const text_w = self.page.getTextWidth(line);
                if (text_w < content_width) {
                    text_x = self.x + self.width - style.padding - text_w;
                }
            }

            const descent_offset = style.font_size * 0.2;
            const text_y = self.y - line_height + (line_height - style.font_size) / 5 + descent_offset;

            try self.page.drawTextLine(line, text_x, text_y);

            self.y -= block_height;
            remaining = remaining[line_end..];
            if (remaining.len > 0 and remaining[0] == ' ') {
                remaining = remaining[1..];
            }
        }

        self.y -= style.margin_bottom;
    }

    pub fn heading(self: *Layout, content: []const u8, level: u8) !void {
        const sizes = [_]f32{ 32, 24, 20, 16, 14, 12 };
        const size = if (level > 0 and level <= 6) sizes[level - 1] else 16;

        try self.text(content, .{
            .font = .HelveticaBold,
            .font_size = size,
            .margin_bottom = size * 0.5,
        });
    }

    pub fn paragraph(self: *Layout, content: []const u8) !void {
        try self.text(content, .{
            .font = .Helvetica,
            .font_size = 12,
            .margin_bottom = 12,
        });
    }

    pub fn space(self: *Layout, height: f32) void {
        self.y -= height;
    }

    pub fn hr(self: *Layout, thickness: f32, color: pdf.Color) !void {
        try self.page.setStrokeColor(color);
        try self.page.setLineWidth(thickness);
        try self.page.drawLine(self.x, self.y, self.x + self.width, self.y);
        self.y -= thickness + 10;
    }

    // pub fn box(self: *Layout, style: Style, content_fn: *const fn (*Layout) anyerror!void) !void {
    //     const saved_x = self.x;
    //     const saved_width = self.width;
    //     const start_y = self.y;

    //     self.x += style.padding;
    //     self.width -= style.padding * 2;
    //     self.y -= style.padding;

    //     try content_fn(self);

    //     self.y -= style.padding;
    //     const block_height = start_y - self.y;

    //     if (style.background) |bg| {
    //         try self.page.setFillColor(bg);
    //         try self.page.drawFilledRect(saved_x, self.y, saved_width, block_height);
    //     }

    //     if (style.border_color) |border| {
    //         try self.page.setStrokeColor(border);
    //         try self.page.setLineWidth(style.border_width);
    //         try self.page.drawStrokedRect(saved_x, self.y, saved_width, block_height);
    //     }

    //     self.x = saved_x;
    //     self.width = saved_width;
    //     self.y -= style.margin_bottom;
    // }

    // pub fn columns(self: *Layout, count: usize, gap: f32, content_fns: []const *const fn (*Layout, usize) anyerror!void) !void {
    //     const col_width = (self.width - gap * @as(f32, @floatFromInt(count - 1))) / @as(f32, @floatFromInt(count));
    //     const start_y = self.y;
    //     var min_y = self.y;

    //     for (content_fns, 0..) |content_fn, i| {
    //         const saved_x = self.x;
    //         const saved_width = self.width;

    //         self.x = self.margin_left + @as(f32, @floatFromInt(i)) * (col_width + gap);
    //         self.width = col_width;
    //         self.y = start_y;

    //         try content_fn(self, i);

    //         if (self.y < min_y) min_y = self.y;

    //         self.x = saved_x;
    //         self.width = saved_width;
    //     }

    //     self.y = min_y;
    // }

    pub fn rect(self: *Layout, height: f32, style: Style) !void {
        const block_y = self.y - height;

        if (style.background) |bg| {
            try self.page.setFillColor(bg);
            try self.page.drawFilledRect(self.x, block_y, self.width, height);
        }

        if (style.border_color) |border| {
            try self.page.setStrokeColor(border);
            try self.page.setLineWidth(style.border_width);
            try self.page.drawStrokedRect(self.x, block_y, self.width, height);
        }

        self.y = block_y - style.margin_bottom;
    }

    // pub fn currentY(self: *Layout) f32 {
    //     return self.y;
    // }

    // pub fn remainingHeight(self: *Layout) f32 {
    //     return self.y;
    // }

};
