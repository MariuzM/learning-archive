#include "pdf.hpp"

#include <array>
#include <cstdint>
#include <cstdio>

std::string JPEG;
std::vector<std::string> LINES;

constexpr int LINES_PER_PAGE = 45;
constexpr int FONT_SIZE = 11;
constexpr int LINE_STEP = 16;
constexpr int TOP_Y = 740;

std::string build_pdf(std::string_view heading) {
    std::vector<std::string> contents;
    std::string cover = "BT\n/F1 24 Tf\n72 720 Td\n(";
    cover += heading;
    cover += ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n";
    contents.push_back(std::move(cover));

    for (size_t p = 0; p * LINES_PER_PAGE < LINES.size(); ++p) {
        std::string s = "BT\n/F1 " + std::to_string(FONT_SIZE) + " Tf\n72 " +
                        std::to_string(TOP_Y) + " Td\n";
        size_t start = p * LINES_PER_PAGE;
        size_t stop = std::min(start + LINES_PER_PAGE, LINES.size());
        for (size_t j = start; j < stop; ++j) {
            if (j == start)
                s += "(" + LINES[j] + ") Tj\n";
            else
                s += "0 -" + std::to_string(LINE_STEP) + " Td\n(" + LINES[j] + ") Tj\n";
        }
        s += "ET\n";
        contents.push_back(std::move(s));
    }
    size_t num_pages = contents.size();

    std::vector<std::string> objects;
    objects.push_back("<< /Type /Catalog /Pages 2 0 R >>");

    std::string kids;
    for (size_t k = 0; k < num_pages; ++k) {
        if (k)
            kids += " ";
        kids += std::to_string(5 + 2 * k) + " 0 R";
    }
    objects.push_back("<< /Type /Pages /Kids [" + kids + "] /Count " +
                      std::to_string(num_pages) + " >>");
    objects.push_back("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

    std::string img =
        "<< /Type /XObject /Subtype /Image /Width 240 /Height 160 /ColorSpace "
        "/DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " +
        std::to_string(JPEG.size()) + " >>\nstream\n";
    img += JPEG;
    img += "\nendstream";
    objects.push_back(std::move(img));

    for (size_t k = 0; k < num_pages; ++k) {
        objects.push_back(
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << "
            "/Font << /F1 3 0 R >> /XObject << /Im1 4 0 R >> >> /Contents " +
            std::to_string(6 + 2 * k) + " 0 R >>");
        const std::string& c = contents[k];
        objects.push_back("<< /Length " + std::to_string(c.size()) +
                          " >>\nstream\n" + c + "endstream");
    }

    std::string buf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
    std::vector<size_t> offsets;
    for (size_t i = 0; i < objects.size(); ++i) {
        offsets.push_back(buf.size());
        buf += std::to_string(i + 1) + " 0 obj\n" + objects[i] + "\nendobj\n";
    }
    size_t xref_off = buf.size();
    size_t n = objects.size();
    buf += "xref\n0 " + std::to_string(n + 1) + "\n0000000000 65535 f\r\n";
    for (size_t off : offsets) {
        std::array<char, 16> tmp;
        std::snprintf(tmp.data(), tmp.size(), "%010zu", off);
        buf += tmp.data();
        buf += " 00000 n\r\n";
    }
    buf += "trailer\n<< /Size " + std::to_string(n + 1) +
           " /Root 1 0 R >>\nstartxref\n" + std::to_string(xref_off) +
           "\n%%EOF\n";
    return buf;
}
