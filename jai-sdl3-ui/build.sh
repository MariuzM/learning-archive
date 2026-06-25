#!/bin/sh
# Build main.jai and link it against SDL3 / SDL3_ttf, then run it.
#
# Why a script instead of `jai build run`: this OpenJai compiler always links
# with a fixed command (-lSystem -lobjc) and does not turn #system_library
# declarations into linker flags. So we let it compile to an object file, then
# perform the final link ourselves with the SDL3 libraries added.

set -e

JAI_HOME="/Users/marius/Dev/jai"
SDL_LIBDIR="/opt/homebrew/lib"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Compile main.jai. The built-in link step fails (no SDL on its command line);
# that is expected. We grab the exact link command it printed and reuse it.
LINK="$("$JAI_HOME/bin/jai" build main.jai 2>&1 | sed -n 's/^command: //p' | head -1)"

if [ -z "$LINK" ] || [ ! -f build/main.o ]; then
    echo "Compilation failed:" >&2
    "$JAI_HOME/bin/jai" build main.jai
    exit 1
fi

# Redo the final link with SDL3 + SDL3_ttf and the macOS frameworks needed for
# the custom Metal render path (Metal/QuartzCore for the CAMetalLayer, Foundation
# for NSString, Cocoa for the NSView). -Wl,-w silences the harmless
# duplicate-library and macOS-version linker warnings.
eval "$LINK -L$SDL_LIBDIR -lSDL3 -lSDL3_ttf -framework Metal -framework QuartzCore -framework Foundation -framework Cocoa -Wl,-w"
rm -f build/main.o

echo "Built build/main"
exec ./build/main "$@"
