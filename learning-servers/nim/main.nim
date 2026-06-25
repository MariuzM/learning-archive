import std/net

proc main() =
  let server = newSocket()
  server.setSockOpt(OptReuseAddr, true)
  server.bindAddr(Port(8080), "127.0.0.1")
  server.listen()
  echo "Listening on http://127.0.0.1:8080"

  let body = "Hello from Nim!"
  let response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: " &
    $body.len & "\r\nConnection: close\r\n\r\n" & body

  while true:
    var client: Socket
    var address = ""
    server.acceptAddr(client, address)

    var request = ""
    discard client.recvLine()

    client.send(response)
    client.close()

main()
