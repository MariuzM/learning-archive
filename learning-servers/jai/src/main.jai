#load "lib.jai";

PORT :: 8080;
BODY :: "Hello from Jai!\n";

main :: () {
    server: Http_Server;

    if !http_listen(*server, PORT) {
        return;
    }

    server.response = sprint("HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: %\r\nConnection: close\r\n\r\n%", BODY.count, BODY);
    server.pdf_text = "Hello from Jai! PDF benchmark.";

    print("listening on http://127.0.0.1:%\n", PORT);

    http_run(*server);
}
