#load "app.jai";
#load "pdf.jai";
#load "validate.jai";

PORT :: 8080;

root :: (body: string) -> Response {
    return .{ body = "Hello from Jai!\n" };
}

hello_get :: (body: string) -> Response {
    return .{ body = "GET hello from Jai!\n" };
}

hello_post :: (body: string) -> Response {
    return .{ body = "POST hello from Jai!\n" };
}

validate :: (body: string) -> Response {
    if validate_payload(body) {
        return .{ content_type = "application/json", body = "{\"valid\":true}" };
    }
    return .{ status = 400, content_type = "application/json", body = "{\"valid\":false}" };
}

main :: () {
    app: Http_Server;

    if !http_listen(*app, PORT) {
        return;
    }

    app_get(*app, "/", root);
    app_get(*app, "/hello", hello_get);
    app_post(*app, "/hello", hello_post);
    app_get(*app, "/pdf", pdf);
    app_post(*app, "/validate", validate);

    print("listening on http://127.0.0.1:%\n", PORT);

    http_run(*app);
}
