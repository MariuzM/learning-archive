#include "json.hpp"

#include <drogon/drogon.h>

#include <cstdio>
#include <filesystem>
#include <fstream>
#include <functional>
#include <iostream>
#include <regex>
#include <set>
#include <sstream>
#include <string>
#include <vector>

using json = nlohmann::json;
using drogon::HttpRequestPtr;
using drogon::HttpResponse;
using drogon::HttpResponsePtr;

static std::string JPEG;
static std::vector<std::string> LINES;

constexpr int LINES_PER_PAGE = 45;
constexpr int FONT_SIZE = 11;
constexpr int LINE_STEP = 16;
constexpr int TOP_Y = 740;

static std::string read_file(const std::filesystem::path& p) {
    std::ifstream f(p, std::ios::binary);
    std::ostringstream ss;
    ss << f.rdbuf();
    return ss.str();
}

static std::string build_pdf(const std::string& heading) {
    std::vector<std::string> contents;
    contents.push_back("BT\n/F1 24 Tf\n72 720 Td\n(" + heading +
                       ") Tj\nET\nq\n240 0 0 160 72 520 cm\n/Im1 Do\nQ\n");

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
        char tmp[16];
        std::snprintf(tmp, sizeof(tmp), "%010zu", off);
        buf += tmp;
        buf += " 00000 n\r\n";
    }
    buf += "trailer\n<< /Size " + std::to_string(n + 1) +
           " /Root 1 0 R >>\nstartxref\n" + std::to_string(xref_off) +
           "\n%%EOF\n";
    return buf;
}

static const std::regex RE_USERNAME(R"(^[a-z0-9_]+$)");
static const std::regex RE_EMAIL(R"(^[^@\s]+@[^@\s]+\.[^@\s]+$)");
static const std::regex RE_SKU(R"(^[A-Z]{3}-[0-9]{3}$)");
static const std::regex RE_WEBSITE(R"(^https?://)");
static const std::set<std::string> COUNTRIES = {"US", "CA", "GB", "DE", "FR",
                                                "JP", "AU", "BR", "IN", "CN"};

static bool password_ok(const std::string& s) {
    bool lo = false, up = false, di = false;
    for (char c : s) {
        if (c >= 'a' && c <= 'z')
            lo = true;
        else if (c >= 'A' && c <= 'Z')
            up = true;
        else if (c >= '0' && c <= '9')
            di = true;
    }
    return lo && up && di;
}

static bool validate_payload(const json& j) {
    if (!j.is_object() || j.size() != 8)
        return false;
    for (const char* k : {"username", "email", "age", "password", "website",
                          "country", "tags", "items"}) {
        if (!j.contains(k))
            return false;
    }

    if (!j["username"].is_string())
        return false;
    std::string username = j["username"];
    if (username.size() < 3 || username.size() > 30 ||
        !std::regex_match(username, RE_USERNAME))
        return false;

    if (!j["email"].is_string())
        return false;
    std::string email = j["email"];
    if (email.size() > 100 || !std::regex_match(email, RE_EMAIL))
        return false;

    if (!j["age"].is_number_integer())
        return false;
    long age = j["age"];
    if (age < 13 || age > 120)
        return false;

    if (!j["password"].is_string())
        return false;
    std::string password = j["password"];
    if (password.size() < 8 || password.size() > 100 || !password_ok(password))
        return false;

    if (!j["website"].is_string())
        return false;
    std::string website = j["website"];
    if (website.size() > 200 || !std::regex_search(website, RE_WEBSITE))
        return false;

    if (!j["country"].is_string() ||
        !COUNTRIES.count(j["country"].get<std::string>()))
        return false;

    const json& tags = j["tags"];
    if (!tags.is_array() || tags.size() < 1 || tags.size() > 10)
        return false;
    for (const json& t : tags) {
        if (!t.is_string())
            return false;
        std::string s = t;
        if (s.size() < 1 || s.size() > 20)
            return false;
    }

    const json& items = j["items"];
    if (!items.is_array() || items.size() < 1 || items.size() > 50)
        return false;
    for (const json& it : items) {
        if (!it.is_object() || it.size() != 3)
            return false;
        if (!it.contains("sku") || !it.contains("qty") || !it.contains("price"))
            return false;
        if (!it["sku"].is_string() ||
            !std::regex_match(it["sku"].get<std::string>(), RE_SKU))
            return false;
        if (!it["qty"].is_number_integer())
            return false;
        long qty = it["qty"];
        if (qty < 1 || qty > 999)
            return false;
        if (!it["price"].is_number())
            return false;
        double price = it["price"];
        if (price < 0 || price > 100000)
            return false;
    }
    return true;
}

