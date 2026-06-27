// macOS port of linux.jai: same threaded reactor, but kqueue instead of epoll.
// No SSL/HTTPS here (the Linux file's openssl path is dropped) — plain HTTP only,
// which is all the learning-servers comparison needs.

BACKLOG               :: 1024;
MAX_EVENTS            :: BACKLOG;
REQUEST_BUFFER_LEN    :: 1024 * 2;

CORE_COUNT            :: #run -> int {
  #import "System";
  core_count := max(1, get_number_of_processors() / 2);
  mylog("setting CORE_COUNT (and THREAD_POOL_COUNT) to", core_count);
  return core_count;
}
THREAD_POOL_COUNT     :: CORE_COUNT;

thread_pool           : [THREAD_POOL_COUNT] Thread;
kqueue_fd_pool        : [THREAD_POOL_COUNT] s32;
kqueue_events_pool    : [THREAD_POOL_COUNT] [MAX_EVENTS] Kevent;

request_pool          : Table(Socket, Request);


// The Thread module only copies allocator/logger into a new thread's context, not
// print_style — so tprint() in a worker would assert (default_format_int.base == 0).
// Capture the main thread's fully-initialized context and run workers under it.
server_context: #Context;

listen_socket: Socket;
listen_called: bool;
http_listen :: (port: u16 = 80, ip: string = "0.0.0.0") {
  assert(!listen_called, "cannot call listen multiple times");
  listen_called = true;
  server_context = context;

  listen_socket = create_listen_socket(port, ip);
  log("HTTP Server listening on %:%", ip, port);

  // Pre-size so the table never reallocs while another thread reads it.
  init(*request_pool, BACKLOG+3);

  for * thread, i: thread_pool {
    kqueue_fd_pool[i] = kqueue();
    if kqueue_fd_pool[i] < 0  die("kqueue()");
    kq_change(kqueue_fd_pool[i], listen_socket, EVFILT_READ, EV_ADD);

    thread.data = xx i;
    thread_init(thread, thread_pool_proc);
    thread_start(thread);
  }
}

create_listen_socket :: (port: u16, ip: string) -> Socket {
  s := socket(AF_INET, .SOCK_STREAM, xx 0);
  if s < 0  die("listen socket()");

  setnonblocking(s);
  setsockopt(s, SO_REUSEADDR);
  setsocktcpopt(s, TCP_NODELAY);

  listen_addr: sockaddr_in;
  listen_addr.sin_family = AF_INET;
  listen_addr.sin_addr.s_addr = inet_addr(to_c_string(ip));
  listen_addr.sin_port = htons(port);
  if bind(s, cast(*sockaddr)*listen_addr, size_of(type_of(listen_addr))) < 0 {
    die("listen bind()", errno());
  }
  if listen(s, BACKLOG) < 0  die("listen listen()");

  return s;
}


thread_pool_proc :: (thread: *Thread) -> s64 {
  // Run under the main thread's context (for print_style etc.), but keep this
  // thread's own allocator + temporary storage that thread_init() set up.
  ctx := server_context;
  ctx.allocator         = context.allocator;
  ctx.temporary_storage = context.temporary_storage;

  push_context ctx {
    thread_id := cast(s32)thread.data;
    kq := kqueue_fd_pool[thread_id];
    events := *kqueue_events_pool[thread_id][0];

    client_addr: sockaddr_in;
    client_addr_len: socklen_t = size_of(type_of(client_addr));

    while 1 {
      nev := kevent(kq, null, 0, events, MAX_EVENTS, null);
      if nev < 0 {
        if errno() == EINTR continue;
        die("kevent()");
      }

      for i: 0 .. nev-1 {
        ev := events[i];
        fd := cast(s32) ev.ident;
        if fd <= 2 continue; // stdin/out/err, shouldn't show up but be safe

        // listen socket readable -> drain the accept queue
        if fd == listen_socket {
          while 1 {
            client_socket := accept(listen_socket, cast(*sockaddr)*client_addr, *client_addr_len);
            if client_socket < 0  break;

            setnonblocking(client_socket);
            setsocktcpopt(client_socket, TCP_NODELAY);
            kq_change(kq, client_socket, EVFILT_READ, EV_ADD);

            new_request_from_pool(client_socket);
            handle_client_socket_accepted_or_read_ready(client_socket, kq);
          }
          continue;
        }

        if ev.filter == EVFILT_READ {
          handle_client_socket_accepted_or_read_ready(fd, kq);
          continue;
        }

        if ev.filter == EVFILT_WRITE {
          request := table_find_pointer(*request_pool, fd);
          if !request || !request.write_data continue;
          continue_write(request);
          continue;
        }
      }

      tfree();
    }
  }

  return 0;
}

make_mysocket :: (socket: Socket) -> MySocket {
  mysocket: MySocket;
  mysocket.socket = socket;
  return mysocket;
}

new_request_from_pool :: (client_socket: Socket) -> *Request {
  request: *Request = find_or_add(*request_pool, client_socket);
  request.content_length = 0;
  request.body.data      = null;
  request.response_sent  = false;
  request.err            = false;
  request.socket         = make_mysocket(client_socket);
  request.buffercursor   = 0;
  request.startofline    = 0;

  request.websocket_key.data = null;
  request.websocket_key.count = 0;

  if !request.raw.data {
    request.raw = alloc_string(REQUEST_BUFFER_LEN);
  }
  request.raw.count = 0;

  #if parseheaders table_reset(*request.headers);

  return request;
}

