CXX ?= c++
CXXFLAGS := -std=c++17 -O2 -pthread -Ivendor

server: src/main.cpp vendor/httplib.h vendor/json.hpp
	$(CXX) $(CXXFLAGS) src/main.cpp -o server

run: server
	./server

clean:
	rm -f server
