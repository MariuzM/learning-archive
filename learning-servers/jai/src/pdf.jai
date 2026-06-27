#import "Basic";
#import "File";

LINES_PER_PAGE :: 45;
FONT_SIZE      :: 11;
LINE_STEP      :: 16;
TOP_Y          :: 740;

JPEG :: #run read_asset();
read_asset :: () -> string {
    data, ok := read_entire_file(tprint("%/../../assets/sample.jpg", #filepath));
    assert(ok, "could not read assets/sample.jpg at compile time");
    return data;
}

CONTENT :: #run read_content();
read_content :: () -> string {
    data, ok := read_entire_file(tprint("%/../../assets/content.json", #filepath));
    assert(ok, "could not read assets/content.json at compile time");
    return data;
}

LINES: [..]string;

parse_lines :: (data: string) -> [..]string {
    result: [..]string;
    i := 0;
    while i < data.count && data[i] != #char "["  i += 1;
    i += 1;
    while i < data.count {
        while i < data.count && data[i] != #char "\"" && data[i] != #char "]"  i += 1;
        if i >= data.count || data[i] == #char "]"  break;
        i += 1;
        start := i;
        while i < data.count && data[i] != #char "\""  i += 1;
        line: string = ---;
        line.data = data.data + start;
        line.count = i - start;
        array_add(*result, line);
        i += 1;
    }
    return result;
}

to_string :: (a: [..]u8) -> string {
    s: string = ---;
    s.data = a.data;
    s.count = a.count;
    return s;
}

pdf_append :: (buf: *[..]u8, s: string) {
    old := buf.count;
    array_resize(buf, buf.count + s.count);
    memcpy(buf.data + old, s.data, s.count);
}

pdf_append_int :: (buf: *[..]u8, n: int) {
    if n == 0 { array_add(buf, #char "0"); return; }
    digits: [20]u8;
    i := 0;
    v := n;
    while v > 0 { digits[i] = cast(u8)(#char "0" + (v % 10)); v /= 10; i += 1; }
    while i > 0 { i -= 1; array_add(buf, digits[i]); }
}

pdf_append_pad10 :: (buf: *[..]u8, n: int) {
    digits: [10]u8;
    v := n;
    i := 9;
    while i >= 0 { digits[i] = cast(u8)(#char "0" + (v % 10)); v /= 10; i -= 1; }
    for 0..9  array_add(buf, digits[it]);
}

pdf :: (body: string) -> Response {
    return .{ content_type = "application/pdf", body = build_pdf("Hello from Jai! PDF benchmark."), free_body = true };
}

build_pdf :: (heading: string) -> string {
    contents: [..]string;

    cover: [..]u8;
    pdf_append(*cover, "BT\n/F1 24 Tf\n72 720 Td\n(");
    pdf_append(*cover, heading);
    pdf_append(*cover, ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n");
    array_add(*contents, to_string(cover));

    p := 0;
    while p * LINES_PER_PAGE < LINES.count {
        stop := min((p + 1) * LINES_PER_PAGE, LINES.count);
        c: [..]u8;
        pdf_append(*c, "BT\n/F1 ");
        pdf_append_int(*c, FONT_SIZE);
        pdf_append(*c, " Tf\n72 ");
        pdf_append_int(*c, TOP_Y);
        pdf_append(*c, " Td\n");
        for j: (p * LINES_PER_PAGE)..(stop - 1) {
            if j == p * LINES_PER_PAGE {
                pdf_append(*c, "(");
            } else {
                pdf_append(*c, "0 -");
                pdf_append_int(*c, LINE_STEP);
                pdf_append(*c, " Td\n(");
            }
            pdf_append(*c, LINES[j]);
            pdf_append(*c, ") Tj\n");
        }
        pdf_append(*c, "ET\n");
        array_add(*contents, to_string(c));
        p += 1;
    }
    num_pages := contents.count;

    objects: [..]string;
    array_add(*objects, copy_string("<< /Type /Catalog /Pages 2 0 R >>"));
    {
        o: [..]u8;
        pdf_append(*o, "<< /Type /Pages /Kids [");
        for k: 0..num_pages-1 {
            if k > 0  pdf_append(*o, " ");
            pdf_append_int(*o, 5 + 2 * k);
            pdf_append(*o, " 0 R");
        }
        pdf_append(*o, "] /Count ");
        pdf_append_int(*o, num_pages);
        pdf_append(*o, " >>");
        array_add(*objects, to_string(o));
    }
    array_add(*objects, copy_string("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));
    {
        o: [..]u8;
        pdf_append(*o, "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ");
        pdf_append_int(*o, JPEG.count);
        pdf_append(*o, " >>\nstream\n");
        pdf_append(*o, JPEG);
        pdf_append(*o, "\nendstream");
        array_add(*objects, to_string(o));
    }
    for k: 0..num_pages-1 {
        po: [..]u8;
        pdf_append(*po, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents ");
        pdf_append_int(*po, 6 + 2 * k);
        pdf_append(*po, " 0 R >>");
        array_add(*objects, to_string(po));

        co: [..]u8;
        pdf_append(*co, "<< /Length ");
        pdf_append_int(*co, contents[k].count);
        pdf_append(*co, " >>\nstream\n");
        pdf_append(*co, contents[k]);
        pdf_append(*co, "endstream");
        array_add(*objects, to_string(co));
    }

    buf: [..]u8;
    pdf_append(*buf, "%PDF-1.4\n%");
    array_add(*buf, 0xe2); array_add(*buf, 0xe3); array_add(*buf, 0xcf); array_add(*buf, 0xd3);
    array_add(*buf, #char "\n");

    offsets: [..]int;
    for obj, i: objects {
        array_add(*offsets, buf.count);
        pdf_append_int(*buf, i + 1);
        pdf_append(*buf, " 0 obj\n");
        pdf_append(*buf, obj);
        pdf_append(*buf, "\nendobj\n");
    }
    xref_off := buf.count;
    n := objects.count;
    pdf_append(*buf, "xref\n0 ");
    pdf_append_int(*buf, n + 1);
    pdf_append(*buf, "\n0000000000 65535 f\r\n");
    for off: offsets {
        pdf_append_pad10(*buf, off);
        pdf_append(*buf, " 00000 n\r\n");
    }
    pdf_append(*buf, "trailer\n<< /Size ");
    pdf_append_int(*buf, n + 1);
    pdf_append(*buf, " /Root 1 0 R >>\nstartxref\n");
    pdf_append_int(*buf, xref_off);
    pdf_append(*buf, "\n%%EOF\n");

    for contents  free(it.data);
    for objects   free(it.data);
    array_free(contents);
    array_free(objects);
    array_free(offsets);

    return to_string(buf);
}
