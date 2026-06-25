const std = @import("std");

const app_name = "LutToProfile.app";

const info_plist =
    \\<?xml version="1.0" encoding="UTF-8"?>
    \\<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    \\<plist version="1.0">
    \\<dict>
    \\  <key>CFBundleName</key>            <string>LUT to Profile</string>
    \\  <key>CFBundleDisplayName</key>     <string>LUT to Profile</string>
    \\  <key>CFBundleExecutable</key>      <string>LutToProfile</string>
    \\  <key>CFBundleIdentifier</key>      <string>dev.marius.luttoprofile</string>
    \\  <key>CFBundleVersion</key>         <string>1.0</string>
    \\  <key>CFBundleShortVersionString</key> <string>1.0</string>
    \\  <key>CFBundlePackageType</key>     <string>APPL</string>
    \\  <key>LSMinimumSystemVersion</key>  <string>11.0</string>
    \\  <key>NSHighResolutionCapable</key> <true/>
    \\  <key>NSPrincipalClass</key>        <string>NSApplication</string>
    \\</dict>
    \\</plist>
    \\
;

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // ---- CLI (built on demand via `zig build run` / `zig build cli`) ----
    const cli = b.addExecutable(.{
        .name = "lut2profile",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main_cli.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    const install_cli = b.addInstallArtifact(cli, .{});
    b.step("cli", "Build the CLI into zig-out/bin/").dependOn(&install_cli.step);

    const run_cli = b.addRunArtifact(cli);
    if (b.args) |args| run_cli.addArgs(args);
    b.step("run-cli", "Run the CLI (pass args after --)").dependOn(&run_cli.step);

    // ---- Unit tests ----
    const tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/tests.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.step("test", "Run unit tests").dependOn(&b.addRunArtifact(tests).step);

    // ---- GUI (webview) ----
    const gui_mod = b.createModule(.{
        .root_source_file = b.path("src/main_gui.zig"),
        .target = target,
        .optimize = optimize,
    });
    gui_mod.link_libc = true;
    gui_mod.link_libcpp = true;
    gui_mod.addIncludePath(b.path("vendor/webview"));
    gui_mod.addCSourceFile(.{
        .file = b.path("vendor/webview/webview_impl.cc"),
        .flags = &.{ "-std=c++17", "-DWEBVIEW_COCOA", "-DWEBVIEW_STATIC" },
    });
    gui_mod.linkFramework("WebKit", .{});
    gui_mod.linkFramework("Cocoa", .{});
    gui_mod.addAnonymousImport("index.html", .{ .root_source_file = b.path("web/index.html") });

    const gui = b.addExecutable(.{
        .name = "LutToProfile",
        .root_module = gui_mod,
    });

    // ---- Assemble the .app bundle as the default `zig build` output ----
    // Executable -> Contents/MacOS/, Info.plist -> Contents/
    const install_bin = b.addInstallArtifact(gui, .{
        .dest_dir = .{ .override = .{ .custom = app_name ++ "/Contents/MacOS" } },
    });

    const wf = b.addWriteFiles();
    const plist = wf.add("Info.plist", info_plist);
    const install_plist = b.addInstallFile(plist, app_name ++ "/Contents/Info.plist");

    // Ad-hoc codesign the finished bundle so it launches cleanly.
    const sign = b.addSystemCommand(&.{ "codesign", "--force", "--deep", "--sign", "-" });
    sign.addArg(b.getInstallPath(.prefix, app_name));
    sign.step.dependOn(&install_bin.step);
    sign.step.dependOn(&install_plist.step);

    // Default `zig build` produces zig-out/LutToProfile.app
    b.getInstallStep().dependOn(&sign.step);

    // ---- `zig build run` (and `gui`): build the .app, then launch it ----
    const run_gui = b.addSystemCommand(&.{"open"});
    run_gui.addArg(b.getInstallPath(.prefix, app_name));
    run_gui.step.dependOn(&sign.step);
    b.step("run", "Build the .app and launch it").dependOn(&run_gui.step);
    b.step("gui", "Build the .app and launch it").dependOn(&run_gui.step);
}
