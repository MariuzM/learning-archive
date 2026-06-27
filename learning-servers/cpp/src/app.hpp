#pragma once

#include <drogon/drogon.h>

#include <cstdint>
#include <functional>
#include <iostream>
#include <string>
#include <string_view>

using drogon::HttpRequestPtr;
using drogon::HttpResponse;
using drogon::HttpResponsePtr;

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

inline HttpResponsePtr respond(drogon::HttpStatusCode status, drogon::ContentType ctype,
                               std::string_view ctstr, std::string body) {
    auto res = HttpResponse::newHttpResponse();
    res->setStatusCode(status);
    res->setContentTypeCodeAndCustomString(ctype, ctstr);
    res->setBody(std::move(body));
    return res;
}

inline HttpResponsePtr text(std::string_view body) {
    return respond(drogon::k200OK, drogon::CT_TEXT_PLAIN,
                   "content-type: text/plain; charset=utf-8\r\n", std::string(body));
}
