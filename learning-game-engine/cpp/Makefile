CXX ?= c++
SDL_CFLAGS := $(shell pkg-config --cflags sdl3)
SDL_LIBS := $(shell pkg-config --libs sdl3)
CXXFLAGS := -std=c++17 -O2 -Wall $(SDL_CFLAGS)

game: src/main.cpp
	$(CXX) $(CXXFLAGS) src/main.cpp -o game $(SDL_LIBS)

run: game
	./game

clean:
	rm -f game game_opt game_static
