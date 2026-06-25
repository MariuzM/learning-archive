const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.resolveTargetQuery(.{
        .cpu_arch = .wasm32,
        .os_tag = .freestanding,
    });
    // Default to the smallest build; still overridable with -Doptimize=...
    const optimize = b.option(
        std.builtin.OptimizeMode,
        "optimize",
        "Optimization mode (default ReleaseSmall)",
    ) orelse .ReleaseSmall;

    const exe = b.addExecutable(.{
        .name = "main",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });

    exe.entry = .disabled;
    exe.rdynamic = true;

    // C source compiled by Zig's bundled clang into the same wasm module.
    exe.root_module.addCSourceFile(.{
        .file = b.path("src/fingerprint.c"),
        .flags = &.{"-std=c11"},
    });

    // --- Zig output -> build/zig (the default `zig build`) ---
    const zig_dir = b.pathFromRoot("build/zig");
    const zig_mkdir = b.addSystemCommand(&.{ "mkdir", "-p", zig_dir });

    const zig_wasm = b.addSystemCommand(&.{"cp"});
    zig_wasm.addFileArg(exe.getEmittedBin());
    zig_wasm.addArg(b.pathFromRoot("build/zig/main.wasm"));
    zig_wasm.step.dependOn(&zig_mkdir.step);

    const zig_html = b.addSystemCommand(&.{"cp"});
    zig_html.addFileArg(b.path("web/index.html"));
    zig_html.addArg(b.pathFromRoot("build/zig/index.html"));
    zig_html.step.dependOn(&zig_mkdir.step);

    b.getInstallStep().dependOn(&zig_wasm.step);
    b.getInstallStep().dependOn(&zig_html.step);

    // --- Odin output -> build/odin (`zig build odin`) ---
    // Odin's default (-o:minimal) is the smallest it produces for this module.
    const odin_step = b.step("odin", "Build the Odin port to build/odin");
    const odin_dir = b.pathFromRoot("build/odin");
    const odin_mkdir = b.addSystemCommand(&.{ "mkdir", "-p", odin_dir });

    const odin_cmd = b.addSystemCommand(&.{
        "odin",                        "build",
        "src/main.odin",               "-file",
        "-target:freestanding_wasm32", "-no-entry-point",
    });
    odin_cmd.addArg(b.fmt("-out:{s}", .{b.pathFromRoot("build/odin/main.wasm")}));
    odin_cmd.step.dependOn(&odin_mkdir.step);

    const odin_html = b.addSystemCommand(&.{"cp"});
    odin_html.addFileArg(b.path("web/index.html"));
    odin_html.addArg(b.pathFromRoot("build/odin/index.html"));
    odin_html.step.dependOn(&odin_mkdir.step);

    odin_step.dependOn(&odin_cmd.step);
    odin_step.dependOn(&odin_html.step);

    // --- build both at once ---
    const all_step = b.step("all", "Build both the Zig and Odin versions");
    all_step.dependOn(b.getInstallStep());
    all_step.dependOn(odin_step);

    // --- serve helpers ---
    const serve = b.step("serve", "Build Zig and serve build/zig on :8000");
    const serve_run = b.addSystemCommand(&.{
        "python3", "-m", "http.server", "8000", "--directory", zig_dir,
    });
    serve_run.step.dependOn(b.getInstallStep());
    serve.dependOn(&serve_run.step);

    const serve_odin = b.step("serve-odin", "Build Odin and serve build/odin on :8000");
    const serve_odin_run = b.addSystemCommand(&.{
        "python3", "-m", "http.server", "8000", "--directory", odin_dir,
    });
    serve_odin_run.step.dependOn(odin_step);
    serve_odin.dependOn(&serve_odin_run.step);
}
