BUILD := build
DEPS := .deps/prefix
BREW := $(shell brew --prefix)/opt

server: $(BUILD)/server
	cp $(BUILD)/server server

$(DEPS)/lib/libdrogon.a:
	./deps.sh

$(BUILD)/server: src/main.cpp CMakeLists.txt $(DEPS)/lib/libdrogon.a
	cmake -S . -B $(BUILD) -DCMAKE_PREFIX_PATH="$(abspath $(DEPS));$(BREW)/openssl@3;$(BREW)/brotli;$(BREW)/c-ares"
	cmake --build $(BUILD) -j

run: server
	./server

clean:
	rm -rf $(BUILD) server

distclean: clean
	rm -rf .deps
