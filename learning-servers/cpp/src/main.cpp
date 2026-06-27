#include "app.hpp"
#include "json.hpp"
#include "pdf.hpp"
#include "validate.hpp"

#include <filesystem>
#include <fstream>
#include <sstream>
#include <string>

using json = nlohmann::json;

static std::string read_file(const std::filesystem::path& p) {
    std::ifstream f(p, std::ios::binary);
    std::ostringstream ss;
    ss << f.rdbuf();
    return ss.str();
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
        cb(respond(drogon::k200OK, drogon::CT_CUSTOM,
                   "content-type: application/pdf\r\n",
                   build_pdf("Hello from C++! PDF benchmark.")));
    });
    app.post("/validate", [](const HttpRequestPtr& req, App::Callback&& cb) {
        bool ok = false;
        try {
            ok = validate_payload(json::parse(req->getBody()));
        } catch (...) {
            ok = false;
        }
        cb(respond(ok ? drogon::k200OK : drogon::k400BadRequest, drogon::CT_APPLICATION_JSON,
                   "content-type: application/json\r\n",
                   ok ? "{\"valid\":true}" : "{\"valid\":false}"));
    });

    app.listen("127.0.0.1", 8080);
    return 0;
}