handle_client_socket_accepted_or_read_ready :: (client_socket: Socket, kq: s32) {
  while 1 {
    ws := table_find_pointer(*all_websockets, client_socket);
    if ws {
      websocket_read_frame(ws);
      return;
    }

    request := read_http_request(client_socket);
    if request == null  return; // waiting on more data, come back later
    if request.err {
      close(client_socket);
      return;
    }

    request.kq = kq;
    handle_request(request);

    new_request_from_pool(client_socket); // reset for the next keep-alive request
  }
}


read_http_request :: (socket: Socket) -> *Request {
  request: *Request = table_find_pointer(*request_pool, socket);
  if request == null then die("no request for socket", socket);

  while 1 {
    bytes_received := mysocket_read(request.socket, request.raw.data + request.raw.count, xx(REQUEST_BUFFER_LEN - request.raw.count));

    if bytes_received < 0 && errno() == EWOULDBLOCK  return null;
    if bytes_received == 0 {
      if request.raw.count == REQUEST_BUFFER_LEN {
        mylog("ran out of request buffer space, dropping");
        send_text(request, tprint("Request too large. Max request size is % bytes.", REQUEST_BUFFER_LEN), status_code=413);
      }
      request.err = true;
      break;
    }
    if bytes_received < 0  { request.err = true; break; }


    request.raw.count += bytes_received;

    if request.body.data then request.body.count += bytes_received;


    bytes_read_this_chunk := 0;
    while request.body.data == null && request.buffercursor < request.raw.count - 1 {
      defer request.buffercursor+=1;
      defer bytes_read_this_chunk+=1;

      if request.raw[request.buffercursor] == #char "\r" && request.raw[request.buffercursor + 1] == #char "\n" {
        defer request.startofline = request.buffercursor + 2;

        line: string = ---;
        line.data = request.raw.data + request.startofline;
        line.count = request.buffercursor - request.startofline;

        if request.startofline == 0 {
          http_request_info := split(line, " ");
          request.method = to_METHOD(http_request_info[0]);
          request.path = http_request_info[1];
          continue;
        }

        kv := split(line, ": ");
        #if parseheaders table_add(*request.headers, kv[0], kv[1]);

        if kv[0] == {
          case "Content-Length";    request.content_length   = xx to_integer(kv[1]);
          case "Sec-WebSocket-Key"; request.websocket_key    = kv[1];
          case "Accept-Encoding";   request.accept_encoding  = kv[1];
        }

        if request.raw[request.buffercursor+2] == #char "\r" && request.raw[request.buffercursor+2 + 1] == #char "\n" {
          request.body.data = request.raw.data + request.buffercursor+4;
          request.body.count = bytes_received - bytes_read_this_chunk - 4;
          break;
        }
      }
    }

    if request.body.data && request.body.count == request.content_length then break;
  }

  return request;
}


continue_write :: (request: *Request) {
  while request.write_bytes_sent < request.write_data.count {
    remaining_bytes_to_write := substr(request.write_data, request.write_bytes_sent);
    bytes_written := mysocket_write(request.socket, remaining_bytes_to_write);

    if bytes_written < 0 {
      if errno() == EWOULDBLOCK {
        kq_change(request.kq, request.socket.socket, EVFILT_WRITE, EV_ADD);
        return;
      }
      mylog("error writing to socket:", errno());
      return;
    }

    request.write_bytes_sent += bytes_written;
  }

  free(request.write_data.data); request.write_data.data = null;
  // done writing: drop write interest, listen for the next request again
  kq_change(request.kq, request.socket.socket, EVFILT_WRITE, EV_DELETE);
}




setsockopt :: (socket: s32, option: s32, optval: s32 = 1) {
  if setsockopt(socket, SOL_SOCKET, option, *optval, size_of(type_of(optval))) < 0 {
    die("setsockopt err:", errno(), "socket:", socket, "option:", option, "val:", optval);
  }
}
setsocktcpopt :: (socket: s32, option: s32, optval: s32 = 1) {
  if setsockopt(socket, xx IPPROTO.TCP, option, *optval, size_of(type_of(optval))) < 0 {
    die("setsocktcpopt err:", errno(), "socket:", socket, "option:", option, "val:", optval);
  }
}
setnonblocking :: (fd: s32) {
  old_option := fcntl(fd, F_GETFL);
  new_option := old_option | O_NONBLOCK;
  fcntl(fd, F_SETFL, new_option);
}


// --- kqueue glue (replaces epoll_ctl / epoll_event) ---

Kevent :: struct {
  ident:  u64;
  filter: s16;
  flags:  u16;
  fflags: u32;
  data:   s64;
  udata:  *void;
}

EVFILT_READ  : s16 : -1;
EVFILT_WRITE : s16 : -2;
EV_ADD       : u16 : 0x0001;
EV_DELETE    : u16 : 0x0002;

// One change at a time, errors ignored: EV_DELETE of a filter that isn't
// registered returns ENOENT, which is fine — we just want it gone.
kq_change :: (kq: s32, fd: s32, filter: s16, flags: u16) {
  ev: Kevent;
  ev.ident  = cast(u64) fd;
  ev.filter = filter;
  ev.flags  = flags;
  kevent(kq, *ev, 1, null, 0, null);
}

libc :: #system_library "libc";
kqueue :: () -> s32 #foreign libc;
kevent :: (kq: s32, changelist: *Kevent, nchanges: s32, eventlist: *Kevent, nevents: s32, timeout: *void) -> s32 #foreign libc;


#import,dir "modules/mybasic";
#import,dir "modules/mysocket";

#import "POSIX";
#import "File";
#import "Thread";

TCP_NODELAY    :: 1;
