#!/usr/bin/env bash
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$HERE/.deps"
PREFIX="$WORK/prefix"
BREW="$(brew --prefix)/opt"
mkdir -p "$WORK"

if [ -f "$PREFIX/lib/libdrogon.a" ]; then
  echo "static deps already built at $PREFIX"
  exit 0
fi

echo "==> jsoncpp (static)"
cd "$WORK"
[ -d jsoncpp ] || git clone --depth 1 --branch 1.9.6 https://github.com/open-source-parsers/jsoncpp
cmake -S jsoncpp -B jsoncpp/build \
  -DCMAKE_INSTALL_PREFIX="$PREFIX" \
  -DBUILD_SHARED_LIBS=OFF -DBUILD_STATIC_LIBS=ON \
  -DJSONCPP_WITH_TESTS=OFF -DJSONCPP_WITH_POST_BUILD_UNITTEST=OFF \
  -DCMAKE_BUILD_TYPE=Release -DCMAKE_POLICY_VERSION_MINIMUM=3.5
cmake --build jsoncpp/build -j --target install

echo "==> drogon + trantor (static)"
cd "$WORK"
[ -d drogon ] || git clone --recurse-submodules --depth 1 --branch v1.9.13 https://github.com/drogonframework/drogon
cmake -S drogon -B drogon/build \
  -DCMAKE_INSTALL_PREFIX="$PREFIX" \
  -DBUILD_SHARED_LIBS=OFF \
  -DBUILD_EXAMPLES=OFF -DBUILD_CTL=OFF -DBUILD_TESTING=OFF \
  -DBUILD_POSTGRESQL=OFF -DBUILD_MYSQL=OFF -DBUILD_SQLITE=OFF -DBUILD_REDIS=OFF \
  -DCMAKE_DISABLE_FIND_PACKAGE_Brotli=TRUE \
  -DCMAKE_DISABLE_FIND_PACKAGE_c-ares=TRUE \
  -DCMAKE_BUILD_TYPE=Release -DOPENSSL_USE_STATIC_LIBS=TRUE \
  -DCMAKE_PREFIX_PATH="$PREFIX;$BREW/openssl@3"
cmake --build drogon/build -j --target install

echo "done: $PREFIX"