class App {
  public:
    using Callback = std::function<void(const HttpResponsePtr&)>;
    using Handler = std::function<void(const HttpRequestPtr&, Callback&&)>;

    App& get(const std::string& path, Handler h) {
        return route(path, drogon::Get, std::move(h));
    }
    App& post(const std::string& path, Handler h) {
        return route(path, drogon::Post, std::move(h));
    }
    App& put(const std::string& path, Handler h) {
        return route(path, drogon::Put, std::move(h));
    }
    App& del(const std::string& path, Handler h) {
        return route(path, drogon::Delete, std::move(h));
    }

    void listen(const std::string& host, uint16_t port) {
        std::cout << "listening on http://" << host << ":" << port << "\n";
        drogon::app()
            .addListener(host, port)
            .setThreadNum(4)
            .setLogLevel(trantor::Logger::kWarn)
            .run();
        std::cout << "shutting down\n";
    }

  private:
    App& route(const std::string& path, drogon::HttpMethod method, Handler h) {
        drogon::app().registerHandler(
            path,
            [h = std::move(h)](const HttpRequestPtr& req, Callback&& cb) {
                h(req, std::move(cb));
            },
            {method});
        return *this;
    }
};

static HttpResponsePtr text(const std::string& body) {
    auto res = HttpResponse::newHttpResponse();
    res->setContentTypeCodeAndCustomString(drogon::CT_TEXT_PLAIN,
                                           "content-type: text/plain; charset=utf-8\r\n");
    res->setBody(body);
    return res;
}

int main(int, char** argv) {
    std::filesystem::path exe = std::filesystem::weakly_canonical(argv[0]);
    std::filesystem::path assets =
        std::filesystem::weakly_canonical(exe.parent_path() / ".." / "assets");

    JPEG = read_file(assets / "sample.jpg");
    json content = json::parse(read_file(assets / "content.json"));
    for (const json& line : content["lines"])
        LINES.push_back(line.get<std::string>());

    App app;

    app.get("/", [](const HttpRequestPtr&, App::Callback&& cb) {
        cb(text("Hello from C++!\n"));
    });
    app.get("/hello", [](const HttpRequestPtr&, App::Callback&& cb) {
        cb(text("GET hello from C++!\n"));
    });
    app.post("/hello", [](const HttpRequestPtr&, App::Callback&& cb) {
        cb(text("POST hello from C++!\n"));
    });
    app.get("/pdf", [](const HttpRequestPtr&, App::Callback&& cb) {
        auto res = HttpResponse::newHttpResponse();
        res->setContentTypeCodeAndCustomString(
            drogon::CT_CUSTOM, "content-type: application/pdf\r\n");
        res->setBody(build_pdf("Hello from C++! PDF benchmark."));
        cb(res);
    });
    app.post("/validate", [](const HttpRequestPtr& req, App::Callback&& cb) {
        bool ok = false;
        try {
            ok = validate_payload(json::parse(req->getBody()));
        } catch (...) {
            ok = false;
        }
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(ok ? drogon::k200OK : drogon::k400BadRequest);
        res->setContentTypeCodeAndCustomString(
            drogon::CT_APPLICATION_JSON, "content-type: application/json\r\n");
        res->setBody(ok ? "{\"valid\":true}" : "{\"valid\":false}");
        cb(res);
    });

    app.listen("127.0.0.1", 8080);
    return 0;
}
