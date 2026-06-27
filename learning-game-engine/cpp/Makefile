CXX ?= c++
SDL_CFLAGS := $(shell pkg-config --cflags sdl3 sdl3-ttf)
SDL_LIBS := $(shell pkg-config --libs sdl3 sdl3-ttf)
CXXFLAGS := -std=c++17 -O2 -Wall $(SDL_CFLAGS)

BUILD_DIR := build
BIN := $(BUILD_DIR)/game

$(BIN): src/main.cpp | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) src/main.cpp -o $(BIN) $(SDL_LIBS)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

run: $(BIN)
	./$(BIN)

clean:
	rm -rf $(BUILD_DIR)

.PHONY: run clean
