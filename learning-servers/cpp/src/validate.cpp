#include "validate.hpp"

#include <cstdint>
#include <regex>
#include <set>
#include <string>
#include <string_view>

using json = nlohmann::json;

static const std::regex RE_USERNAME(R"(^[a-z0-9_]+$)");
static const std::regex RE_EMAIL(R"(^[^@\s]+@[^@\s]+\.[^@\s]+$)");
static const std::regex RE_SKU(R"(^[A-Z]{3}-[0-9]{3}$)");
static const std::regex RE_WEBSITE(R"(^https?://)");
static const std::set<std::string> COUNTRIES = {"US", "CA", "GB", "DE", "FR",
                                                "JP", "AU", "BR", "IN", "CN"};

static bool password_ok(std::string_view s) {
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

bool validate_payload(const json& j) {
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
    int64_t age = j["age"];
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
        int64_t qty = it["qty"];
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
