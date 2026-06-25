#import "Basic";
#import "Socket";
#import "POSIX";

main :: () {
    server := socket(AF_INET, .SOCK_STREAM, 0);
    if server < 0 {
        print("failed to create socket\n");
        return;
    }

    opt: s32 = 1;
    setsockopt(server, SOL_SOCKET, SO_REUSEADDR, *opt, size_of(s32));

    addr: sockaddr_in;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(8080);
    addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

    if bind(server, cast(*sockaddr) *addr, size_of(sockaddr_in)) < 0 {
        print("bind failed\n");
        return;
    }

    listen(server, 16);
    print("Listening on http://127.0.0.1:8080\n");

    body := "Hello from Jai!";
    response := tprint("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: %\r\nConnection: close\r\n\r\n%", body.count, body);

    while true {
        client := accept(server, null, null);
        if client < 0  continue;

        buffer: [1024] u8;
        recv(client, buffer.data, buffer.count, 0);

        send(client, response.data, cast(u64) response.count, 0);
        close(client);
    }
}
